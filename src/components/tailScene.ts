import type { HeadInsertionStep } from '../domain/headInsertion'
import type { TailInsertionStep } from '../domain/tailInsertion'
import { connectionArrowPath, moduleBoundary, type Point } from './canvasGeometry'

export interface SceneItem {
  id: string
  kind: 'node' | 'pointer' | 'null'
  position: Point
  label: string
  pending?: boolean
}

export interface SceneLink {
  id: string
  from: string
  to: string
}

const settledPosition = (index: number): Point => ({ x: 160 + index * 140, y: 130 })

export function headScene(step: HeadInsertionStep | null) {
  const items: SceneItem[] = []
  const links: SceneLink[] = []
  if (!step) return { items, links, height: 300, width: 660 }

  const arrowLength = 62
  const firstNodeX = 48 + 30 + arrowLength + 48
  const nodeSpacing = 96 + arrowLength
  const pendingPosition = { x: 48 + 30 + arrowLength / 2, y: 55 }
  const settledPosition = (index: number): Point => ({ x: firstNodeX + index * nodeSpacing, y: 130 })
  const nodeById = new Map(step.nodes.map((node) => [node.id, node]))
  const orderedIds: string[] = []
  let currentId = step.headId
  while (currentId !== null && currentId !== undefined && !orderedIds.includes(currentId)) {
    orderedIds.push(currentId)
    currentId = nodeById.get(currentId)?.next ?? null
  }
  for (const node of step.nodes) {
    if (!orderedIds.includes(node.id)) orderedIds.push(node.id)
  }
  const settledIds = orderedIds.filter((id) => id !== step.newNodeId)
  for (const nodeId of orderedIds) {
    const node = nodeById.get(nodeId)
    if (!node) continue
    items.push({
      id: node.id,
      kind: 'node',
      position: node.id === step.newNodeId ? pendingPosition : settledPosition(settledIds.indexOf(node.id)),
      label: node.data === null ? '' : String(node.data),
      pending: node.id === step.newNodeId && step.phase !== 'attach',
    })
  }

  const nullTarget = (sourceId: string) => {
    const id = 'null-end'
    if (!items.some((item) => item.id === id)) {
      const source = items.find((item) => item.id === sourceId)
      const x = source?.kind === 'node' && source.id !== step.newNodeId
        ? source.position.x + 48 + arrowLength + 30
        : 48 + 30 + arrowLength + 30
      items.push({ id, kind: 'null', label: 'NULL', position: { x, y: 130 } })
    }
    return id
  }

  items.push({ id: 'head', kind: 'pointer', position: { x: 48, y: 130 }, label: 'head' })
  const isDisconnect = step.phase === 'disconnect'
  if (!isDisconnect) links.push({ id: 'head-link', from: 'head', to: step.headId ?? nullTarget('head') })
  for (const node of step.nodes) {
    if (node.next === undefined) continue
    links.push({ id: `${node.id}-next`, from: node.id, to: node.next ?? nullTarget(node.id) })
  }
  const height = Math.max(300, ...items.map((item) => item.position.y + 75))
  const width = Math.max(660, ...items.map((item) => item.position.x + 80))
  return { items, links, height, width }
}

export function tailScene(step: TailInsertionStep | null) {
  const items: SceneItem[] = []
  const links: SceneLink[] = []
  if (!step) return { items, links, height: 300, width: 660 }
  const pendingIndex = step.nodes.findIndex((node) => node.id === step.newNodeId)
  const pendingPosition = pendingIndex <= 0 ? { x: 120, y: 55 } : (() => {
    const previous = settledPosition(pendingIndex - 1)
    return { x: previous.x + 85, y: previous.y - 70 }
  })()
  for (const [index, node] of step.nodes.entries()) {
    items.push({ id: node.id, kind: 'node', position: node.id === step.newNodeId ? pendingPosition : settledPosition(index), label: node.data === null ? '' : String(node.data), pending: node.id === step.newNodeId })
  }
  const positionOf = (id: string) => items.find((item) => item.id === id)!.position
  const nullTarget = (sourceId: string, isNew: boolean) => {
    const id = isNew ? 'null-new' : 'null-end'
    if (!items.some((item) => item.id === id)) {
      const source = items.find((item) => item.id === sourceId)
      items.push({ id, kind: 'null', label: 'NULL', position: source?.kind === 'node' ? { x: source.position.x + 110, y: source.position.y } : { x: 180, y: 130 } })
    }
    return id
  }
  const disconnect = step.phase === 'disconnect'
  const firstDisconnect = disconnect && step.headId === null
  if (step.headId !== undefined) {
    items.push({ id: 'head', kind: 'pointer', position: { x: 48, y: 130 }, label: 'head' })
    if (!firstDisconnect) links.push({ id: 'head-link', from: 'head', to: step.headId ?? nullTarget('head', false) })
  }
  if (step.tailId !== undefined) {
    // While s is raised, keep tail below its previous resting position.
    const target = step.tailId === null ? { x: 180, y: 130 } : step.tailId === step.newNodeId ? settledPosition(pendingIndex) : positionOf(step.tailId)
    items.push({ id: 'tail', kind: 'pointer', position: { x: target.x - (step.tailId ? 17 : 0), y: target.y + 85 }, label: 'tail' })
    if (!firstDisconnect) links.push({ id: 'tail-link', from: 'tail', to: step.tailId ?? nullTarget('tail', false) })
  }
  for (const node of step.nodes) {
    if (node.next === undefined) continue
    if (disconnect && node.id === step.tailId && node.id !== step.newNodeId) continue
    links.push({ id: `${node.id}-next`, from: node.id, to: node.next ?? nullTarget(node.id, node.id === step.newNodeId) })
  }
  const height = Math.max(300, ...items.map((item) => item.position.y + 75))
  const width = Math.max(660, ...items.map((item) => item.position.x + 80))
  return { items, links, height, width }
}

export function sceneArrow(from: SceneItem, to: SceneItem): string {
  const center = to.kind === 'node' ? { x: to.position.x - 17, y: to.position.y } : to.position
  const source = from.kind === 'node' ? { x: from.position.x + 48, y: from.position.y } : moduleBoundary(center, from.position)
  return connectionArrowPath(source, to.position, to.kind !== 'node')
}
