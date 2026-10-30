import { useState } from 'react'
import type { AnalysisResult } from '../../types/analysis'
import type { WorkbookSheet } from '../../types/workbook'

type EvidenceTab = 'data' | 'chart' | 'source'
export function EvidencePanel({ sheet, result, onOpen }: { sheet?: WorkbookSheet; result?: AnalysisResult; onOpen: () => void }) {
  const [active, setActive] = useState<EvidenceTab>('data')
  const queryResults = result?.results ?? []
  return <aside className="evidence">
    <div className="tabs">{([['data', '▥ 相关数据'], ['chart', '▥ 图表'], ['source', '♧ 引用来源']] as [EvidenceTab, string][]).map(([key, label]) => <button key={key} className={active === key ? 'active' : ''} onClick={() => setActive(key)}>{label}</button>)}</div>
    <div className="evidence-content">
      {active === 'data' && (queryResults.length ? queryResults.map((item) => <div key={item.task_id} className="preview-scroll"><h2>查询结果 · {item.task_id}</h2><table><thead><tr>{item.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{item.rows.map((row, i) => <tr key={i}>{row.map((value, j) => <td key={j}>{String(value ?? '')}</td>)}</tr>)}</tbody></table>{item.truncated && <small>仅展示部分记录</small>}</div>) : <EmptyState text="完成查询后显示结果预览。"/>)}
      {active === 'chart' && <EmptyState text="当前分析服务未返回图表数据。"/>}
      {active === 'source' && (sheet ? <><h2>工作表来源</h2><dl><dt>工作表：</dt><dd>{sheet.name}</dd><dt>范围：</dt><dd>{sheet.dataRange}</dd><dt>列：</dt><dd>{sheet.headers.join('、')}</dd></dl><button className="view-source" onClick={onOpen}>查看原始数据 →</button></> : <EmptyState text="上传工作簿后显示来源。"/>)}
    </div>
  </aside>
}

function EmptyState({ text }: { text: string }) { return <div className="empty-tab"><h2>暂无可展示内容</h2><p>{text}</p></div> }
