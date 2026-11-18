import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTailPlayer } from './useTailPlayer'

let player: ReturnType<typeof useTailPlayer>
let root: Root
let host: HTMLDivElement
function Harness() { player = useTailPlayer(); return null }

beforeEach(() => {
  vi.useFakeTimers()
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  host = document.createElement('div')
  root = createRoot(host)
  act(() => root.render(<Harness />))
})
afterEach(() => { act(() => root.unmount()); vi.useRealTimers() })

describe('useTailPlayer', () => {
  it('stays empty before creation and supports pause, stepping and completion', () => {
    expect(player.current).toBeNull()
    act(() => player.start([1]))
    expect(player.current?.codeLineId).toBe('head-head')
    act(() => vi.advanceTimersByTime(850))
    expect(player.current?.codeLineId).toBe('head-count-declare')
    act(() => player.toggle())
    const paused = player.index
    act(() => vi.advanceTimersByTime(5000))
    expect(player.index).toBe(paused)
    act(() => player.move(1))
    expect(player.index).toBe(paused + 1)
    act(() => player.move(-1))
    expect(player.index).toBe(paused)
    for (let index = player.index; index < player.total - 1; index++) act(() => player.move(1))
    expect(player.current?.phase).toBe('complete')
    expect(player.current?.codeLineId).toBeNull()
    act(() => player.toggle())
    expect(player.index).toBe(0)
    expect(player.playing).toBe(true)
  })

  it('clears scheduled ticks on reset, recreation and unmount', () => {
    act(() => player.start([1]))
    expect(vi.getTimerCount()).toBe(1)
    act(() => player.start([2, 3]))
    expect(vi.getTimerCount()).toBe(1)
    act(() => player.reset())
    expect(vi.getTimerCount()).toBe(0)
    act(() => vi.advanceTimersByTime(10000))
    expect(player.current).toBeNull()
    act(() => player.start([]))
    act(() => root.unmount())
    expect(vi.getTimerCount()).toBe(0)
    root = createRoot(host)
  })

  it('changes speed without duplicate timers and stops automatically', () => {
    act(() => player.start([]))
    act(() => player.setSpeed(4))
    expect(vi.getTimerCount()).toBe(1)
    act(() => vi.advanceTimersByTime(212.5))
    expect(player.index).toBe(1)
    for (let index = player.index; index < player.total - 1; index++) act(() => vi.advanceTimersByTime(213))
    expect(player.atEnd).toBe(true)
    expect(player.playing).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })
})
