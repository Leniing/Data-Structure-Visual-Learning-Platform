import { describe, expect, it } from 'vitest'
import { createByTailSteps } from './tailInsertion'
import { getLinkedListCode } from '../teaching/linkedListCode'

describe('createByTailSteps', () => {
  it('creates an empty list without allocating a sentinel', () => {
    const steps = createByTailSteps([])
    expect(steps[0]).toMatchObject({ nodes: [], headId: null, tailId: undefined })
    expect(steps.at(-1)).toMatchObject({ nodes: [], headId: null, tailId: null, codeLineId: null, phase: 'complete' })
    expect(steps.find((step) => step.codeLineId === 'tail-loop-start')?.condition).toBe(false)
  })

  it.each([[7], [3, 1, 4, 1, 5], [-999, 999], Array(12).fill(1)])('preserves input order for %j', (...values: number[]) => {
    const final = createByTailSteps(values).at(-1)!
    expect(final.nodes.map((node) => node.data)).toEqual(values)
    expect(final.headId).toBe('node-0')
    expect(final.tailId).toBe(`node-${values.length - 1}`)
    final.nodes.forEach((node, index) => {
      expect(node.next).toBe(index + 1 < values.length ? `node-${index + 1}` : null)
    })
  })

  it('separates allocation, data read, next initialization and pointer updates', () => {
    const steps = createByTailSteps([5, 7])
    const allocated = steps.find((step) => step.codeLineId === 'tail-create-node')!
    expect(allocated.nodes[0]).toEqual({ id: 'node-0', data: null, next: undefined })
    expect(steps.find((step) => step.codeLineId === 'tail-read-value')!.nodes[0]).toMatchObject({ data: 5, next: undefined })
    expect(steps.filter((step) => step.codeLineId === 'tail-if-first').map((step) => step.condition)).toEqual([true, false])
    const linked = steps.find((step) => step.codeLineId === 'tail-update-next' && step.phase === 'attach')!
    expect(linked.nodes[0]?.next).toBe('node-1')
    expect(linked.tailId).toBe('node-0')
    expect(steps.find((step) => step.codeLineId === 'tail-advance')?.tailId).toBe('node-1')
    expect(steps.filter((step) => step.codeLineId === 'tail-first').map((step) => step.phase)).toEqual(['disconnect', 'attach', 'settle'])
  })

  it('uses independent deeply frozen snapshots and leaves inputs untouched', () => {
    const input = [1, 1, -2]
    const steps = createByTailSteps(input)
    input[0] = 99
    expect(steps.at(-1)!.nodes[0]!.data).toBe(1)
    expect(Object.isFrozen(steps)).toBe(true)
    steps.forEach((step, index) => {
      expect(Object.isFrozen(step)).toBe(true)
      expect(Object.isFrozen(step.nodes)).toBe(true)
      step.nodes.forEach((node) => expect(Object.isFrozen(node)).toBe(true))
      if (index > 0 && step.nodes.length && steps[index - 1]!.nodes.length) {
        expect(step.nodes[0]).not.toBe(steps[index - 1]!.nodes[0])
      }
    })
    expect(steps.find((step) => step.codeLineId === 'tail-create-node')!.nodes[0]!.data).toBeNull()
  })

  it('maps every active line to a unique C teaching line', () => {
    const code = getLinkedListCode('tail', 'c')
    const ids = code.map((line) => line.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const step of createByTailSteps([1, 2])) {
      if (step.codeLineId) expect(ids).toContain(step.codeLineId)
    }
  })

  it.each([[1000], [1.5], [NaN], [Infinity], Array(13).fill(1)])('rejects invalid domain inputs %j', (...values: number[]) => {
    expect(() => createByTailSteps(values)).toThrow(RangeError)
  })
})
