import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { aiClient } from './aiClient'
import type { AiContext, AiMessage } from './aiClient'
import { clampRect, initialRect, maximizedRect } from './geometry'
import type { WindowRect } from './geometry'
import MessageContent from './MessageContent'
import './AiWindow.css'

export interface AiWindowProps {
  visible: boolean
  onClose: () => void
  context: AiContext
  initialLeft?: number
}

const MAX_DRAFT = 4000
const MAX_MESSAGES = 100
const MAX_RESPONSE = 100000
const viewport = () => ({ width: window.innerWidth, height: window.innerHeight })

export function AiWindow({ visible, onClose, context, initialLeft }: AiWindowProps) {
  const [rect, setRect] = useState(() => initialRect(viewport(), initialLeft))
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [retryMessages, setRetryMessages] = useState<AiMessage[] | null>(null)
  const request = useRef<AbortController | null>(null)
  const sequence = useRef(0)
  const contextKey = JSON.stringify(context)
  const latestContext = useRef(contextKey)
  const log = useRef<HTMLDivElement>(null)
  const nearBottom = useRef(true)
  const composing = useRef(false)
  const gesture = useRef<{ pointerId: number; x: number; y: number; rect: WindowRect; mode: 'move' | 'resize' } | null>(null)
  const headingId = useId()

  useLayoutEffect(() => {
    latestContext.current = contextKey
    request.current?.abort()
    request.current = null
    sequence.current += 1
    setLoading(false)
    setError('')
    setRetryMessages(null)
  }, [contextKey])

  useEffect(() => {
    const resize = () => {
      gesture.current = null
      setRect((current) => clampRect(current, viewport()))
    }
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      request.current?.abort()
      sequence.current += 1
    }
  }, [])

  useLayoutEffect(() => {
    if (visible && nearBottom.current && log.current) {
      log.current.scrollTop = log.current.scrollHeight
    }
  }, [visible, messages, loading, error])

  async function send(history: AiMessage[]) {
    if (!aiClient.configured || loading) return
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    const version = ++sequence.current
    const sentContext = contextKey
    setLoading(true)
    setError('')
    setRetryMessages(null)
    const current = () => !controller.signal.aborted && version === sequence.current && sentContext === latestContext.current
    try {
      const content = await aiClient.sendMessage({
        messages: history.map((message) => ({ ...message })),
        context: { ...context },
        signal: controller.signal,
      })
      if (current()) {
        if (!content.trim()) throw new Error('AI 服务返回了空内容，请重试')
        setMessages([...history, { id: `assistant-${version}`, role: 'assistant', content: content.slice(0, MAX_RESPONSE) }])
      }
    } catch (cause) {
      if (current()) {
        setError(cause instanceof Error ? cause.message : '发送失败，请重试')
        setRetryMessages(history)
      }
    } finally {
      if (current()) {
        request.current = null
        setLoading(false)
      }
    }
  }

  function submit() {
    if (!draft.trim() || loading || !aiClient.configured || messages.length >= MAX_MESSAGES) return
    const history = [...messages, { id: `user-${++sequence.current}`, role: 'user' as const, content: draft.trim() }]
    setMessages(history)
    setDraft('')
    nearBottom.current = true
    void send(history)
  }

  function stop() {
    request.current?.abort()
    request.current = null
    sequence.current += 1
    setLoading(false)
    setError('已停止生成，可重试')
    setRetryMessages(messages)
  }

  function begin(event: ReactPointerEvent<HTMLElement>, mode: 'move' | 'resize') {
    if (event.button !== 0 || event.target !== event.currentTarget) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    gesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, rect, mode }
  }

  function move(event: ReactPointerEvent<HTMLElement>) {
    const active = gesture.current
    if (!active || active.pointerId !== event.pointerId) return
    const dx = event.clientX - active.x
    const dy = event.clientY - active.y
    const next = active.mode === 'move'
      ? { ...active.rect, left: active.rect.left + dx, top: active.rect.top + dy }
      : { ...active.rect, width: Math.min(active.rect.width + dx, maximizedRect(viewport()).left + maximizedRect(viewport()).width - active.rect.left), height: Math.min(active.rect.height + dy, maximizedRect(viewport()).top + maximizedRect(viewport()).height - active.rect.top) }
    setRect(clampRect(next, viewport()))
  }

  function end(event: ReactPointerEvent<HTMLElement>) {
    if (gesture.current?.pointerId !== event.pointerId) return
    gesture.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const disabledReason = !aiClient.configured ? 'AI 服务尚未接入' : messages.length >= MAX_MESSAGES ? '本次对话已达消息上限' : loading ? '正在等待 AI 回复' : !draft.trim() ? '请输入消息' : ''
  const displayedRect = clampRect(rect, viewport())

  return (
    <section className="ai-window" hidden={!visible} aria-labelledby={headingId} style={displayedRect}>
      <header className="ai-window-titlebar" onPointerDown={(event) => begin(event, 'move')} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={() => { gesture.current = null }}>
        <h2 id={headingId}>AI 解答</h2>
        <div className="ai-window-actions">
          <button className="ai-window-icon" type="button" onClick={onClose} aria-label="关闭 AI 窗口" title="关闭">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>
      </header>
      <div className="ai-window-messages" ref={log} role="log" aria-label="AI 对话记录" aria-live="polite" onScroll={() => {
        const node = log.current
        if (node) nearBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 64
      }}>
        {messages.map((message) => <article className={`ai-window-message ai-window-message-${message.role}`} key={message.id}>
          <strong>{message.role === 'user' ? '你' : 'AI'}</strong>
          <div className="ai-markdown"><MessageContent text={message.content} /></div>
        </article>)}
      </div>
      <div className="ai-window-status" role="status">
        {loading ? '正在生成回复…' : error}
      </div>
      {aiClient.configured && error && retryMessages && <button className="ai-window-retry" type="button" onClick={() => void send(retryMessages)}>重试发送</button>}
      <form className="ai-window-composer" onSubmit={(event) => { event.preventDefault(); submit() }}>
        <textarea aria-label="输入 AI 消息" placeholder="请输入你的疑问..." value={draft} maxLength={MAX_DRAFT}
          onChange={(event) => setDraft(event.target.value.slice(0, MAX_DRAFT))}
          onCompositionStart={() => { composing.current = true }} onCompositionEnd={() => { composing.current = false }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !composing.current && !event.nativeEvent.isComposing && event.keyCode !== 229) {
              event.preventDefault()
              submit()
            }
          }} />
        <div className="ai-window-send-row">
          {loading && <button type="button" onClick={stop}>停止生成</button>}
          <button className="ai-window-icon ai-window-send" type="submit" disabled={Boolean(disabledReason)} aria-label="发送消息" title={disabledReason || '发送消息'}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3" /></svg>
          </button>
        </div>
      </form>
      <button type="button" className="ai-window-resize" aria-label="调整 AI 窗口大小"
        onPointerDown={(event) => begin(event, 'resize')} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={() => { gesture.current = null }}
        onKeyDown={(event) => {
          const delta = event.shiftKey ? 40 : 10
          const changes: Record<string, [number, number]> = { ArrowRight: [delta, 0], ArrowLeft: [-delta, 0], ArrowDown: [0, delta], ArrowUp: [0, -delta] }
          const change = changes[event.key]
          if (!change) return
          event.preventDefault()
          setRect((current) => clampRect({ ...current, width: Math.min(current.width + change[0], maximizedRect(viewport()).left + maximizedRect(viewport()).width - current.left), height: Math.min(current.height + change[1], maximizedRect(viewport()).top + maximizedRect(viewport()).height - current.top) }, viewport()))
        }}>◢</button>
    </section>
  )
}

export default AiWindow
