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
  const [focused, setFocused] = useState(false)
  const [composing, setComposing] = useState(false)
  const [notice, setNotice] = useState('')
  const [caret, setCaret] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)
  const result = parseTerminalInput(input)
  const empty = !input.trim()
  const beforeCaret = input.slice(0, caret)
  const editingSign = focused && beforeCaret.includes('\n') && /(?:\s)[+-]$/.test(beforeCaret)
    && (caret === input.length || /\s/.test(input[caret]!))
  const message = notice || (composing || (editingSign && !result.ok && result.error === '节点值须为整数')
    ? '' : empty ? focused ? '请输入节点个数和节点值' : '' : result.ok ? '' : result.error)
  const isError = Boolean(message) && !empty && !(focused && ['请输入节点个数', '节点值个数不足'].includes(message))
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
      <div className="panel-heading">
        <h2 id="input-title">输入数据</h2>
      </div>
      <div className="input-controls">
        <div className="input-row">
          <div className="terminal-input-wrap">
            <pre ref={highlightRef} className="terminal-input-highlight" aria-hidden="true">
              {input.split('\n').map((line, index) => (
                <span key={index} className="terminal-input-line">{renderInputLine(line, index)}</span>
              ))}
            </pre>
            <textarea
              id="node-values"
              aria-label="节点输入"
              ref={textareaRef}
              rows={2}
              spellCheck={false}
              placeholder={'4\n5 7 4 3'}
              value={input}
              aria-invalid={isError}
              aria-describedby={message ? 'input-feedback' : undefined}
              onFocus={() => setFocused(true)}
              onBlur={() => { setFocused(false); setComposing(false) }}
              onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
              onCompositionStart={() => setComposing(true)}
              onCompositionEnd={() => setComposing(false)}
              onPaste={(event) => {
                const target = event.currentTarget
                const pasted = event.clipboardData.getData('text').replace(/\r\n?/g, '\n')
                const next = target.value.slice(0, target.selectionStart) + pasted + target.value.slice(target.selectionEnd)
                if (next.split('\n').length > 2 || next.length > 160) {
                  event.preventDefault()
                  setNotice(next.split('\n').length > 2 ? '仅支持两行输入' : '输入不能超过 160 个字符')
                }
              }}
              onScroll={(event) => {
                const overlay = highlightRef.current
                if (overlay) {
                  overlay.scrollTop = event.currentTarget.scrollTop
                  overlay.scrollLeft = event.currentTarget.scrollLeft
                }
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return
                const { value, selectionStart, selectionEnd } = event.currentTarget
                const remaining = value.slice(0, selectionStart) + value.slice(selectionEnd)
                if (remaining.includes('\n')) event.preventDefault()
              }}
              onChange={(event) => {
                const value = event.target.value.replace(/\r\n?/g, '\n')
                if (value.split('\n').length > 2) { setNotice('仅支持两行输入'); return }
                if (value.length > 160) { setNotice('输入不能超过 160 个字符'); return }
                setNotice('')
                setCaret(event.target.selectionStart)
                setInput(value)
                onInputChange()
              }}
            />
          </div>
          <button type="button" className="primary-button" disabled={!result.ok || !supported} onClick={() => { if (result.ok && supported) onCreate(result.values) }}>创建链表</button>
        </div>
        <div id="input-feedback" className="input-feedback" aria-live="polite">
          <p className={`field-hint ${isError ? 'field-error' : ''}`}>{message}</p>
        </div>
      </div>
    </section>
  )
}
