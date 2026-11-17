import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { usePreviewPlayer } from './usePreviewPlayer'
import { listPreviewSteps, previewTree, treePreviewSteps } from './previewSteps'
import LearningOverview from './LearningOverview'
import PreviewDiagram from './PreviewDiagram'

let root: Root
let host: HTMLDivElement
let player: ReturnType<typeof usePreviewPlayer>
const media = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
function Harness({ active = true }: { active?: boolean }) { player = usePreviewPlayer(4, active); return null }
beforeEach(() => {
  vi.useFakeTimers()
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  media.matches = false
  vi.stubGlobal('matchMedia', () => media)
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => setTimeout(() => fn(performance.now()), 16))
  vi.stubGlobal('cancelAnimationFrame', clearTimeout)
  host = document.createElement('div')
  root = createRoot(host)
})
afterEach(() => { act(() => root.unmount()); vi.useRealTimers(); vi.unstubAllGlobals() })
it('uses actual snapshots with connection before settling and the full-tree search path', () => {
  expect(listPreviewSteps.map(step => step.nodes.length)).toEqual([3, 4, 4, 4])
  expect(listPreviewSteps[1].nodes[2].next).toBeNull()
  expect(listPreviewSteps[2].nodes[2].next).toBe('node-3')
  expect(listPreviewSteps[2].newNodeId).toBe('node-3')
  expect(listPreviewSteps[3].newNodeId).toBeNull()
  expect(previewTree).toHaveLength(7)
  expect(treePreviewSteps.slice(1, 4).map(step => step?.current)).toEqual(['14', '7', '11'])
  expect(treePreviewSteps.at(-1)?.found).toBe('11')
})
it('delays 80ms, advances every 480ms, holds once, resets and cancels rapid re-entry', () => {
  act(() => root.render(<Harness />))
  act(() => player.events.onMouseEnter())
  act(() => vi.advanceTimersByTime(79))
  expect(player.index).toBe(0)
  act(() => player.events.onMouseLeave())
  expect(vi.getTimerCount()).toBe(0)
  act(() => player.events.onMouseEnter())
  act(() => vi.advanceTimersByTime(80))
  expect(player.index).toBe(1)
  act(() => vi.advanceTimersByTime(480))
  expect(player.index).toBe(2)
  act(() => vi.advanceTimersByTime(4800))
  expect(player.index).toBe(3)
  expect(vi.getTimerCount()).toBe(0)
  act(() => player.events.onMouseLeave())
  expect(player.index).toBe(0)
  act(() => player.events.onMouseEnter())
  expect(player.index).toBe(0)
})
it('plays from keyboard focus and cleans up on hiding and unmount', () => {
  act(() => root.render(<Harness />))
  act(() => player.events.onFocus())
  act(() => vi.advanceTimersByTime(80))
  expect(player.index).toBe(1)
  act(() => root.render(<Harness active={false} />))
  expect(player.index).toBe(0)
  expect(vi.getTimerCount()).toBe(0)
  act(() => root.render(<Harness />))
  act(() => root.render(null))
  expect(vi.getTimerCount()).toBe(0)
})
it('never schedules autoplay for reduced motion', () => {
  media.matches = true
  act(() => root.render(<Harness />))
  act(() => { player.events.onMouseEnter(); player.events.onFocus() })
  act(() => vi.advanceTimersByTime(5000))
  expect(player.index).toBe(0)
  expect(vi.getTimerCount()).toBe(0)
})
it('resets and cancels when filtering even if a card remains in the results', () => {
  act(() => root.render(<LearningOverview onNavigate={() => {}} />))
  const card = host.querySelector('.algorithm-card')!
  act(() => card.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })))
  act(() => vi.advanceTimersByTime(80))
  expect(card.querySelectorAll('[data-preview-node]')).toHaveLength(4)
  const filter = [...host.querySelectorAll('button')].find(button => button.textContent === '链表')!
  act(() => filter.click())
  expect(host.querySelectorAll('[data-preview-node]')).toHaveLength(3)
  expect(vi.getTimerCount()).toBe(0)
})

it('keeps all list nodes centered and within the viewBox throughout insertion', () => {
  const translation = (element: Element) => element.getAttribute('transform')!.match(/-?\d+(?:\.\d+)?/g)!.map(Number)
  const checkBounds = () => {
    const group = host.querySelector('svg > g')!
    const [dx, dy] = translation(group)
    const nodes = [...host.querySelectorAll('[data-preview-node]')].map(translation)
    const left = Math.min(...nodes.map(([x]) => x + dx - 30))
    const right = Math.max(...nodes.map(([x]) => x + dx + 30))
    const top = Math.min(...nodes.map(([, y]) => y + dy - 24))
    const bottom = Math.max(...nodes.map(([, y]) => y + dy + 24))
    expect((left + right) / 2).toBeCloseTo(180)
    expect((top + bottom) / 2).toBeCloseTo(105)
    expect(left).toBeGreaterThanOrEqual(14)
    expect(right).toBeLessThanOrEqual(346)
    expect(top).toBeGreaterThan(0)
    expect(bottom).toBeLessThan(210)
  }
  for (let index = 0; index < 4; index++) {
    act(() => root.render(<PreviewDiagram tree={false} index={index} />))
    checkBounds()
    for (let frame = 0; frame < 30; frame++) {
      act(() => vi.advanceTimersByTime(16))
      checkBounds()
    }
  }
})
