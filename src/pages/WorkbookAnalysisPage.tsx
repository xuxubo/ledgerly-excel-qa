import {useEffect, useRef, useState} from 'react'
import '../App.css'
import './WorkbookAnalysisPage.css'
import {AnalysisResult} from '../components/analysis/AnalysisResult'
import {MessageComposer} from '../components/chat/MessageComposer'
import {EvidencePanel} from '../components/evidence/EvidencePanel'
import {AppSidebar} from '../components/layout/AppSidebar'
import {WorkspaceHeader} from '../components/layout/WorkspaceHeader'
import {useConversation} from '../hooks/useConversation'
import {useWorkbook} from '../hooks/useWorkbook'

export function WorkbookAnalysisPage() {
    const fileRef = useRef<HTMLInputElement>(null)
    const {workbook, activeSheet, sheetName, setSheetName, upload, status, error} = useWorkbook()
    const conversation = useConversation(workbook?.workbookId)
    const [question, setQuestion] = useState('')
    const [drawer, setDrawer] = useState(false)
    const messagesScrollRef = useRef<HTMLDivElement>(null)
    const followMessagesRef = useRef(true)
    const latest = [...conversation.messages].reverse().find((message) => message.result)?.result
    const submit = () => {
        followMessagesRef.current = true
        void conversation.ask(question);
        setQuestion('')
    }
    useEffect(() => {
        const node = messagesScrollRef.current
        if (node && followMessagesRef.current) node.scrollTop = node.scrollHeight
    }, [conversation.messages])
    const uploadSelectedFile = (file?: File) => {
        if (!file) return
        conversation.reset()
        setQuestion('')
        setDrawer(false)
        void upload(file)
    }
    const selectSheet = (name: string) => {
        if (name === sheetName) return
        conversation.reset()
        setQuestion('')
        void setSheetName(name)
    }

    return <div className="app-shell" onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
        event.preventDefault();
        uploadSelectedFile(event.dataTransfer.files[0])
    }}>
        <AppSidebar workbook={workbook} sheetName={sheetName} onSheet={selectSheet}
                    onUpload={() => fileRef.current?.click()} onPrompt={setQuestion}/>
        <input ref={fileRef} hidden type="file" accept=".xlsx" onChange={(event) => {
            uploadSelectedFile(event.target.files?.[0]);
            event.target.value = ''
        }}/>
        <main className="workspace">
            <WorkspaceHeader fileName={workbook?.fileName} sheetName={sheetName} onReset={conversation.reset}/>
            {status === 'uploading' && <div className="notice">正在上传并读取工作簿…</div>}
            {error && <div className="error-notice" role="alert">{error}</div>}
            <div className="content-grid">
                <section className="conversation">
                    <div className="conversation-scroll" ref={messagesScrollRef} onScroll={(event) => {
                        const node = event.currentTarget
                        followMessagesRef.current = node.scrollHeight - node.scrollTop - node.clientHeight < 96
                    }}>
                    {!workbook && status !== 'uploading' &&
                        <div className="welcome">
                            <h2>让你的 Excel 数据分析更简单</h2>
                            <p>上传工作簿，用自然语言提问，结果基于真实单元格计算。</p>
                            <button className="upload-button" onClick={() => fileRef.current?.click()}>
                                上传 Excel 开始
                            </button>
                        </div>
                    }
                    {workbook && activeSheet && conversation.messages.length === 0 &&
                        <div className="welcome compact"><h2>已加载 {activeSheet.name}</h2><p>{activeSheet.rows} 行
                            · {activeSheet.columns} 列。可以开始提问。</p></div>}

                    {conversation.messages.map((message) => message.role === 'user'
                        ? <div className="user-bubble" key={message.id}>{message.content}</div>
                        : <AnalysisResult key={message.id} result={message.result!}/>)}
                    </div>
                </section>

                <EvidencePanel sheet={activeSheet} result={latest} onOpen={() => setDrawer(true)}/>
            </div>
            <MessageComposer value={question} setValue={setQuestion} onSend={submit}
                             disabled={!workbook || status === 'uploading' || conversation.loading} fileName={workbook?.fileName}/>
        </main>
        {drawer && activeSheet && <div className="drawer-backdrop" onClick={() => setDrawer(false)}>
            <aside className="source-drawer" onClick={(event) => event.stopPropagation()}>
                <div className="drawer-head">
                    <div><small>工作表数据预览</small><h2>{activeSheet.name}</h2></div>
                    <button aria-label="关闭" onClick={() => setDrawer(false)}>×</button>
                </div>
                <p>显示当前上传文件中解析出的原始单元格值，来源范围：{activeSheet.dataRange}。</p>
                <table>
                    <thead>
                    <tr>{activeSheet.headers.map((header, index) => <th key={`${header}-${index}`}>{header}</th>)}</tr>
                    </thead>
                    <tbody>{activeSheet.data.slice(0, 12).map((row, index) => <tr
                        key={index}>{row.map((value, cellIndex) => <td
                        key={cellIndex}>{String(value ?? '')}</td>)}</tr>)}</tbody>
                </table>
                <button className="drawer-close" onClick={() => setDrawer(false)}>返回分析</button>
            </aside>
        </div>}
    </div>
}
