import { useEffect, useRef } from 'react'
import type { InsertMethod } from '../algorithms/parseListInput'
import { getLinkedListCode, type CodeLanguage, type CodeLine } from './linkedListCode'

interface CodePanelProps {
  insertMethod?: InsertMethod
  lesson?: { lines: readonly CodeLine[]; label: string }
  activeLineId: string | null
  condition: boolean | null
  language: CodeLanguage
  onLanguageChange: (language: CodeLanguage) => void
}

export default function CodePanel({ insertMethod = 'tail', lesson, activeLineId, condition, language, onLanguageChange }: CodePanelProps) {
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
  }, [activeLineId, language])
  const codeLines = lesson?.lines ?? getLinkedListCode(insertMethod, language)
  const methodLabel = lesson?.label ?? (insertMethod === 'head' ? '头插法' : '尾插法')
  const languageLabel = language === 'c' ? 'C' : 'C++'
  const codeTitle = `${language === 'c' ? 'C语言' : languageLabel} ${methodLabel}`

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
    </section>
  )
}
