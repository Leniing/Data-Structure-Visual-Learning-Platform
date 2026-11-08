import { useState } from 'react'
import { DEFAULT_TERMINAL_INPUT, parseTerminalInput } from '../algorithms/parseTerminalInput'

interface InputPanelProps {
  supported: boolean
  onCreate: (values: readonly number[]) => void
  onInputChange: () => void
}

export default function InputPanel({ supported, onCreate, onInputChange }: InputPanelProps) {
  const [input, setInput] = useState(DEFAULT_TERMINAL_INPUT)
  const result = parseTerminalInput(input)

  return (
    <section className="input-panel panel" aria-labelledby="input-title">
      <div>
        <h2 id="input-title">创建单链表</h2>
        <p className="muted">第一行输入 n，第二行用空格分隔节点值。</p>
        <p className="field-hint">n = 0 时第二行留空；本次演示无头结点的 C 尾插法。</p>
      </div>
      <div className="input-controls">
        <label htmlFor="node-values">终端输入 <span className="muted">（0～12 个整数，值为 -999～999）</span></label>
        <div className="input-row">
          <textarea
            id="node-values"
            rows={2}
            spellCheck={false}
            placeholder={'4\n5 7 4 3'}
            value={input}
            aria-invalid={!result.ok}
            aria-describedby="input-feedback"
            onChange={(event) => { setInput(event.target.value); onInputChange() }}
          />
          <button type="button" className="primary-button" disabled={!result.ok || !supported} onClick={() => { if (result.ok && supported) onCreate(result.values) }}>创建链表</button>
        </div>
        <p id="input-feedback" className={`field-hint ${result.ok ? '' : 'field-error'}`} aria-live="polite">
          {!result.ok ? result.error : !supported ? '此组合仅提供教学代码；请选择“尾插法 + C”创建动画。' : `输入有效 · ${result.values.length} 个值 · 点击创建开始演示`}
        </p>
      </div>
    </section>
  )
}
