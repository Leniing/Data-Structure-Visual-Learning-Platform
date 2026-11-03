import { useState } from 'react'
import { type InsertMethod } from './algorithms/parseListInput'
import CanvasPanel from './components/CanvasPanel'
import InputPanel from './components/InputPanel'
import PlaybackControls from './player/PlaybackControls'
import CodePanel from './teaching/CodePanel'

function App() {
  const [insertMethod, setInsertMethod] = useState<InsertMethod>('tail')

  return (
    <main className="experiment-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">数据结构 · 可视化学习</p>
          <h1>单链表创建实验</h1>
          <p className="page-description">从一个节点开始，理解数据之间的连接。</p>
        </div>
        <span className="preview-label">静态页面预览</span>
      </header>
      <InputPanel insertMethod={insertMethod} />
      <div className="workspace">
        <CanvasPanel insertMethod={insertMethod} onInsertMethodChange={setInsertMethod} />
        <CodePanel />
      </div>
      <PlaybackControls />
    </main>
  )
}

export default App
