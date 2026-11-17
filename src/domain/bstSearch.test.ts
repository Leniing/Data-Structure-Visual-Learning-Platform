import { describe, expect, it } from 'vitest'
import { createBstSearchSteps, parseSearchValue } from './bstSearch'
import { bstEdges, bstPositions } from './bstTree'
import { getBstCode } from '../teaching/bstCode'

describe.each(['recursive', 'iterative'] as const)('%s search', method => {
  it.each([
    [11, ['14', '7', '11'], 11], [25, ['14', '18', '25'], 25],
    [17, ['14', '18', '18-L'], 'NULL'], [14, ['14'], 14],
    [-2147483648, ['14', '7', '5', '5-L'], 'NULL'], [2147483647, ['14', '18', '25', '25-R'], 'NULL'],
  ] as const)('searches %s with delayed result and immutable snapshots', (target, path, result) => {
    const steps = createBstSearchSteps(target, method)
    expect(steps.filter(s => s.phase === 'check').map(s => s.current)).toEqual(path)
    expect(steps.at(-1)?.result).toBe(result)
    expect(steps.slice(0, -1).every(s => s.result === null)).toBe(true)
    expect(Object.isFrozen(steps)).toBe(true)
    for (const step of steps) {
      expect(Object.isFrozen(step)).toBe(true)
      expect(Object.isFrozen(step.visited)).toBe(true)
      expect(Object.isFrozen(step.traversed)).toBe(true)
      for (const language of ['c', 'cpp'] as const) expect(getBstCode(method, language).find(line => line.id === step.line)?.code.trim()).toBeTruthy()
    }
    const returns = steps.filter(s => s.arrow?.kind === 'return')
    expect(returns.map(s => [s.arrow!.from, s.arrow!.to])).toEqual(method === 'recursive' ? path.slice(1).map((child, i) => [child, path[i]]).reverse() : [])
    expect(returns.every(s => s.phase === 'return' && s.found === (result === 'NULL' ? null : String(target)))).toBe(true)
    const found = steps.findIndex(s => s.phase === 'found')
    if (found >= 0) expect(steps.slice(found).every(s => s.found === String(target))).toBe(true)
    if (method === 'iterative' && found >= 0) expect(steps[found].line).toBe('found')
    expect(steps).toEqual(createBstSearchSteps(target, method))
  })
})
it('keeps all seven NULL children and twelve structural edges', () => {
  expect(bstPositions.filter(node => node.value === null)).toHaveLength(7)
  expect(bstEdges).toHaveLength(12)
})
it('validates empty, non-integral and out-of-range inputs', () => {
  for (const input of ['', ' ', '1.1', '1e2', 'abc', '1 2', '2147483648', '-2147483649']) expect(parseSearchValue(input).ok).toBe(false)
  for (const input of ['-2147483648', '2147483647', '+11', ' 17 ']) expect(parseSearchValue(input).ok).toBe(true)
  expect(() => createBstSearchSteps(NaN, 'recursive')).toThrow(RangeError)
})
