import { useEffect, useRef, useState } from 'react'
import { bstEdges, bstPositions } from '../domain/bstTree'

import type { BstVisualState } from '../domain/bstSearch'

// Clip both ends and offset the arrow parallel to the structural edge.
function bstSegment(positions: readonly { id: string; value: number | null; x: number; y: number }[], from: string, to: string, offset = 0) {
  const a = positions.find(node => node.id === from)!
  const b = positions.find(node => node.id === to)!
  const distance = Math.hypot(b.x - a.x, b.y - a.y)
  const dx = distance ? (b.x - a.x) / distance : 0, dy = distance ? (b.y - a.y) / distance : 0
  // Structural lines meet the circle (r=25) or the linked-list NULL boundary
  // (60 × 32) directly. Only the offset animation arrows retain clearance.
  const padding = offset === 0 ? 0 : 5
  const clearance = (isNull: boolean) => (isNull ? Math.min(30 / Math.abs(dx), 16 / Math.abs(dy)) : 25) + padding
  const start = clearance(a.value === null), end = clearance(b.value === null)
  // Overlapping dragged items must not produce reversed lines or invalid coordinates.
  if (distance <= start + end) return { x1: a.x, y1: a.y, x2: a.x, y2: a.y, visibility: 'hidden' as const }
  return { x1: a.x + dx * start - dy * offset, y1: a.y + dy * start + dx * offset,
    x2: b.x - dx * end - dy * offset, y2: b.y - dy * end + dx * offset }
}

export default function BstCanvas({ method, onMethodChange, step }: {
  method: 'recursive' | 'iterative'
  onMethodChange: (method: 'recursive' | 'iterative') => void
  step: BstVisualState | null
}) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({})
  const items = bstPositions.map(node => ({ ...node, ...positions[node.id] }))
  const [dragging, setDragging] = useState(false)
  const surface = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<{ id: number; target: string | null; x: number; y: number; ox: number; oy: number } | null>(null)
  const changeZoom = (delta: number) => setZoom(value => Math.max(.6, Math.min(1.8, Math.round((value + delta) * 10) / 10)))
  useEffect(() => {
    const element = surface.current!
    const wheel = (event: WheelEvent) => { event.preventDefault(); if (!drag.current) changeZoom(-Math.sign(event.deltaY) * .1) }
    element.addEventListener('wheel', wheel, { passive: false })
    return () => element.removeEventListener('wheel', wheel)
  }, [])
  const point = (x: number, y: number) => {
    const matrix = svg.current?.getScreenCTM()
    return matrix ? new DOMPoint(x, y).matrixTransform(matrix.inverse()) : null
  }
  const stop = () => { drag.current = null; setDragging(false) }
  return <section className="canvas-panel panel bst-canvas" aria-labelledby="bst-canvas-title">
    <div className="panel-heading"><h2 id="bst-canvas-title">画布</h2>
      <div className="method-switch" role="group" aria-label="查找方式">
        {(['recursive', 'iterative'] as const).map(value => <button key={value} type="button" className={method === value ? 'selected' : ''} aria-pressed={method === value} onClick={() => onMethodChange(value)}>{value === 'recursive' ? '递归' : '非递归'}</button>)}
      </div>
    </div>
    <div ref={surface} className={`canvas-surface ${dragging ? 'is-dragging' : ''}`} role="application" aria-label="可缩放和平移的二叉搜索树画布"
      onPointerDown={event => {
        if (event.button !== 0 || drag.current) return
        const p = point(event.clientX, event.clientY)
        if (!p) return
        const target = (event.target as Element).closest('[data-bst-node]')?.getAttribute('data-bst-node') ?? null
        const position = target ? items.find(node => node.id === target)! : offset
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { id: event.pointerId, target, x: p.x, y: p.y, ox: position.x, oy: position.y }; setDragging(true)
      }}
      onPointerMove={event => {
        const start = drag.current
        if (!start || start.id !== event.pointerId) return
        const p = point(event.clientX, event.clientY)
        if (!p) return
        const divisor = start.target ? zoom : 1
        const position = { x: start.ox + (p.x - start.x) / divisor, y: start.oy + (p.y - start.y) / divisor }
        if (start.target) setPositions(current => ({ ...current, [start.target!]: position }))
        else setOffset(position)
      }} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>
      <svg ref={svg} viewBox="0 0 720 470" role="img" aria-label="预设二叉搜索树">
        <defs>{(['down', 'return'] as const).map(kind => <marker key={kind} id={`bst-${kind}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" className={`bst-arrow-head ${kind}`} /></marker>)}</defs>
        <g transform={`translate(${offset.x + 360 * (1 - zoom)} ${offset.y + 235 * (1 - zoom)}) scale(${zoom})`}>
          {bstEdges.map(edge => <line key={edge.to} data-edge={edge.to} {...bstSegment(items, edge.from, edge.to)} className={`bst-edge ${step?.traversed.includes(edge.to) ? 'visited' : ''}`} />)}
          {step?.arrow && <line data-arrow={step.arrow.kind} data-from={step.arrow.from} data-to={step.arrow.to} {...bstSegment(items, step.arrow.from, step.arrow.to, 11)} className={`bst-motion-arrow ${step.arrow.kind}`} markerEnd={`url(#bst-${step.arrow.kind})`} />}
          {items.map(node => {
            const state = step?.found === node.id ? 'found' : step?.failed === node.id ? 'failed' : step?.current === node.id ? 'current' : step?.visited.includes(node.id) ? 'visited' : 'default'
            return <g key={node.id} className="canvas-node" data-bst-node={node.id} data-state={state} transform={`translate(${node.x} ${node.y})`}>
              {node.value !== null ? <circle r="25" className={`svg-data-cell bst-node ${state}`} /> : <rect x="-30" y="-16" width="60" height="32" className="svg-ghost-target" />}
              <text textAnchor="middle" y="6" className={node.value === null ? `svg-endpoint-label bst-null ${state}` : 'svg-value'}>{node.value ?? 'NULL'}</text>
            </g>
          })}
        </g>
      </svg>
      <div className="canvas-zoom" role="group" aria-label="画布缩放" onPointerDown={event => event.stopPropagation()}>
        <button type="button" aria-label="缩小" disabled={zoom <= .6} onClick={() => changeZoom(-.1)}>−</button><output aria-label="缩放比例">{Math.round(zoom * 100)}%</output><button type="button" aria-label="放大" disabled={zoom >= 1.8} onClick={() => changeZoom(.1)}>+</button>
      </div>
    </div>
  </section>
}
