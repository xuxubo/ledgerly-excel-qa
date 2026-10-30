import {useRef, useState} from 'react'
import type {Message} from '../types/conversation'
import type {AnalysisResult} from '../types/analysis'
import {streamChat} from '../services/apiClient'

const emptyResult = (): AnalysisResult => ({
    status: 'running', conclusion: '', steps: [], results: [], error: '',
})

export function useConversation(workbookId?: string) {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const conversationId = useRef<string | null>(null)
    const controller = useRef<AbortController | null>(null)
    const turn = useRef(0)

    const reset = () => {
        turn.current += 1
        controller.current?.abort()
        controller.current = null
        conversationId.current = null
        setMessages([])
        setLoading(false)
    }

    const ask = async (question: string) => {
        const text = question.trim()
        if (!workbookId || !text || controller.current) return
        const currentTurn = ++turn.current
        const abort = new AbortController()
        controller.current = abort
        setLoading(true)
        const id = crypto.randomUUID()
        let result = emptyResult()
        let completed = false
        const publish = () => setMessages((previous) => previous.map((message) =>
            message.id === `${id}-a` ? {...message, content: result.conclusion, result: {...result}} : message))
        setMessages((previous) => [...previous,
            {id: `${id}-q`, role: 'user', content: text},
            {id: `${id}-a`, role: 'assistant', content: '', result}])
        try {
            await streamChat(workbookId, text, conversationId.current, (event) => {
                if (currentTurn !== turn.current) return
                switch (event.type) {
                    case 'start':
                        conversationId.current = event.data.conversation_id
                        break
                    case 'step':
                        result = {...result, steps: [...result.steps, event.data]}
                        if (event.data.node === 'execute_sql' && event.data.details.results) {
                            result = {...result, results: event.data.details.results}
                        }
                        publish()
                        break
                    case 'token':
                        result = {...result, conclusion: result.conclusion + event.data.text}
                        publish()
                        break
                    case 'done':
                        completed = true
                        result = {...result,
                            status: event.data.status === 'success' ? 'success'
                                : event.data.status === 'needs_clarification' ? 'needs_clarification' : 'error',
                            conclusion: event.data.answer || result.conclusion,
                            error: event.data.error}
                        publish()
                        break
                    case 'error':
                        completed = true
                        result = {...result, status: 'error', error: event.data.error}
                        publish()
                        break
                }
            }, abort.signal)
            if (!completed && currentTurn === turn.current) throw new Error('对话流意外中断，请重试。')
        } catch (cause) {
            if (currentTurn === turn.current && !abort.signal.aborted) {
                result = {...result, status: 'error', error: cause instanceof Error ? cause.message : '对话失败'}
                publish()
            }
        } finally {
            if (currentTurn === turn.current) {
                controller.current = null
                setLoading(false)
            }
        }
    }

    return {messages, loading, ask, reset}
}
