import { useId } from 'react'
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

export default function BstDrawing({ items, edges, step, markerPrefix, showMotionArrow = true }: {
 items: readonly { id: string; value: number | null; x: number; y: number }[]
 edges: readonly { from: string; to: string }[]
 markerPrefix?: string
 showMotionArrow?: boolean
 step: BstVisualState | null
}) {
 const instanceId = useId().replace(/:/g, '')
 const markerId = markerPrefix ?? instanceId
 return <>
        {showMotionArrow && <defs>{(['down', 'return'] as const).map(kind => <marker key={kind} id={`${markerId}-${kind}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" className={`bst-arrow-head ${kind}`} /></marker>)}</defs>}
        <g>
          {edges.map(edge => <line key={edge.to} data-edge={edge.to} {...bstSegment(items, edge.from, edge.to)} className={`bst-edge ${step?.traversed.includes(edge.to) ? 'visited' : ''}`} />)}
          {showMotionArrow && step?.arrow && <line data-arrow={step.arrow.kind} data-from={step.arrow.from} data-to={step.arrow.to} {...bstSegment(items, step.arrow.from, step.arrow.to, 11)} className={`bst-motion-arrow ${step.arrow.kind}`} markerEnd={`url(#${markerId}-${step.arrow.kind})`} />}
          {items.map(node => {
            const state = step?.found === node.id ? 'found' : step?.failed === node.id ? 'failed' : step?.current === node.id ? 'current' : step?.visited.includes(node.id) ? 'visited' : 'default'
            return <g key={node.id} className="canvas-node" data-bst-node={node.id} data-state={state} transform={`translate(${node.x} ${node.y})`}>
              {node.value !== null ? <circle r="25" className={`svg-data-cell bst-node ${state}`} /> : <rect x="-30" y="-16" width="60" height="32" className="svg-ghost-target" />}
              <text textAnchor="middle" y="6" className={node.value === null ? `svg-endpoint-label bst-null ${state}` : 'svg-value'}>{node.value ?? 'NULL'}</text>
            </g>
          })}
        </g>
</>
}
