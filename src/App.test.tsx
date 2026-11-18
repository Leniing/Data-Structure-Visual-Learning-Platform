import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import App from './App'
import { aiClient } from './ai/aiClient'

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


it('closes AI on navigation and retains conversation and draft when reopened', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  aiClient.configured = true
  vi.spyOn(aiClient, 'sendMessage').mockResolvedValue('保留的回复')
  const host = document.createElement('div')
  const root = createRoot(host)
  const originalUrl = window.location.href
  const click = (label: string) => act(() => host.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!.click())
  const type = (text: string) => act(() => {
    const input = host.querySelector('textarea')!
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(input, text)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  try {
    act(() => root.render(<App />))
    click('AI 解答')
    type('保留的问题')
    await act(async () => host.querySelector<HTMLFormElement>('.ai-window form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
    type('尚未发送的草稿')
    const panel = host.querySelector<HTMLElement>('.ai-window')!
    click('学习总览')
    expect(panel.hidden).toBe(true)
    click('AI 解答')
    expect(panel.hidden).toBe(false)
    click('设置')
    expect(panel.hidden).toBe(true)
    click('AI 解答')
    for (const event of ['hashchange', 'popstate']) {
      act(() => {
        window.history.replaceState(null, '', '#bst-search')
        window.dispatchEvent(new Event(event))
      })
      expect(panel.hidden).toBe(true)
      click('AI 解答')
      expect(panel.hidden).toBe(false)
      expect(panel.querySelectorAll('article')).toHaveLength(2)
      expect(panel.textContent).toContain('保留的问题')
      expect(panel.textContent).toContain('保留的回复')
      expect(panel.querySelector('textarea')!.value).toBe('尚未发送的草稿')
    }
  } finally {
    act(() => root.unmount())
    window.history.replaceState(null, '', originalUrl)
    aiClient.configured = false
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  }
})
