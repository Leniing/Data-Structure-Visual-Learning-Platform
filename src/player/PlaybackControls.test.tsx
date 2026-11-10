import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import PlaybackControls from './PlaybackControls'
import type { useTailPlayer } from './useTailPlayer'
import { createByHeadSteps } from '../domain/headInsertion'

it('switches pause and resume icons on the same button and preserves playback actions', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  const host = document.createElement('div')
  const root = createRoot(host)
  const player: ReturnType<typeof useTailPlayer> = {
    current: createByHeadSteps([1])[0]!, index: 1, total: 3, playing: true, speed: 1, runId: 0,
    atEnd: false, method: 'head', start: vi.fn(), reset: vi.fn(), move: vi.fn(),
    toggle: vi.fn(), setSpeed: vi.fn(), setInsertMethod: vi.fn(),
  }
  const render = () => act(() => root.render(<PlaybackControls player={player} />))
  try {
    render()
    const toggle = host.querySelector<HTMLButtonElement>('[aria-label="暂停"]')!
    expect(toggle.querySelector('img')?.getAttribute('src')).toContain('pause.png')
    expect(host.querySelectorAll('.playback-buttons button')).toHaveLength(4)
    expect(host.querySelector('.playback-buttons')?.textContent?.trim()).toBe('')
    act(() => toggle.click())
    expect(player.toggle).toHaveBeenCalledOnce()
    player.playing = false
    render()
    expect(host.querySelector('[aria-label="继续"]')).toBe(toggle)
    expect(toggle.querySelector('img')?.getAttribute('src')).toContain('resume.png')
    act(() => {
      host.querySelector<HTMLButtonElement>('[aria-label="重置"]')!.click()
      host.querySelector<HTMLButtonElement>('[aria-label="上一步"]')!.click()
      host.querySelector<HTMLButtonElement>('[aria-label="下一步"]')!.click()
    })
    expect(player.reset).toHaveBeenCalledOnce()
    expect(player.move).toHaveBeenNthCalledWith(1, -1)
    expect(player.move).toHaveBeenNthCalledWith(2, 1)
    player.index = 2
    player.atEnd = true
    render()
    expect(toggle.getAttribute('aria-label')).toBe('重播')
    expect(host.querySelector<HTMLButtonElement>('[aria-label="下一步"]')!.disabled).toBe(true)
    player.total = 0
    render()
    expect([...host.querySelectorAll<HTMLButtonElement>('.playback-buttons button')].every((button) => button.disabled)).toBe(true)
  } finally {
    act(() => root.unmount())
  }
})
