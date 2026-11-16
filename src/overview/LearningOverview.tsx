import { useRef, useState } from 'react'
import AlgorithmDiagram from './AlgorithmDiagram'
import { algorithms, categories, filterAlgorithms, type Category } from './catalog'
import './overview.css'

export default function LearningOverview({ onNavigate }: { onNavigate: (route: string) => void }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | '全部'>('全部')
  const scroll = useRef<HTMLDivElement>(null)
  const results = filterAlgorithms(query, category)
  const resetScroll = () => { if (scroll.current) scroll.current.scrollTop = 0 }
  return <main className="overview-page">
    <header className="overview-header">
      <div className="overview-title-row">
        <div><p className="overview-eyebrow">数据结构 · 算法学习</p><h1>学习总览</h1><p className="overview-intro">从结构到算法，找到你的下一个学习起点。</p></div>
        <label className="overview-search"><span>搜索算法</span><input type="search" maxLength={100} value={query} placeholder="搜索名称或关键词，如 DFS、最小堆"
          onChange={event => { setQuery(event.target.value); resetScroll() }} /></label>
      </div>
      <div className="overview-filters" role="group" aria-label="算法分类">
        {(['全部', ...categories] as const).map(item => <button key={item} type="button" aria-pressed={category === item}
          onClick={() => { setCategory(item); resetScroll() }}>{item}</button>)}
      </div>
      <p className="overview-count" role="status">{results.length} / {algorithms.length} 项算法与操作<span>已开放 1 项 · 持续完善中</span></p>
    </header>
    <div className="overview-scroll" ref={scroll} tabIndex={0} aria-label="算法卡片列表">
      {results.length ? <div className="overview-grid">{results.map(item => <article className="algorithm-card" key={item.id}>
        <span className="algorithm-category">{item.category}</span>
        <h2>{item.name}</h2><p className="algorithm-description">{item.description}</p>
        <AlgorithmDiagram algorithm={item} />
        {item.route ? <a className="algorithm-open" href={item.route} onClick={event => {
          if (event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onNavigate(item.route!) }
        }} aria-label={`开始学习：${item.name}`}>开始学习 <span aria-hidden="true">↗</span></a> : <span className="algorithm-unavailable">暂未开放</span>}
      </article>)}</div> : <div className="overview-empty"><h2>没有找到匹配的算法</h2><p>试试其他关键词，或切换到“全部”分类。</p><button type="button" onClick={() => { setQuery(''); setCategory('全部'); resetScroll() }}>清除搜索与筛选</button></div>}
    </div>
  </main>
}
