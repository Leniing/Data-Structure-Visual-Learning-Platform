import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import BstCanvas from './BstCanvas'
import { createBstSearchSteps } from '../domain/bstSearch'

it('drags nodes and NULL independently at zoom, follows links/arrows and preserves positions across steps', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.stubGlobal('DOMPoint', class {
    x: number; y: number
    constructor(x: number, y: number) { this.x = x; this.y = y }
    matrixTransform() { return this }
  })
  const host = document.createElement('div'), root = createRoot(host)
  const steps = createBstSearchSteps(17, 'recursive')
  const movement = steps.find(step => step.arrow?.to === '18-L')!
  const render = (step = movement) => act(() => root.render(<BstCanvas method="recursive" onMethodChange={() => {}} step={step} />))
  const pointer = (target: Element, type: string, x: number, y: number) => act(() => {
    const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0 })
    Object.defineProperty(event, 'pointerId', { value: 1 })
    target.dispatchEvent(event)
  })
  try {
    render()
    const surface = host.querySelector<HTMLElement>('.canvas-surface')!
    const svg = host.querySelector('svg')!
    Object.defineProperty(svg, 'getScreenCTM', { value: () => ({ inverse: () => ({}) }) })
    surface.setPointerCapture = vi.fn()
    const node = host.querySelector('[data-bst-node="18"]')!
    const nullNode = host.querySelector('[data-bst-node="18-L"]')!
    const hitbox = nullNode.querySelector('rect')!
    expect([hitbox.getAttribute('width'), hitbox.getAttribute('height')]).toEqual(['60', '32'])
    expect(nullNode.querySelector('circle')).toBeNull()
    const beforeEdge = host.querySelector('[data-edge="18-L"]')!.outerHTML
    const beforeArrow = host.querySelector('[data-arrow]')!.outerHTML
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="放大"]')!.click())
    pointer(hitbox, 'pointerdown', 100, 100)
    pointer(surface, 'pointermove', 210, 155)
    pointer(surface, 'pointerup', 210, 155)
    expect(nullNode.getAttribute('transform')).toBe('translate(574 330)')
    expect(node.getAttribute('transform')).toBe('translate(520 180)')
    expect(host.querySelector('[data-edge="18-L"]')!.outerHTML).not.toBe(beforeEdge)
    expect(host.querySelector('[data-arrow]')!.outerHTML).not.toBe(beforeArrow)
    render(steps.at(-1)!)
    expect(nullNode.getAttribute('transform')).toBe('translate(574 330)')
    pointer(node.querySelector('circle')!, 'pointerdown', 0, 0)
    pointer(surface, 'pointermove', 110, 110)
    pointer(surface, 'pointerup', 110, 110)
    expect(node.getAttribute('transform')).toBe('translate(620 280)')
    pointer(surface, 'pointerdown', 0, 0)
    pointer(surface, 'pointermove', 40, 20)
    pointer(surface, 'pointerup', 40, 20)
    expect(node.getAttribute('transform')).toBe('translate(620 280)')
    expect(nullNode.getAttribute('transform')).toBe('translate(574 330)')
    expect(svg.innerHTML).not.toMatch(/NaN|Infinity/)
  } finally {
    act(() => root.unmount()); vi.unstubAllGlobals()
  }
})
