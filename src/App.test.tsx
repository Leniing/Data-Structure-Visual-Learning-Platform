import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import App from './App'

it('shares every animation and input/code highlight between C and C++ for both methods', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.useFakeTimers()
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  const host = document.createElement('div')
  const root = createRoot(host)
  const click = (label: string) => {
    const button = Array.from(host.querySelectorAll<HTMLButtonElement>('button'))
      .find((item) => item.getAttribute('aria-label') === label || item.textContent === label)!
    act(() => button.click())
  }
  try {
    act(() => root.render(<App />))
    for (const method of ['尾插法', '头插法']) {
      click(method)
      const runs: unknown[][] = []
      for (const language of ['C', 'C++']) {
        click(language)
        click('创建链表')
        click('暂停')
        const snapshots: unknown[] = []
        for (let count = 0; count < 150; count++) {
          const active = host.querySelector('[aria-current="step"]')
          const scene = Array.from(host.querySelectorAll('[data-scene-id]')).map((item) => ({
            id: item.getAttribute('data-scene-id'),
            position: item.getAttribute('transform'),
            text: item.textContent,
          }))
          const links = Array.from(host.querySelectorAll('[data-link-id]')).map((item) => item.outerHTML)
          snapshots.push({ id: active?.getAttribute('data-line-id'), red: active?.classList.contains('condition-false'), scene, links,
            description: host.querySelector('#diagram-description')?.textContent,
            input: host.querySelector('.terminal-input-highlight')?.innerHTML })
          const code = active?.querySelector('code')?.textContent ?? ''
          if (active) expect(code.trim()).not.toBe('')
          const nullItem = host.querySelector('g[data-scene-id][data-kind="null"]')
          if (nullItem) expect(nullItem.textContent).toBe('NULL')
          const next = host.querySelector<HTMLButtonElement>('[aria-label="下一步"]')!
          if (next.disabled) break
          act(() => next.click())
        }
        expect(snapshots.length).toBeGreaterThan(10)
        expect(host.querySelector('[aria-current="step"]')).toBeNull()
        runs.push(snapshots)
      }
      expect(runs[1]).toEqual(runs[0])
    }
  } finally {
    act(() => root.unmount())
    vi.useRealTimers()
    vi.unstubAllGlobals()
  }
})
