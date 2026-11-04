import type { InsertMethod } from '../algorithms/parseListInput'
import { getLinkedListCode } from './linkedListCode'

interface CodePanelProps {
  insertMethod: InsertMethod
  activeLineId: string | null
}

export default function CodePanel({ insertMethod, activeLineId }: CodePanelProps) {
  const codeLines = getLinkedListCode(insertMethod)
  const methodLabel = insertMethod === 'head' ? '头插法' : '尾插法'

  return (
    <section className="code-panel panel" aria-labelledby="code-title">
      <div className="panel-heading">
        <h2 id="code-title">教学代码</h2>
        <span className="badge">只读 · {methodLabel}</span>
      </div>
      <div className="code-placeholder">
        <span className="code-label">带头结点单链表 · 创建示例</span>
        <ol className="code-lines" aria-label={`${methodLabel} C++ 代码`}>
          {codeLines.map((line, index) => {
            const isActive = line.id === activeLineId
            return (
              <li
                key={line.id}
                className={`code-line ${isActive ? 'active' : ''}`}
                data-line-id={line.id}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="code-line-number" aria-hidden="true">{index + 1}</span>
                <code>{line.code || ' '}</code>
              </li>
            )
          })}
        </ol>
      </div>
      <p className="panel-note">头结点不保存用户数据；此示例只演示创建，使用结束后需要释放所有节点。</p>
      <p className="panel-note">代码不可编辑、不可执行。当前高亮由演示行标识 <code>{activeLineId ?? '无'}</code> 控制。</p>
    </section>
  )
}
