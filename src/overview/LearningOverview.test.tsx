import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import App from '../App'

it('connects overview, filters, settings and the available lesson through hash navigation', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  window.history.replaceState(null, '', '#overview')
  const host = document.createElement('div')
  const root = createRoot(host)
  const click = (label: string) => {
    const button = [...host.querySelectorAll<HTMLButtonElement>('button')].find(item => item.getAttribute('aria-label') === label || item.textContent === label)!
    act(() => button.click())
  }
  try {
    act(() => root.render(<App />))
    expect(host.querySelectorAll('.algorithm-card')).toHaveLength(38)
    expect(host.querySelectorAll('.algorithm-card a')).toHaveLength(2)
    click('图')
    expect(host.querySelectorAll('.algorithm-card')).toHaveLength(6)
    click('设置')
    expect(window.location.hash).toBe('#settings')
    expect(host.querySelector('.overview-page')?.parentElement?.hidden).toBe(true)
    act(() => {
      window.history.replaceState(null, '', '#overview')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(host.querySelector('.overview-page')?.parentElement?.hidden).toBe(false)
    expect(host.querySelectorAll('.algorithm-card')).toHaveLength(6)
    click('全部')
    act(() => host.querySelector<HTMLAnchorElement>('.algorithm-open')!.click())
    expect(window.location.hash).toBe('#linked-list-creation')
    expect(host.querySelector<HTMLElement>('.experiment-page')?.hidden).toBe(false)
    expect(host.querySelector('.overview-page')).toBeNull()
    click('学习总览')
    expect(window.location.hash).toBe('#overview')
    expect(host.querySelectorAll('.algorithm-card')).toHaveLength(38)
  } finally {
    act(() => root.unmount())
    window.history.replaceState(null, '', window.location.pathname)
    vi.unstubAllGlobals()
  }
})
