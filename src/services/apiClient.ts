export type UploadResponse = {
  workbook_id: string
  sheet_name: string
  sheet_names: string[]
  columns: string[]
}

export type AnalysisStep = {
  node: string
  title: string
  status: string
  summary: string
  details: {
    sheet_name?: string
    target?: string
    attempt?: number
    tasks?: { task_id: string; target: string; operation: string }[]
    queries?: { task_id: string; target: string; sql: string; parameters: unknown[] }[]
    results?: QueryResult[]
    validation_result?: string
  }
}

export type QueryResult = {
  task_id: string
  status: string
  columns: string[]
  rows: (string | number | boolean | null)[][]
  row_count: number
  preview_count: number
  truncated: boolean
  error: string
}

export type ChatEvent =
  | { type: 'start'; data: { workbook_id: string; conversation_id: string } }
  | { type: 'step'; data: AnalysisStep }
  | { type: 'token'; data: { text: string } }
  | { type: 'done'; data: { status: string; answer: string; error: string } }
  | { type: 'error'; data: { error: string } }

async function responseError(response: Response): Promise<Error> {
  const body = await response.json().catch(() => null) as { detail?: string } | null
  return new Error(body?.detail || `请求失败（HTTP ${response.status}）`)
}

export async function uploadWorkbook(file: File, sheetName?: string): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  if (sheetName) form.append('sheet_name', sheetName)
  const response = await fetch('/api/v1/workbooks/upload', { method: 'POST', body: form })
  if (!response.ok) throw await responseError(response)
  return response.json() as Promise<UploadResponse>
}

export async function streamChat(
  workbookId: string,
  question: string,
  conversationId: string | null,
  onEvent: (event: ChatEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const response = await fetch('/api/v1/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workbook_id: workbookId, question, conversation_id: conversationId }),
    signal,
  })
  if (!response.ok) throw await responseError(response)
  if (!response.body) throw new Error('服务器未返回流式响应。')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true })
      buffer = buffer.replace(/\r\n/g, '\n')
      let boundary = buffer.indexOf('\n\n')
      while (boundary >= 0) {
        const block = buffer.slice(0, boundary)
        buffer = buffer.slice(boundary + 2)
        const event = block.match(/^event:\s*(.+)$/m)?.[1]
        const data = block.split('\n').filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart()).join('\n')
        if (event && data) onEvent({ type: event, data: JSON.parse(data) } as ChatEvent)
        boundary = buffer.indexOf('\n\n')
      }
      if (done) break
    }
  } finally {
    reader.releaseLock()
  }
}
