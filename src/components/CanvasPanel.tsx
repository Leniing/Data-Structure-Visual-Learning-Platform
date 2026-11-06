import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { InsertMethod } from '../algorithms/parseListInput'

const MIN_ZOOM = 0.6
const MAX_ZOOM = 1.8
const ZOOM_STEP = 0.1

interface CanvasPanelProps {
  insertMethod: InsertMethod
  onInsertMethodChange: (method: InsertMethod) => void
}

export default function CanvasPanel({ insertMethod, onInsertMethodChange }: CanvasPanelProps) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ pointerId: number; x: number; y: number; offsetX: number; offsetY: number } | null>(null)

  useEffect(() => {
    const surface = surfaceRef.current
    if (!surface) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      setZoom((currentZoom) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom - Math.sign(event.deltaY) * ZOOM_STEP)))
    }

    surface.addEventListener('wheel', handleWheel, { passive: false })
    return () => surface.removeEventListener('wheel', handleWheel)
  }, [])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y }
    setIsDragging(true)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    if (!start || start.pointerId !== event.pointerId) return
    setOffset({ x: start.offsetX + event.clientX - start.x, y: start.offsetY + event.clientY - start.y })
  }

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current?.pointerId === event.pointerId) {
      dragStart.current = null
      setIsDragging(false)
    }
  }

  return (
    <section className="canvas-panel panel" aria-labelledby="canvas-title">
      <div className="panel-heading">
        <h2 id="canvas-title">链表画布</h2>
        <div className="canvas-heading-controls">
          <div className="method-switch" role="group" aria-label="插入方式">
            <button type="button" className={insertMethod === 'head' ? 'selected' : ''} onClick={() => onInsertMethodChange('head')}>头插法</button>
            <button type="button" className={insertMethod === 'tail' ? 'selected' : ''} onClick={() => onInsertMethodChange('tail')}>尾插法</button>
          </div>
          <span className="badge">静态示意</span>
        </div>
      </div>
      <div
        ref={surfaceRef}
        className={`canvas-surface ${isDragging ? 'is-dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        role="application"
        aria-label="可缩放和拖动的链表画布"
      >
        <svg viewBox="0 0 600 260" role="img" aria-labelledby="diagram-title diagram-description">
          <title id="diagram-title">单链表画布占位示意</title>
          <desc id="diagram-description">头指针指向空值 NULL，尚未创建节点。此图不代表算法执行状态。</desc>
          <g transform={`translate(${offset.x} ${offset.y}) scale(${zoom})`}>
            <text x="210" y="110" className="svg-label">头指针</text>
            <text x="210" y="143" className="svg-value">head</text>
            <path d="M 258 135 H 322 M 313 128 L 322 135 L 313 142" className="svg-arrow" />
            <rect x="340" y="113" width="80" height="44" rx="8" className="svg-null-box" />
            <text x="380" y="141" textAnchor="middle" className="svg-value">NULL</text>
          </g>
        </svg>
        <p className="canvas-caption">滚轮缩放，按住鼠标拖动画布 · {Math.round(zoom * 100)}%</p>
      </div>
      <p className="panel-note">当前仅为布局预览，尚未连接算法步骤。</p>
    </section>
  )
}
