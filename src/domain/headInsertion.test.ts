import { describe, expect, it } from 'vitest'
import { createByHeadSteps } from './headInsertion'

describe('createByHeadSteps', () => {
  it('records empty-list creation and loop completion', () => {
    const steps = createByHeadSteps([])

    expect(steps.map((step) => step.codeLineId)).toEqual([
      'head-head', 'head-count-declare', 'head-count', 'head-loop-start', null,
    ])
    expect(steps[0]?.nodes).toEqual([])
    expect(steps.at(-1)?.headId).toBeNull()
  })

  it('creates one node with the expected head-insertion sequence', () => {
    const steps = createByHeadSteps([7])

    expect(steps.map((step) => step.codeLineId)).toEqual([
      'head-head', 'head-count-declare', 'head-count', 'head-loop-start',
      'head-create-node', 'head-read-value', 'head-link-node',
      'head-update', 'head-update', 'head-update', 'head-loop-start', null,
    ])
    expect(steps[4]?.nodes).toEqual([{ id: 'node-0', data: null, next: undefined }])
    expect(steps[6]?.nodes).toEqual([{ id: 'node-0', data: 7, next: null }])
    expect(steps[9]?.headId).toBe('node-0')
  })

  it('keeps repeated values in distinct nodes', () => {
    const steps = createByHeadSteps([2, 2])
    const finalNodes = steps.at(-1)?.nodes

    expect(finalNodes).toEqual([
      { id: 'node-0', data: 2, next: null },
      { id: 'node-1', data: 2, next: 'node-0' },
    ])
  })

  it('records the intermediate pointer relationship before updating head', () => {
    const steps = createByHeadSteps([3, 1, 4])
    const linkSecondNode = steps.find((step) => step.codeLineId === 'head-link-node' && step.inputIndex === 1)

    expect(linkSecondNode?.nodes).toEqual([
      { id: 'node-0', data: 3, next: null },
      { id: 'node-1', data: 1, next: 'node-0' },
    ])
    expect(linkSecondNode?.newNodeId).toBe('node-1')
  })

  it('does not mutate earlier snapshots when later steps change pointers', () => {
    const steps = createByHeadSteps([3, 1])
    const firstUpdate = steps.find((step) => step.codeLineId === 'head-update' && step.inputIndex === 0 && step.phase === 'attach')
    const finalStep = steps.at(-1)

    expect(firstUpdate?.nodes[0]).toEqual({ id: 'node-0', data: 3, next: null })
    expect(finalStep?.nodes[0]).toEqual({ id: 'node-0', data: 3, next: null })
    expect(firstUpdate?.nodes[0]).not.toBe(finalStep?.nodes[0])
    expect(Object.isFrozen(firstUpdate?.nodes[0])).toBe(true)
    expect(Object.isFrozen(firstUpdate?.nodes)).toBe(true)
    expect(Object.isFrozen(steps)).toBe(true)
  })
})
