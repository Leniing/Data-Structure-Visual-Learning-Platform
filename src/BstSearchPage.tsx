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
  const player = useBstPlayer(active)
  const parsed = parseSearchValue(input)
  const result = player.current?.result
  const resultText = result == null ? '—' : result === 'NULL' ? 'NULL' : `节点${result}`
  const locked = player.total > 0 && !player.atEnd
  return <main className="experiment-page bst-page" hidden={!active}>
    <header className="page-header"><div><h1>二叉搜索树查找</h1><p className="page-description">比较节点值，逐步缩小查找范围</p></div></header>
    <div className="workspace">
      <section className="input-panel panel" aria-labelledby="bst-input-title">
        <div className="panel-heading"><h2 id="bst-input-title">输入数据</h2></div>
        <form className="input-controls" onSubmit={event => { event.preventDefault(); if (parsed.ok && !locked) player.start(parsed.value, method) }}>
          <div className="input-row">
            <input aria-label="整数查找值" aria-describedby="bst-input-feedback" aria-invalid={!parsed.ok} inputMode="text" maxLength={64} value={input} readOnly={locked} onChange={event => { if (!locked) { setInput(event.target.value); player.reset() } }} />
            <button className="primary-button" type="submit" disabled={!parsed.ok || locked}>开始查找</button>
          </div>
          <div className="bst-input-feedback">
            <output className="field-hint" aria-label="返回值" aria-live="polite">返回值：{resultText}</output>
            <p id="bst-input-feedback" className={`field-hint ${parsed.ok ? '' : 'field-error'}`} aria-live="polite">{!parsed.ok ? parsed.error : ''}</p>
          </div>
        </form>
      </section>
      <BstCanvas method={method} onMethodChange={next => { if (next !== method) { player.reset(); setMethod(next) } }} step={player.current} />
      <CodePanel language={language} onLanguageChange={onLanguageChange} activeLineId={player.current?.line ?? null} condition={player.current?.condition ?? null} lesson={{ lines: getBstCode(method, language), label: method === 'recursive' ? '递归查找' : '非递归查找' }} />
    </div>
    <PlaybackControls player={player} status={player.current ? `${player.index + 1} / ${player.total} 步 · ${player.current.description}` : '等待查找'} />
  </main>
}
