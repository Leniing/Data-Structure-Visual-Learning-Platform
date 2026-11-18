import { useState } from 'react'
import BstCanvas from './components/BstCanvas'
import { parseSearchValue } from './domain/bstSearch'
import { useBstPlayer } from './player/useBstPlayer'
import PlaybackControls from './player/PlaybackControls'
import CodePanel from './teaching/CodePanel'
import { getBstCode, type BstMethod } from './teaching/bstCode'
import type { CodeLanguage } from './teaching/linkedListCode'
import './bst.css'

export default function BstSearchPage({ active, language, onLanguageChange }: {
  active: boolean; language: CodeLanguage; onLanguageChange: (language: CodeLanguage) => void
}) {
  const [method, setMethod] = useState<BstMethod>('recursive')
  const [input, setInput] = useState('11')
  const [focused, setFocused] = useState(false)
  const [composing, setComposing] = useState(false)
  const player = useBstPlayer(active)
  const [canvasVersion, setCanvasVersion] = useState(0)
  const reset = () => { player.reset(); setCanvasVersion(version => version + 1) }
  const parsed = parseSearchValue(input)
  const empty = !input.trim()
  const editingSign = focused && /^[+-]$/.test(input.trim())
  const message = composing || editingSign ? '' : empty ? focused ? '请输入查找值' : '' : parsed.ok ? '' : parsed.error
  const isError = Boolean(message) && !empty
  const result = player.current?.result
  const resultText = result == null ? '—' : result === 'NULL' ? 'NULL' : `节点${result}`
  const locked = player.total > 0 && !player.atEnd
  return <main className="experiment-page bst-page" hidden={!active}>
    <header className="page-header"><div><h1>二叉搜索树查找</h1><p className="page-description">比较节点值，逐步缩小查找范围</p></div></header>
    <div className="workspace">
      <section className="input-panel panel" aria-labelledby="bst-input-title">
        <div className="panel-heading"><h2 id="bst-input-title">输入数据</h2></div>
        <form className="input-controls" onSubmit={event => { event.preventDefault(); if (parsed.ok && !locked && !composing) player.start(parsed.value, method) }}>
          <div className="input-row">
            <input aria-label="整数查找值" aria-describedby="bst-input-feedback" aria-invalid={isError} inputMode="text" maxLength={64} value={input} readOnly={locked}
              onFocus={() => setFocused(true)}
              onBlur={() => { setFocused(false); setComposing(false) }}
              onCompositionStart={() => setComposing(true)}
              onCompositionEnd={() => setComposing(false)}
              onKeyDown={event => { if (event.key === 'Enter' && (composing || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)) event.preventDefault() }}
              onChange={event => { if (!locked) { setInput(event.target.value); player.reset() } }} />
            <button className="primary-button" type="submit" disabled={!parsed.ok || locked || composing}>开始查找</button>
          </div>
          <div id="bst-input-feedback" className="input-feedback bst-input-feedback" aria-live="polite">
            {message
              ? <p className={`field-hint ${isError ? 'field-error' : ''}`}>{message}</p>
              : !composing && parsed.ok && player.total > 0 && <output className="field-hint" aria-label="返回值">返回值：{resultText}</output>}
          </div>
        </form>
      </section>
      <BstCanvas key={canvasVersion} method={method} onMethodChange={next => { if (next !== method) { reset(); setMethod(next) } }} step={player.current} />
      <CodePanel language={language} onLanguageChange={onLanguageChange} activeLineId={player.atEnd ? null : player.current?.line ?? null} condition={player.current?.condition ?? null} lesson={{ lines: getBstCode(method, language), label: method === 'recursive' ? '递归查找' : '非递归查找' }} />
    </div>
    <PlaybackControls player={{ ...player, reset }} activity="查找" allowEmptyReset />
  </main>
}
