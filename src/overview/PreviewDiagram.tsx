import { useMemo } from 'react'
import BstDrawing from '../components/BstDrawing'
import { connectionArrowPath, moduleBoundary } from '../components/canvasGeometry'
import { useSceneMotion } from '../components/useSceneMotion'
import type { SceneItem } from '../components/tailScene'
import { listPreviewSteps, previewTree, previewTreeEdges, treePreviewSteps } from './previewSteps'
import '../bst.css'

export default function PreviewDiagram({ tree, index }: { tree: boolean; index: number }) {
  return tree ? <svg className="algorithm-diagram algorithm-preview" viewBox="0 0 360 210" role="img" aria-label="二叉搜索树查找 11 的动画预览">
    <g transform="translate(180 105) scale(0.85) translate(-180 -105)">
      <BstDrawing items={previewTree} edges={previewTreeEdges} step={treePreviewSteps[index]} showMotionArrow={false} />
    </g>
  </svg> : <ListPreview index={index} />
}
function ListPreview({ index }: { index: number }) {
  const step = listPreviewSteps[index]
  const target = useMemo<SceneItem[]>(() => step.nodes.map((node, i) => ({
    id: node.id, kind: 'node', label: String(node.data),
    position: { x: i * 90, y: node.id === step.newNodeId ? -60 : 0 },
  })), [step])
  const items = useSceneMotion(target, index !== 0)
  // Center the actual occupied bounds on every interpolated frame.
  const xs = items.map(item => item.position.x), ys = items.map(item => item.position.y)
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2
  return <svg className="algorithm-diagram algorithm-preview" viewBox="0 0 360 210" role="img" aria-label="单链表从 1、2、3 尾插节点 4 的动画预览">
    <g transform={`translate(${180 - cx} ${105 - cy})`}>
      {step.nodes.map(node => {
        const from = items.find(item => item.id === node.id)!
        const to = items.find(item => item.id === node.next)
        if (!to) return null
        const source = moduleBoundary(to.position, from.position, 24)
        return <path key={node.id} data-from={node.id} data-to={to.id} className="svg-arrow" d={connectionArrowPath(source, to.position, true, 24)} />
      })}
      {items.map(item => <g key={item.id} data-preview-node={item.id} transform={`translate(${item.position.x} ${item.position.y})`}>
        <rect x="-30" y="-24" width="60" height="48" rx="6" className="svg-data-cell" />
        <text y="6" textAnchor="middle" className="svg-value">{item.label}</text>
      </g>)}
    </g>
  </svg>
}
