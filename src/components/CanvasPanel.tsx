import { useEffect, useRef, useState } from 'react'
import { connectionArrowPath, moduleBoundary } from './canvasGeometry'
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
  const [positions, setPositions] = useState([{ x: 160, y: 120 }, { x: 300, y: 120 }, { x: 440, y: 120 }])
  const [headPosition, setHeadPosition] = useState({ x: 48, y: 120 })
  const [nullPosition, setNullPosition] = useState({ x: 552, y: 120 })
  const svgRef = useRef<SVGSVGElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ pointerId: number; x: number; y: number; offsetX: number; offsetY: number; nodeIndex: number | null; target: 'node' | 'head' | 'null' | 'canvas' } | null>(null)

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
    const nodeElement = target.closest('[data-node-index]')
    const draggableElement = target.closest('[data-drag-target]')
    const nodeIndex = nodeElement ? Number(nodeElement.getAttribute('data-node-index')) : null
    const dragTarget = draggableElement?.getAttribute('data-drag-target')
    const targetType: 'node' | 'head' | 'null' | 'canvas' = nodeIndex !== null ? 'node' : dragTarget === 'head' || dragTarget === 'null' ? dragTarget : 'canvas'
    const position = targetType === 'node' ? positions[nodeIndex!] : targetType === 'head' ? headPosition : targetType === 'null' ? nullPosition : offset
    if (!position) return
    dragStart.current = { pointerId: event.pointerId, x: point.x, y: point.y, offsetX: position.x, offsetY: position.y, nodeIndex, target: targetType }
    setIsDragging(true)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    if (!start || start.pointerId !== event.pointerId) return
    const point = svgPoint(event.clientX, event.clientY)
    if (!point) return
    const isCanvas = start.target === 'canvas'
    const divisor = isCanvas ? 1 : zoom
    const position = { x: start.offsetX + (point.x - start.x) / divisor, y: start.offsetY + (point.y - start.y) / divisor }
    if (isCanvas) setOffset(position)
    else if (start.target === 'head') setHeadPosition(position)
    else if (start.target === 'null') setNullPosition(position)
    else setPositions((current) => current.map((node, index) => index === start.nodeIndex ? position : node))
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
        onLostPointerCapture={stopDragging}
        role="application"
        aria-label="可缩放和拖动的链表画布"
      >
        <svg ref={svgRef} viewBox="0 0 600 260" role="img" aria-labelledby="diagram-title diagram-description">
          <title id="diagram-title">单链表节点拖动示意</title>
          <desc id="diagram-description">三个演示节点。每个节点由数据域和指针域组成，节点可单独拖动，箭头连接指针域与下一个数据域。</desc>
          <g transform={`translate(${offset.x + 300 * (1 - zoom)} ${offset.y + 130 * (1 - zoom)}) scale(${zoom})`}>
            <g data-drag-target="head" className="canvas-node canvas-endpoint" transform={`translate(${headPosition.x} ${headPosition.y})`}>
              <rect x="-30" y="-16" width="60" height="32" className="svg-ghost-target" />
              <text x="0" y="6" textAnchor="middle" className="svg-endpoint-label">head</text>
            </g>
            <path d={connectionArrowPath(moduleBoundary({ x: positions[0]!.x - 17, y: positions[0]!.y }, headPosition), positions[0]!)} className="svg-arrow" />
            {positions.slice(0, -1).map((position, index) => {
              const nextPosition = positions[index + 1]!
              return (
                <path
                  key={`link-${index}`}
                  d={connectionArrowPath({ x: position.x + 48, y: position.y }, nextPosition)}
                  className="svg-arrow"
                />
              )
            })}
            <path d={connectionArrowPath({ x: positions[2]!.x + 48, y: positions[2]!.y }, nullPosition, true)} className="svg-arrow" />
            {positions.map((position, index) => (
              <g key={`node-${index}`} data-node-index={index} className="canvas-node" transform={`translate(${position.x} ${position.y})`}>
                <rect x="-48" y="-24" width="62" height="48" rx="5" className="svg-data-cell" />
                <rect x="20" y="-24" width="28" height="48" rx="5" className="svg-pointer-cell" />
                <text x="-17" y="6" textAnchor="middle" className="svg-value">{[5, 7, 4][index]}</text>
              </g>
            ))}
            <g data-drag-target="null" className="canvas-node canvas-endpoint" transform={`translate(${nullPosition.x} ${nullPosition.y})`}>
              <rect x="-30" y="-16" width="60" height="32" className="svg-ghost-target" />
              <text x="0" y="6" textAnchor="middle" className="svg-endpoint-label">NULL</text>
            </g>
          </g>
        </svg>
        <p className="canvas-caption">拖动节点调整位置，拖动空白平移 · 滚轮缩放 {Math.round(zoom * 100)}%</p>
      </div>
      <p className="panel-note">演示数据：5、7、4。头结点不保存用户数据；尚未连接输入或算法步骤。</p>
    </section>
  )
}
