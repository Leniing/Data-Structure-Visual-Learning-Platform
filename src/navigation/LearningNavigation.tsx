import { useEffect, useRef, useState } from 'react'
import type { Chapter, KnowledgeItem } from './chapter'
import './navigation.css'
import { navigationTiming } from './timing'

interface Props {
  chapter: Chapter
  onOpenAi: () => void
  onSelectKnowledge: (item: KnowledgeItem) => void
  timings?: typeof navigationTiming
}

export default function LearningNavigation({ chapter, onOpenAi, onSelectKnowledge, timings = navigationTiming }: Props) {
  const [navExpanded, setNavExpanded] = useState(false)
  const [chapterPanelOpen, setChapterPanelOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const nav = useRef<HTMLElement>(null)
  const knowledgeButton = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const hovered = useRef(false)
  const keyboardMode = useRef(false)
  const expandTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const panelTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const notify = (message: string) => {
    clearTimeout(toastTimer.current)
    setToast(message)
    setToastVisible(true)
    toastTimer.current = setTimeout(() => setToastVisible(false), timings.toast)
  }
  const onOverview = () => notify('功能暂未开放')
  const onPractice = () => notify('功能暂未开放')
  const onSettings = () => notify('功能暂未开放')
  const closeChapter = () => {
    clearTimeout(panelTimer.current)
    setChapterPanelOpen(false)
  }
  const schedulePanelClose = () => {
    clearTimeout(panelTimer.current)
    panelTimer.current = setTimeout(() => {
      if (!keyboardMode.current || (!panel.current?.contains(document.activeElement) && document.activeElement !== knowledgeButton.current)) {
        setChapterPanelOpen(false)
        if (!hovered.current && (!keyboardMode.current || !nav.current?.contains(document.activeElement))) {
          setNavExpanded(false)
        }
      }
    }, timings.panelClose)
  }

  useEffect(() => {
    clearTimeout(collapseTimer.current)
    if (chapterPanelOpen) return
    collapseTimer.current = setTimeout(() => {
      if (!hovered.current && (!keyboardMode.current || !nav.current?.contains(document.activeElement))) setNavExpanded(false)
    }, timings.collapse)
    return () => clearTimeout(collapseTimer.current)
  }, [chapterPanelOpen, timings.collapse])

  useEffect(() => {
    if (!chapterPanelOpen) return
    const outside = (event: PointerEvent) => {
      const target = event.target as Node
      if (!panel.current?.contains(target) && !knowledgeButton.current?.contains(target)) setChapterPanelOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setChapterPanelOpen(false)
        knowledgeButton.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [chapterPanelOpen])

  useEffect(() => () => {
    clearTimeout(expandTimer.current)
    clearTimeout(collapseTimer.current)
    clearTimeout(panelTimer.current)
    clearTimeout(toastTimer.current)
  }, [])

  const run = (action: () => void) => { closeChapter(); action() }
  const icon = (file: string) => <img src={`${import.meta.env.BASE_URL}pictures/${file}.svg`} width="24" height="24" alt="" />

  return <>
    <nav ref={nav} className={`learning-nav ${navExpanded || chapterPanelOpen ? 'expanded' : ''}`} aria-label="学习导航"
      onKeyDown={() => { keyboardMode.current = true }}
      onPointerDown={() => { keyboardMode.current = false }}
      onPointerEnter={(event) => {
        if (event.pointerType === 'touch') return
        hovered.current = true
        clearTimeout(collapseTimer.current)
        clearTimeout(expandTimer.current)
        expandTimer.current = setTimeout(() => setNavExpanded(true), timings.expand)
      }}
      onPointerLeave={() => {
        hovered.current = false
        clearTimeout(expandTimer.current)
        clearTimeout(collapseTimer.current)
        collapseTimer.current = setTimeout(() => {
          if ((!keyboardMode.current || !nav.current?.contains(document.activeElement)) && !panel.current) setNavExpanded(false)
        }, timings.collapse)
      }}
      onFocus={() => { clearTimeout(collapseTimer.current); setNavExpanded(true) }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          clearTimeout(collapseTimer.current)
          collapseTimer.current = setTimeout(() => {
            if (!hovered.current && !panel.current) setNavExpanded(false)
          }, timings.collapse)
        }
      }}>
      <div className="nav-top">
        <button type="button" aria-label="学习总览" onClick={() => run(onOverview)}>{icon('learning-overview')}<span>学习总览</span></button>
        <div className="knowledge-anchor" onPointerEnter={() => clearTimeout(panelTimer.current)} onPointerLeave={(event) => { if (event.pointerType !== 'touch') schedulePanelClose() }}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) schedulePanelClose() }}>
          <button ref={knowledgeButton} type="button" aria-label="本章知识" aria-expanded={chapterPanelOpen} aria-controls="chapter-knowledge"
            onClick={() => { clearTimeout(panelTimer.current); setNavExpanded(true); setChapterPanelOpen(!chapterPanelOpen) }}>
            {icon('knowledge')}<span>本章知识</span>
          </button>
          {chapterPanelOpen && <div ref={panel} id="chapter-knowledge" className="chapter-panel" role="region" aria-label="本章知识"
            onFocus={() => clearTimeout(panelTimer.current)}>
            <h2>{chapter.chapterTitle}</h2>
            <ul>{chapter.items.map(item => <li key={item.id}>
              <button type="button" onClick={() => {
                if (item.status === 'placeholder') notify('知识点暂未配置')
                else { onSelectKnowledge(item); closeChapter() }
              }}><span>{item.title}</span>{item.status === 'placeholder' && <small>待配置</small>}</button>
            </li>)}</ul>
          </div>}
        </div>
        <button type="button" aria-label="AI 解答" onClick={() => run(onOpenAi)}>{icon('ai-answer')}<span>AI 解答</span></button>
        <button type="button" aria-label="练习挑战" onClick={() => run(onPractice)}>{icon('practice-challenge')}<span>练习挑战</span></button>
      </div>
      <button className="nav-settings" type="button" aria-label="设置" onClick={() => run(onSettings)}>{icon('settings')}<span>设置</span></button>
    </nav>
    <div className={`learning-toast ${toastVisible ? 'visible' : ''}`} role="status" aria-live="polite"
      onTransitionEnd={(event) => { if (event.target === event.currentTarget && event.propertyName === 'opacity' && !toastVisible) setToast('') }}>
      <span aria-hidden={!toastVisible}>{toast}</span>
    </div>
  </>
}
