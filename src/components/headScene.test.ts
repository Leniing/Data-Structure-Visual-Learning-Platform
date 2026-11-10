import { describe, expect, it } from 'vitest'
import { createByHeadSteps } from '../domain/headInsertion'
import { headScene, sceneArrow } from './tailScene'

describe('headScene', () => {
  it('uses data-cell-width arrows at rest and avoids backward pending links', () => {
    for (const step of createByHeadSteps([5, 7, 4, 3])) {
      const scene = headScene(step)
      for (const link of scene.links) {
        const from = scene.items.find((item) => item.id === link.from)!
        const to = scene.items.find((item) => item.id === link.to)!
        const coordinates = sceneArrow(from, to).split(' ').map(Number)
        const startX = coordinates[1]!
        const endX = coordinates[4]!
        if (from.position.y === to.position.y) expect(endX - startX).toBe(62)
        if (from.id === step.newNodeId) expect(endX).toBeGreaterThanOrEqual(startX)
      }
    }
  })

  it('keeps the first NULL beside head until the new node settles', () => {
    const steps = createByHeadSteps([5])
    for (const step of steps.filter((step) => step.newNodeId !== null)) {
      const scene = headScene(step)
      expect(scene.items.find((item) => item.id === 'null-end')?.position).toEqual({ x: 170, y: 130 })
      if (step.nodes[0]?.next === null) {
        expect(scene.links).toContainEqual({ id: 'node-0-next', from: 'node-0', to: 'null-end' })
      }
    }
    const settled = headScene(steps.find((step) => step.phase === 'settle')!)
    expect(settled.items.find((item) => item.id === 'null-end')?.position).toEqual({ x: 328, y: 130 })
  })

  it('preserves all existing next links and shifts the old list only on settling', () => {
    const steps = createByHeadSteps([5, 7, 4])
    for (const inputIndex of [1, 2]) {
      const phases = steps.filter((step) => step.inputIndex === inputIndex)
      const before = headScene(phases.find((step) => step.codeLineId === 'head-link-node')!)
      for (const phase of ['disconnect', 'attach', 'settle']) {
        const scene = headScene(phases.find((step) => step.phase === phase)!)
        for (const link of before.links.filter((link) => link.from.startsWith('node-'))) {
          expect(scene.links).toContainEqual(link)
        }
        for (const oldNode of before.items.filter((item) => item.kind === 'node' && !item.pending)) {
          expect(scene.items.find((item) => item.id === oldNode.id)?.position).toEqual({
            x: oldNode.position.x + (phase === 'settle' ? 158 : 0), y: 130,
          })
        }
        const newNode = scene.items.find((item) => item.id === `node-${inputIndex}`)!
        expect(newNode.pending).toBe(phase === 'disconnect')
        expect(newNode.position.y).toBe(phase === 'settle' ? 130 : 55)
      }
    }
  })
})
