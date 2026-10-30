export function MessageComposer({value, setValue, onSend, disabled, fileName}: {
    value: string;
    setValue: (v: string) => void;
    onSend: () => void;
    disabled: boolean;
    fileName?: string
}) {
    return <div className="composer">
        <div className="composer-main">
            <div className="current-file">当前工作簿： <b>{fileName ?? '未上传'}</b></div>
            <textarea value={value} disabled={disabled} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSend()
                }
            }} placeholder={fileName ? '请输入问题，例如：统计销售额总和' : '请先上传 Excel 文件'}/>
            <div className="composer-foot">
                <span>Enter 发送　|　Shift + Enter 换行</span><span>{value.length} / 2000</span></div>
        </div>
        <button className="send-button" disabled={disabled || !value.trim()} onClick={onSend}>➤ 发送</button>
    </div>
}
