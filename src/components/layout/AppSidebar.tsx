import type {Workbook} from '../../types/workbook'
import {formatBytes} from '../../utils/format'

export function AppSidebar({workbook, sheetName, onSheet, onUpload, onPrompt}: {
    workbook: Workbook | null;
    sheetName: string;
    onSheet: (name: string) => void;
    onUpload: () => void;
    onPrompt: (q: string) => void
}) {
    return <aside className="sidebar">
        <div className="brand">
            <div className="brand-mark"><i/><i/><i/></div>
            <div><strong>Ledgerly</strong><span>Excel 智能问答助手</span></div>
        </div>

        <button className="upload-button" onClick={onUpload}>☁ 上传 Excel 文件</button>

        {workbook ? <div className="workbook-card">
            <b className="excel-icon">X</b>
            <div><strong>{workbook.fileName}</strong><span>{formatBytes(workbook.fileSize)} · 已解析</span></div>
            <b className="status-dot">✓</b></div> : <div className="empty-workbook">尚未上传工作簿</div>}

        <section className="side-section">
            <div className="side-heading">工作簿结构 <span>⌄</span></div>
            {workbook?.sheets.map((s) =>
                <button key={s.name} className={`sheet-row ${sheetName === s.name ? 'active' : ''}`} onClick={() => onSheet(s.name)}>
                    <span className="sheet-dot"/>
                    {s.name}
                    <em>{s.rows} 行 · {s.columns} 列</em>
                </button>)}
        </section>
        <section className="side-section recent">
            <div className="side-heading">推荐问题</div>
            {['统计数值列总和', '按地区统计销售额', '销售额最高的前五名'].map((q) => <button className="history-row"
                                                                                             key={q}
                                                                                             onClick={() => onPrompt(q)}>▣ {q}</button>)}
        </section>
        <small className="sidebar-footer">工作簿已上传至分析服务</small></aside>
}
