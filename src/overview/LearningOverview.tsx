import { useRef, useState } from 'react'
import { usePreviewPlayer } from './usePreviewPlayer'
import PreviewDiagram from './PreviewDiagram'
import { listPreviewSteps, treePreviewSteps } from './previewSteps'
import type { Algorithm } from './catalog'
import AlgorithmDiagram from './AlgorithmDiagram'
import { categories, filterAlgorithms, type Category } from './catalog'
import './overview.css'

export default function LearningOverview({ onNavigate, active = true }: { active?: boolean; onNavigate: (route: string) => void }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | '全部'>('全部')
  const scroll = useRef<HTMLDivElement>(null)
  const results = filterAlgorithms(query, category)
  const resetScroll = () => { if (scroll.current) scroll.current.scrollTop = 0 }
  return <main className="overview-page">
    <header className="overview-header">
      <div className="overview-title-row">
        <h1>学习总览</h1>
        <label className="overview-search">
          <span className="overview-search-label">
          <svg className="overview-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" />
          </svg>
          <span>搜索算法</span>
          </span>
          <input type="search" aria-label="搜索算法" maxLength={100} value={query} placeholder="搜索名称或关键词，如 DFS、最小堆"
          onChange={event => { setQuery(event.target.value); resetScroll() }} /></label>
      </div>
      <div className="overview-filters" role="group" aria-label="算法分类">
        {(['全部', ...categories] as const).map(item => <button key={item} type="button" aria-pressed={category === item}
          onClick={() => { setCategory(item); resetScroll() }}>{item}</button>)}
      </div>
    </header>
    <div className="overview-scroll" ref={scroll} tabIndex={0} aria-label="算法卡片列表">
      {results.length ? <div className="overview-grid">{results.map(item => <AlgorithmCard key={`${category}:${query}:${item.id}`} item={item} active={active} onNavigate={onNavigate} />)}</div> : <div className="overview-empty"><h2>没有找到匹配的算法</h2><p>试试其他关键词，或切换到“全部”分类。</p><button type="button" onClick={() => { setQuery(''); setCategory('全部'); resetScroll() }}>清除搜索与筛选</button></div>}
    </div>
  </main>
}

function AlgorithmCard({ item, active, onNavigate }: { item: Algorithm; active: boolean; onNavigate: (route: string) => void }) {
  const tree = item.route === '#bst-search'
  const supported = tree || item.route === '#linked-list-creation'
  const player = usePreviewPlayer(tree ? treePreviewSteps.length : listPreviewSteps.length, active && supported)
  return <article className="algorithm-card" {...player.events}>
        <span className="algorithm-category">{item.category}</span>
        <h2>{item.name}</h2><p className="algorithm-description">{item.description}</p>
        {supported ? <PreviewDiagram tree={tree} index={player.index} /> : <AlgorithmDiagram algorithm={item} />}
        {item.route ? <a className="algorithm-open" href={item.route} onClick={event => {
          if (event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onNavigate(item.route!) }
        }} aria-label={`开始学习：${item.name}`}>开始学习 <span aria-hidden="true">↗</span></a> : <span className="algorithm-unavailable">暂未开放</span>}
      </article>
}
