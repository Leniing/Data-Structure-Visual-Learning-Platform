import { useEffect, useMemo, useRef, useState } from 'react'
import type { Point } from './canvasGeometry'
import { headScene, sceneArrow, tailScene } from './tailScene'
import { useSceneMotion } from './useSceneMotion'
import type { HeadInsertionStep } from '../domain/headInsertion'
import type { TailInsertionStep } from '../domain/tailInsertion'
import type { PointerEvent } from 'react'
import type { InsertMethod } from '../algorithms/parseListInput'

const MIN_ZOOM = 0.6
const MAX_ZOOM = 1.8
const ZOOM_STEP = 0.1

interface CanvasPanelProps {
  insertMethod: InsertMethod
  onInsertMethodChange: (method: InsertMethod) => void
  step: TailInsertionStep | HeadInsertionStep | null
  playing: boolean
}

export default function CanvasPanel({ insertMethod, onInsertMethodChange, step, playing }: CanvasPanelProps) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const scene = useMemo(() => insertMethod === 'head' ? headScene(step as HeadInsertionStep | null) : tailScene(step as TailInsertionStep | null), [insertMethod, step])
  const animatedItems = useSceneMotion(scene.items)
  const [dragged, setDragged] = useState<{ step: TailInsertionStep | HeadInsertionStep | null; positions: Record<string, Point> }>({ step: null, positions: {} })
  const items = animatedItems.map((item) => ({ ...item, position: dragged.step === step ? dragged.positions[item.id] ?? item.position : item.position }))
  const svgRef = useRef<SVGSVGElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ pointerId: number; x: number; y: number; offsetX: number; offsetY: number; target: string | null; step: TailInsertionStep | HeadInsertionStep | null } | null>(null)

  const svgPoint = (clientX: number, clientY: number) => {
    const matrix = svgRef.current?.getScreenCTM()
    return matrix ? new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse()) : null
  }

  useEffect(() => {
    const surface = surfaceRef.current
    if (!surface) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      if (dragStart.current) return
      setZoom((currentZoom) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom - Math.sign(event.deltaY) * ZOOM_STEP)))
    }

    surface.addEventListener('wheel', handleWheel, { passive: false })
    return () => surface.removeEventListener('wheel', handleWheel)
  }, [])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || dragStart.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = svgPoint(event.clientX, event.clientY)
    if (!point) return
    const target = event.target as Element
    const dragTarget = target.closest('[data-scene-id]')?.getAttribute('data-scene-id') ?? null
    if (dragTarget && playing) return
    const position = dragTarget ? items.find((item) => item.id === dragTarget)?.position : offset
    if (!position) return
    dragStart.current = { pointerId: event.pointerId, x: point.x, y: point.y, offsetX: position.x, offsetY: position.y, target: dragTarget, step }
    setIsDragging(true)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    if (!start || start.pointerId !== event.pointerId) return
    const point = svgPoint(event.clientX, event.clientY)
    if (!point) return
    const isCanvas = start.target === null
    if (!isCanvas && (playing || start.step !== step)) return
    const divisor = isCanvas ? 1 : zoom
    const position = { x: start.offsetX + (point.x - start.x) / divisor, y: start.offsetY + (point.y - start.y) / divisor }
    if (isCanvas) setOffset(position)
    else setDragged((current) => ({ step, positions: { ...(current.step === step ? current.positions : {}), [start.target!]: position } }))
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
        </div>
      </div>
      <div
        ref={surfaceRef}
        className={`canvas-surface ${isDragging ? 'is-dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onLostPointerCapture={stopDragging}
        role="application"
        aria-label="可缩放和拖动的链表画布"
      >
        <svg ref={svgRef} viewBox={`0 0 ${scene.width} ${scene.height}`} role="img" aria-labelledby="diagram-title diagram-description">
          <title id="diagram-title">无头结点{insertMethod === 'head' ? '头插法' : '尾插法'}创建动画</title>
          <desc id="diagram-description">{step?.description ?? '画布为空，请填写两行输入并点击创建链表。'}</desc>
          <g transform={`translate(${offset.x + scene.width / 2 * (1 - zoom)} ${offset.y + scene.height / 2 * (1 - zoom)}) scale(${zoom})`}>
            {scene.links.map((link) => {
              const from = items.find((item) => item.id === link.from)
              const to = items.find((item) => item.id === link.to)
              return from && to ? <path key={link.id} data-link-id={link.id} data-from={link.from} data-to={link.to} d={sceneArrow(from, to)} className="svg-arrow" /> : null
            })}
            {items.map((item) => (
              <g key={item.id} data-scene-id={item.id} data-kind={item.kind} className="canvas-node" transform={`translate(${item.position.x} ${item.position.y})`}>
                {item.kind === 'node' ? <>
                  <rect x="-48" y="-24" width="62" height="48" rx="5" className="svg-data-cell" />
                  <rect x="20" y="-24" width="28" height="48" rx="5" className="svg-pointer-cell" />
                  <text x="-17" y="6" textAnchor="middle" className="svg-value">{item.label}</text>
                  {item.pending && <text x="-60" y="6" textAnchor="end" className="svg-endpoint-label">s</text>}
                </> : <>
                  <rect x="-30" y="-16" width="60" height="32" className="svg-ghost-target" />
                  <text x="0" y="6" textAnchor="middle" className="svg-endpoint-label">{item.label}</text>
                </>}
              </g>
            ))}
          </g>
        </svg>
        <div className="canvas-zoom" role="group" aria-label="画布缩放" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" aria-label="缩小" title="缩小" disabled={zoom <= MIN_ZOOM} onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))}>−</button>
          <output aria-label="缩放比例">{Math.round(zoom * 100)}%</output>
          <button type="button" aria-label="放大" title="放大" disabled={zoom >= MAX_ZOOM} onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))}>+</button>
        </div>
      </div>
    </section>
  )
}
