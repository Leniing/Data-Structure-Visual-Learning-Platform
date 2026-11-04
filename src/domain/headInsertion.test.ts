import { describe, expect, it } from 'vitest'
import { createByHeadSteps } from './headInsertion'

describe('createByHeadSteps', () => {
  it('records head creation and return for empty input', () => {
    const steps = createByHeadSteps([])

    expect(steps.map((step) => step.codeLineId)).toEqual(['head-sentinel', 'head-return'])
    expect(steps[0]?.nodes).toEqual([{ id: 'head', data: null, next: null }])
    expect(steps.at(-1)?.headId).toBe('head')
  })

  it('creates one node with the expected head-insertion sequence', () => {
    const steps = createByHeadSteps([7])

    expect(steps.map((step) => step.codeLineId)).toEqual([
      'head-sentinel',
      'head-read-value',
      'head-create-node',
      'head-link-node',
      'head-update-next',
      'head-return',
    ])
    expect(steps[2]?.nodes).toEqual([
      { id: 'head', data: null, next: null },
      { id: 'node-0', data: 7, next: null },
    ])
    expect(steps[4]?.nodes).toEqual([
      { id: 'head', data: null, next: 'node-0' },
      { id: 'node-0', data: 7, next: null },
    ])
  })

  it('keeps repeated values in distinct nodes', () => {
    const steps = createByHeadSteps([2, 2])
    const finalNodes = steps.at(-1)?.nodes

    expect(finalNodes).toEqual([
      { id: 'head', data: null, next: 'node-1' },
      { id: 'node-0', data: 2, next: null },
      { id: 'node-1', data: 2, next: 'node-0' },
    ])
  })

  it('records the intermediate pointer relationship before updating head', () => {
    const steps = createByHeadSteps([3, 1, 4])
    const linkSecondNode = steps.find((step) => step.codeLineId === 'head-link-node' && step.inputIndex === 1)

    expect(linkSecondNode?.nodes).toEqual([
      { id: 'head', data: null, next: 'node-0' },
      { id: 'node-0', data: 3, next: null },
      { id: 'node-1', data: 1, next: 'node-0' },
    ])
    expect(linkSecondNode?.newNodeId).toBe('node-1')
  })

  it('does not mutate earlier snapshots when later steps change pointers', () => {
    const steps = createByHeadSteps([3, 1])
    const firstUpdate = steps.find((step) => step.codeLineId === 'head-update-next' && step.inputIndex === 0)
    const finalStep = steps.at(-1)

    expect(firstUpdate?.nodes[0]).toEqual({ id: 'head', data: null, next: 'node-0' })
    expect(finalStep?.nodes[0]).toEqual({ id: 'head', data: null, next: 'node-1' })
    expect(firstUpdate?.nodes[0]).not.toBe(finalStep?.nodes[0])
    expect(Object.isFrozen(firstUpdate?.nodes[0])).toBe(true)
    expect(Object.isFrozen(firstUpdate?.nodes)).toBe(true)
    expect(Object.isFrozen(steps)).toBe(true)
  })
})
