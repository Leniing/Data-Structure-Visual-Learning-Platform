import { useState } from 'react'
import { type InsertMethod } from './algorithms/parseListInput'
import CanvasPanel from './components/CanvasPanel'
import InputPanel from './components/InputPanel'
import PlaybackControls from './player/PlaybackControls'
import CodePanel from './teaching/CodePanel'
import type { CodeLanguage } from './teaching/linkedListCode'
import { useTailPlayer } from './player/useTailPlayer'

function App() {
  const [insertMethod, setInsertMethod] = useState<InsertMethod>('tail')
  const [language, setLanguage] = useState<CodeLanguage>('c')
  const player = useTailPlayer()
  const supported = insertMethod === 'tail' && language === 'c'

  return (
    <main className="experiment-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">数据结构 · 可视化学习</p>
          <h1>单链表创建实验</h1>
          <p className="page-description">从一个节点开始，理解数据之间的连接。</p>
        </div>
        <span className="preview-label">C 尾插法 · 无头结点</span>
      </header>
      <InputPanel supported={supported} onCreate={player.start} onInputChange={player.reset} />
      <div className="workspace">
        <CanvasPanel key={player.runId} insertMethod={insertMethod} onInsertMethodChange={(method) => { if (method !== insertMethod) { player.reset(); setInsertMethod(method) } }} step={player.current} playing={player.playing} />
        <CodePanel insertMethod={insertMethod} language={language} onLanguageChange={(next) => { if (next !== language) { player.reset(); setLanguage(next) } }} activeLineId={player.current?.codeLineId ?? null} condition={player.current?.condition ?? null} />
      </div>
      <PlaybackControls player={player} />
    </main>
  )
}

export default App
