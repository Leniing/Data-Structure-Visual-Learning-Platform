import { useState } from 'react'
import { parseListInput, type InsertMethod } from '../algorithms/parseListInput'

const DEFAULT_INPUT = '3, 1, 4, 1, 5'

interface InputPanelProps {
  insertMethod: InsertMethod
}

export default function InputPanel({ insertMethod }: InputPanelProps) {
  const [input, setInput] = useState(DEFAULT_INPUT)
  const result = parseListInput(input)

  return (
    <section className="input-panel panel" aria-labelledby="input-title">
      <div>
        <h2 id="input-title">创建单链表</h2>
        <p className="muted">输入节点值，逐步观察链表的创建过程。</p>
      </div>
      <div className="input-controls">
        <label htmlFor="node-values">节点值 <span className="muted">（最多 12 个，范围 -999 至 999）</span></label>
        <div className="input-row">
          <input
            id="node-values"
            type="text"
            placeholder="例如：12, 24, 36"
            maxLength={160}
            value={input}
            aria-invalid={!result.ok}
            aria-describedby="input-feedback"
            onChange={(event) => setInput(event.target.value)}
          />
          <button type="button" className="primary-button" disabled>创建链表</button>
        </div>
        <p id="input-feedback" className={`field-hint ${result.ok ? '' : 'field-error'}`} aria-live="polite">
          {result.ok
            ? `输入有效 · ${result.values.length} 个值 · ${insertMethod === 'head' ? '头插法' : '尾插法'}`
            : result.error}
        </p>
      </div>
    </section>
  )
}
