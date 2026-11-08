import { describe, expect, it } from 'vitest'
import { createByTailSteps } from '../domain/tailInsertion'
import { sceneArrow, tailScene } from './tailScene'

describe('tailScene', () => {
  it('starts with a completely empty diagram', () => {
    expect(tailScene(null).items).toEqual([])
    expect(tailScene(null).links).toEqual([])
  })

  it('shows head then tail pointing to the same NULL', () => {
    const steps = createByTailSteps([])
    expect(tailScene(steps[0]!).items.map((item) => item.label)).toEqual(['head', 'NULL'])
    const scene = tailScene(steps[1]!)
    expect(scene.links).toEqual([
      { id: 'head-link', from: 'head', to: 'null-end' },
      { id: 'tail-link', from: 'tail', to: 'null-end' },
    ])
    expect(scene.items.find((item) => item.id === 'tail')!.position.y).toBeGreaterThan(scene.items.find((item) => item.id === 'null-end')!.position.y)
  })

  it('stages an empty s above the previous next arrow, then settles rightwards', () => {
    const steps = createByTailSteps([5, 7])
    const allocated = tailScene(steps.find((step) => step.inputIndex === 1 && step.codeLineId === 'tail-create-node')!)
    const pending = allocated.items.find((item) => item.id === 'node-1')!
    const previous = allocated.items.find((item) => item.id === 'node-0')!
    expect(pending.pending).toBe(true)
    expect(pending.label).toBe('')
    expect(pending.position.y).toBeLessThan(previous.position.y)
    expect(allocated.links.some((link) => link.from === 'node-1')).toBe(false)
    const attached = tailScene(steps.find((step) => step.codeLineId === 'tail-update-next' && step.phase === 'attach')!)
    expect(attached.links.find((link) => link.id === 'tail-link')?.to).toBe('node-0')
    expect(attached.links.find((link) => link.id === 'node-0-next')?.to).toBe('node-1')
    const final = tailScene(steps.at(-1)!)
    expect(final.items.find((item) => item.id === 'node-1')?.pending).toBe(false)
    expect(final.items.find((item) => item.id === 'node-1')?.position).toEqual({ x: 300, y: 130 })
    expect(final.links.find((link) => link.id === 'tail-link')?.to).toBe('node-1')
  })

  it('keeps every visible link resolvable, finite and within the fitted scene', () => {
    for (const step of createByTailSteps(Array(12).fill(1))) {
      const scene = tailScene(step)
      expect(new Set(scene.items.map((item) => item.id)).size).toBe(scene.items.length)
      for (const link of scene.links) {
        const from = scene.items.find((item) => item.id === link.from)!
        const to = scene.items.find((item) => item.id === link.to)!
        expect(from).toBeDefined()
        expect(to).toBeDefined()
        expect(sceneArrow(from, to)).not.toMatch(/NaN|Infinity/)
      }
      for (const item of scene.items) {
        expect(item.position.x + 48).toBeLessThan(scene.width)
        expect(item.position.y + 24).toBeLessThan(scene.height)
      }
    }
  })
})
