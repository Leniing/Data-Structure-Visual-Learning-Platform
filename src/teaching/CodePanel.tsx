import { useEffect, useRef } from 'react'
import type { InsertMethod } from '../algorithms/parseListInput'
import { getLinkedListCode, type CodeLanguage } from './linkedListCode'

interface CodePanelProps {
  insertMethod: InsertMethod
  activeLineId: string | null
  condition: boolean | null
  language: CodeLanguage
  onLanguageChange: (language: CodeLanguage) => void
}

export default function CodePanel({ insertMethod, activeLineId, condition, language, onLanguageChange }: CodePanelProps) {
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = scroller.current
    const line = container?.querySelector<HTMLElement>('[aria-current="step"]')
    if (container && line) {
      const top = line.offsetTop
      if (top < container.scrollTop || top + line.offsetHeight > container.scrollTop + container.clientHeight) {
        container.scrollTop = Math.max(0, top - container.clientHeight / 2)
      }
    }
  }, [activeLineId])
  const codeLines = getLinkedListCode(insertMethod, language)
  const methodLabel = insertMethod === 'head' ? '头插法' : '尾插法'
  const languageLabel = language === 'c' ? 'C' : 'C++'
  const codeTitle = `${methodLabel} · ${languageLabel} 创建代码`

  return (
    <section className="code-panel panel" aria-labelledby="code-title">
      <div className="panel-heading">
        <h2 id="code-title">教学代码</h2>
        <div className="method-switch language-switch" role="group" aria-label="代码语言">
          <button type="button" className={language === 'c' ? 'selected' : ''} aria-pressed={language === 'c'} onClick={() => onLanguageChange('c')}>C</button>
          <button type="button" className={language === 'cpp' ? 'selected' : ''} aria-pressed={language === 'cpp'} onClick={() => onLanguageChange('cpp')}>C++</button>
        </div>
      </div>
      <div ref={scroller} className="code-placeholder">
        <span className="code-label">{codeTitle}</span>
        <ol className="code-lines" aria-label={`${methodLabel} ${languageLabel} 代码`}>
          {codeLines.map((line, index) => {
            const isActive = line.id === activeLineId
            return (
              <li
                key={line.id}
                className={`code-line ${isActive ? condition === false ? 'active condition-false' : 'active' : ''}`}
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
      <p className="panel-note">{language === 'c' ? '无头结点：head 指向首个数据节点。演示正常输入与分配成功路径。' : '带头结点示例：头结点不保存用户数据；此组合尚未接入动画。'} 使用结束后需要释放所有节点。</p>
      <p className="panel-note">只读教学片段，不编译或执行。黄色为当前步骤，红色表示条件不成立。网页单独校验输入；scanf 本身不限制换行。</p>
    </section>
  )
}
