import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type {AnalysisResult as Result} from '../../types/analysis'

export function AnalysisResult({result}: {result: Result}) {
  const statusLabel = result.status === 'running' ? '分析中' : result.status === 'success'
    ? '分析完成' : result.status === 'needs_clarification' ? '需要补充信息' : '分析失败'
  return <article className="analysis-card">
    <div className="analysis-status">{statusLabel}</div>
    <div className="analysis-steps">
      {result.steps.map((step, index) => <details key={`${step.node}-${index}`}>
        <summary><span>{step.title}</span><span className="step-summary">{step.summary}</span></summary>
        {step.details.tasks?.map((task) => <p key={task.task_id}>{task.target}</p>)}
        {step.details.queries?.map((query) => <div key={query.task_id}>
          <p>{query.target}</p><code>{query.sql}</code>
        </div>)}
        {step.details.results?.map((item) => <div key={item.task_id} className="step-table">
          <table><thead><tr>{item.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
            <tbody>{item.rows.map((row, rowIndex) => <tr key={rowIndex}>
              {row.map((value, columnIndex) => <td key={columnIndex}>{String(value ?? '')}</td>)}
            </tr>)}</tbody></table>
          {item.truncated && <small>查询结果已截断，仅展示部分记录。</small>}
        </div>)}
      </details>)}
    </div>
    {result.conclusion && <div className="answer-markdown"><Markdown remarkPlugins={[remarkGfm]}>{result.conclusion}</Markdown></div>}
    {result.error && <p className="error-notice" role="alert">{result.error}</p>}
    {result.status === 'running' && !result.conclusion && <p className="empty-copy">正在生成回答…</p>}
  </article>
}
