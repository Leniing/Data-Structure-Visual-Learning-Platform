import { useRef, useState } from 'react'
import { DEFAULT_TERMINAL_INPUT, parseTerminalInput } from '../algorithms/parseTerminalInput'

interface InputPanelProps {
  supported: boolean
  activeInput: 'count' | 'value' | null
  inputIndex: number | null
  onCreate: (values: readonly number[]) => void
  onInputChange: () => void
}

export default function InputPanel({ supported, activeInput, inputIndex, onCreate, onInputChange }: InputPanelProps) {
  const [input, setInput] = useState(DEFAULT_TERMINAL_INPUT)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)
  const result = parseTerminalInput(input)
  const highlightedInput = activeInput === 'count' ? 0 : activeInput === 'value' && inputIndex !== null ? 1 : null
  const renderInputLine = (line: string, lineIndex: number) => {
    if (highlightedInput !== lineIndex) return line || ' '
    let valueIndex = 0
    return line.split(/(\s+)/).filter((part) => part.length > 0).map((part, partIndex) => {
      if (/^\s+$/.test(part)) return <span key={partIndex}>{part}</span>
      const isTarget = activeInput === 'count' || valueIndex === inputIndex
      valueIndex++
      return <span key={partIndex} className={`terminal-input-token ${isTarget ? 'active' : ''}`}>{part}</span>
    })
  }

  return (
    <section className="input-panel panel" aria-labelledby="input-title">
      <div>
        <h2 id="input-title">创建单链表</h2>
        <p className="muted">第一行输入 n，第二行用空格分隔节点值。</p>
        <p className="field-hint">n = 0 时第二行留空；本次演示无头结点的 C 头插法或尾插法。</p>
      </div>
      <div className="input-controls">
        <label htmlFor="node-values">终端输入 <span className="muted">（0～12 个整数，值为 -999～999）</span></label>
        <div className="input-row">
          <div className="terminal-input-wrap">
            <pre ref={highlightRef} className="terminal-input-highlight" aria-hidden="true">
              {input.split('\n').map((line, index) => (
                <span key={index} className="terminal-input-line">{renderInputLine(line, index)}</span>
              ))}
            </pre>
            <textarea
              id="node-values"
              ref={textareaRef}
              rows={2}
              spellCheck={false}
              placeholder={'4\n5 7 4 3'}
              value={input}
              aria-invalid={!result.ok}
              aria-describedby="input-feedback"
              onScroll={(event) => {
                const overlay = highlightRef.current
                if (overlay) {
                  overlay.scrollTop = event.currentTarget.scrollTop
                  overlay.scrollLeft = event.currentTarget.scrollLeft
                }
              }}
              onChange={(event) => { setInput(event.target.value); onInputChange() }}
            />
          </div>
          <button type="button" className="primary-button" disabled={!result.ok || !supported} onClick={() => { if (result.ok && supported) onCreate(result.values) }}>创建链表</button>
        </div>
        <p id="input-feedback" className={`field-hint ${result.ok ? '' : 'field-error'}`} aria-live="polite">
          {!result.ok ? result.error : !supported ? '此组合仅提供教学代码；请选择 C 语言创建动画。' : `输入有效 · ${result.values.length} 个值 · 点击创建开始演示`}
        </p>
      </div>
    </section>
  )
}
