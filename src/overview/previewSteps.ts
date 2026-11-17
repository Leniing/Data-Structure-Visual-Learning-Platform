import { createByTailSteps } from '../domain/tailInsertion'
import { createBstSearchSteps } from '../domain/bstSearch'
import type { BstNode } from '../domain/bstTree'

export const previewTree: readonly BstNode[] = Object.freeze([
  { id: '14', value: 14, left: '7', right: '18', x: 180, y: 35 },
  { id: '7', value: 7, left: '5', right: '11', x: 100, y: 105 },
  { id: '18', value: 18, left: '16', right: '25', x: 260, y: 105 },
  { id: '5', value: 5, left: '5-L', right: '5-R', x: 55, y: 175 },
  { id: '11', value: 11, left: '11-L', right: '11-R', x: 135, y: 175 },
  { id: '16', value: 16, left: '16-L', right: '16-R', x: 225, y: 175 },
  { id: '25', value: 25, left: '25-L', right: '25-R', x: 305, y: 175 },
].map(node => Object.freeze(node)))
export const previewTreeEdges = previewTree.flatMap(node => [node.left, node.right]
  .filter(id => previewTree.some(child => child.id === id)).map(to => ({ from: node.id, to })))
const tailSteps = createByTailSteps([1, 2, 3, 4])
export const listPreviewSteps = Object.freeze([
  tailSteps.find(step => step.nodes.length === 3 && step.phase === 'settle')!,
  tailSteps.find(step => step.nodes.length === 4 && step.codeLineId === 'tail-link-node')!,
  tailSteps.find(step => step.nodes.length === 4 && step.phase === 'attach')!,
  tailSteps.find(step => step.nodes.length === 4 && step.phase === 'settle')!,
])
export const treePreviewSteps = Object.freeze([null, ...createBstSearchSteps(11, 'iterative', previewTree)
  .filter(step => step.phase === 'enter' || step.phase === 'move' || step.phase === 'found')])
