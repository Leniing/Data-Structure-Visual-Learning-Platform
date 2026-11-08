import { describe, expect, it } from 'vitest'
import { connectionArrowPath, dataBoundary, moduleBoundary } from './canvasGeometry'

describe('canvas connections', () => {
  it('connects the pointer edge to the left data edge with an open arrow head', () => {
    expect(connectionArrowPath({ x: 147, y: 120 }, { x: 300, y: 120 })).toBe('M 147 120 L 252 120 M 244 124 L 252 120 L 244 116')
  })

  it('ends on the data boundary from every direction', () => {
    const node = { x: 300, y: 120 }
    for (const source of [{ x: 100, y: 20 }, { x: 500, y: 220 }, { x: 279, y: 0 }, { x: 279, y: 250 }]) {
      const end = dataBoundary(source, node)
      expect(Math.max(Math.abs(end.x - 283) / 31, Math.abs(end.y - 120) / 24)).toBeCloseTo(1)
      expect((end.x - 283) * (source.y - 120) - (end.y - 120) * (source.x - 283)).toBeCloseTo(0)
    }
  })

  it('uses the same compact module boundary in every direction', () => {
    const center = { x: 300, y: 120 }
    for (const source of [{ x: 0, y: 120 }, { x: 600, y: 120 }, { x: 300, y: 0 }, { x: 400, y: 300 }]) {
      const edge = moduleBoundary(source, center)
      expect(Math.max(Math.abs(edge.x - center.x) / 30, Math.abs(edge.y - center.y) / 16)).toBeCloseTo(1)
      expect((edge.x - center.x) * (source.y - center.y) - (edge.y - center.y) * (source.x - center.x)).toBeCloseTo(0)
    }
    expect(moduleBoundary({ x: 300, y: 0 }, center)).toEqual({ x: 300, y: 104 })
    expect(connectionArrowPath({ x: 200, y: 120 }, center, true)).toContain('L 270 120')
  })

  it('handles overlapping centers without invalid coordinates', () => {
    expect(dataBoundary({ x: 283, y: 120 }, { x: 300, y: 120 })).toEqual({ x: 252, y: 120 })
    expect(moduleBoundary({ x: 300, y: 120 }, { x: 300, y: 120 })).toEqual({ x: 270, y: 120 })
  })
})
