export function WorkspaceHeader({fileName, sheetName, onReset}: {
    fileName?: string;
    sheetName?: string;
    onReset: () => void
}) {
    return <header className="topbar">
        <div>
            <div className="breadcrumbs">工作簿分析 › <b>{fileName ?? '未上传文件'}</b></div>
            <div className="title-line"><h1>{fileName ? 'Excel 数据分析工作台' : '上传工作簿开始分析'}</h1></div>
            <div className="meta-line">▤ 工作表：<b>{sheetName || '—'}</b> ▧
                数据范围：<b>{fileName ? '当前工作表' : '—'}</b></div>
        </div>
        <div className="top-actions">
            <button className="ghost-button" onClick={onReset}>＋ 新建对话</button>
        </div>
    </header>
}
