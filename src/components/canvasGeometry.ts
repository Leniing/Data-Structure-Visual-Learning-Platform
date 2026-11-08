export interface Point { x: number; y: number }

const DATA_CENTER_OFFSET = -17
const DATA_HALF_WIDTH = 31
const MODULE_HALF_WIDTH = 30
const MODULE_HALF_HEIGHT = 16
const ARROW_LENGTH = 8
const ARROW_WIDTH = 4

function boundary(source: Point, center: Point, halfWidth: number, halfHeight: number): Point {
  const dx = source.x - center.x
  const dy = source.y - center.y
  if (dx === 0 && dy === 0) return { x: center.x - halfWidth, y: center.y }
  const scale = 1 / Math.max(Math.abs(dx) / halfWidth, Math.abs(dy) / halfHeight)
  return { x: center.x + dx * scale, y: center.y + dy * scale }
}

export function dataBoundary(source: Point, node: Point): Point {
  return boundary(source, { x: node.x + DATA_CENTER_OFFSET, y: node.y }, DATA_HALF_WIDTH, 24)
}

export function moduleBoundary(source: Point, node: Point): Point {
  return boundary(source, node, MODULE_HALF_WIDTH, MODULE_HALF_HEIGHT)
}

export function connectionArrowPath(source: Point, target: Point, targetIsModule = false): string {
  const end = targetIsModule ? moduleBoundary(source, target) : dataBoundary(source, target)
  const dx = end.x - source.x
  const dy = end.y - source.y
  const length = Math.hypot(dx, dy)
  if (length === 0) return `M ${source.x} ${source.y}`
  const unitX = dx / length
  const unitY = dy / length
  const baseX = end.x - unitX * ARROW_LENGTH
  const baseY = end.y - unitY * ARROW_LENGTH
  const perpendicularX = -unitY * ARROW_WIDTH
  const perpendicularY = unitX * ARROW_WIDTH
  return `M ${source.x} ${source.y} L ${end.x} ${end.y} M ${baseX + perpendicularX} ${baseY + perpendicularY} L ${end.x} ${end.y} L ${baseX - perpendicularX} ${baseY - perpendicularY}`
}
