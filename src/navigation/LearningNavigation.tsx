import { useEffect, useRef, useState } from 'react'
import PlatformIcon from '../components/PlatformIcon'
import { chapters, type Chapter, type KnowledgeItem } from './chapter'
import './navigation.css'
import { navigationTiming } from './timing'

interface Props {
  chapter: Chapter
  onOpenAi: () => void
  onSelectKnowledge: (item: KnowledgeItem) => void
  onSettings: () => void
  settingsOpen?: boolean
  onOverview?: () => void
  overviewOpen?: boolean
  timings?: typeof navigationTiming
}

export default function LearningNavigation({ chapter, onOpenAi, onSelectKnowledge, onSettings, settingsOpen, onOverview: openOverview, overviewOpen, timings = navigationTiming }: Props) {
  const [settingsHoverSuppressed, setSettingsHoverSuppressed] = useState(false)
  const [navExpanded, setNavExpanded] = useState(false)
  const [chapterPanelOpen, setChapterPanelOpen] = useState(false)
  const [expandedChapterIds, setExpandedChapterIds] = useState<string[]>([chapter.chapterId])
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
  const onOverview = openOverview ?? (() => notify('功能暂未开放'))
  const onPractice = () => notify('功能暂未开放')
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
        <button type="button" aria-label="学习总览" aria-current={overviewOpen ? 'page' : undefined} onClick={() => run(onOverview)}><PlatformIcon name="learning-overview" colored /><span>学习总览</span></button>
        <div className="knowledge-anchor" onPointerEnter={() => clearTimeout(panelTimer.current)} onPointerLeave={(event) => { if (event.pointerType !== 'touch') schedulePanelClose() }}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) schedulePanelClose() }}>
          <button ref={knowledgeButton} type="button" aria-label="本章知识" aria-expanded={chapterPanelOpen} aria-controls="chapter-knowledge"
            onClick={() => { clearTimeout(panelTimer.current); setNavExpanded(true); if (!chapterPanelOpen) setExpandedChapterIds([chapter.chapterId]); setChapterPanelOpen(!chapterPanelOpen) }}>
            <PlatformIcon name="knowledge" colored /><span>本章知识</span>
          </button>
          {chapterPanelOpen && <div ref={panel} id="chapter-knowledge" className="chapter-panel" role="region" aria-label="本章知识"
            onFocus={() => clearTimeout(panelTimer.current)}>
            <h2>本章知识</h2>
            <div className="chapter-scroll">
              {chapters.map((category, categoryIndex) => {
                const expanded = expandedChapterIds.includes(category.chapterId)
                const contentId = `chapter-category-${categoryIndex}`
                return <section className="chapter-category" key={category.chapterId}>
                  <h3><button type="button" className="chapter-toggle" aria-expanded={expanded} aria-controls={contentId}
                    onClick={() => setExpandedChapterIds(ids => expanded
                      ? ids.filter(id => id !== category.chapterId) : [...ids, category.chapterId])}>
                    <svg className="chapter-triangle" viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2 9 6 4 10Z" fill="currentColor" /></svg>
                    <span>{category.chapterTitle}</span>
                  </button></h3>
                  <ul id={contentId} hidden={!expanded}>{category.items.map((item, index) => <li key={item.id}>
                    {item.group && item.group !== category.items[index - 1]?.group && <h4 className="chapter-group">{item.group}</h4>}
                    <button type="button" onClick={() => {
                      if (item.status === 'unavailable') notify('该知识点暂未开放')
                      else { onSelectKnowledge(item); closeChapter() }
                    }}><span>{item.title}</span>{item.status === 'unavailable' && <small>暂未开放</small>}</button>
                  </li>)}</ul>
                </section>
              })}
            </div>
          </div>}
        </div>
        <button type="button" aria-label="AI 解答" onClick={() => run(onOpenAi)}><PlatformIcon name="ai-answer" colored /><span>AI 解答</span></button>
        <button type="button" aria-label="练习挑战" onClick={() => run(onPractice)}><PlatformIcon name="practice-challenge" colored /><span>练习挑战</span></button>
      </div>
      <button className="nav-settings" type="button" aria-label="设置" aria-current={settingsOpen ? 'page' : undefined}
        data-hover-suppressed={settingsHoverSuppressed || undefined}
        onPointerLeave={() => setSettingsHoverSuppressed(false)}
        onClick={(event) => {
          if (event.detail > 0) setSettingsHoverSuppressed(true)
          run(onSettings)
        }}><PlatformIcon name="settings" colored /><span>设置</span></button>
    </nav>
    <div className={`learning-toast ${toastVisible ? 'visible' : ''}`} role="status" aria-live="polite"
      onTransitionEnd={(event) => { if (event.target === event.currentTarget && event.propertyName === 'opacity' && !toastVisible) setToast('') }}>
      <span aria-hidden={!toastVisible}>{toast}</span>
    </div>
  </>
}
