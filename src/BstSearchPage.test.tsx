import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import App from './App'

it('restores every visual/code/result snapshot, keeps language steps, and resets method/target', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.useFakeTimers()
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  window.history.replaceState(null, '', '#bst-search')
  const host = document.createElement('div'), root = createRoot(host)
  document.body.append(host)
  const page = () => host.querySelector<HTMLElement>('.bst-page')!
  const click = (label: string) => act(() => {
    const button = [...page().querySelectorAll<HTMLButtonElement>('button')].find(node => node.getAttribute('aria-label') === label || node.textContent === label)!
    expect(button).toBeTruthy(); button.click()
  })
  const snapshot = () => ({
    svg: page().querySelector('svg[aria-label="预设二叉搜索树"]')!.innerHTML,
    code: page().querySelector('[aria-current="step"]')?.getAttribute('data-line-id'),
    result: page().querySelector('output[aria-label="返回值"]')!.textContent,
    status: page().querySelector('.playback-panel .muted')!.textContent,
  })
  try {
    act(() => root.render(<App />))
    expect(page().hidden).toBe(false)
    expect(page().querySelectorAll('.bst-null')).toHaveLength(7)
    for (const method of ['递归', '非递归']) {
      click(method)
      const initial = snapshot()
      click('开始查找'); click('暂停')
      expect(page().querySelector('input')!.readOnly).toBe(true)
      const snapshots = [snapshot()]
      for (let n = 0; n < 100 && !page().querySelector<HTMLButtonElement>('[aria-label="下一步"]')!.disabled; n++) {
        click('下一步'); snapshots.push(snapshot())
        click('C++'); expect(snapshot()).toEqual(snapshots.at(-1))
        click('C'); expect(snapshot()).toEqual(snapshots.at(-1))
      }
      expect(snapshot().result).toBe('返回值：节点11')
      for (let n = snapshots.length - 2; n >= 0; n--) { click('上一步'); expect(snapshot()).toEqual(snapshots[n]) }
      click('重置'); expect(snapshot()).toEqual(initial)
      expect(page().querySelector('input')!.readOnly).toBe(false)
    }
    click('开始查找'); click('递归')
    expect(snapshot().result).toBe('返回值：—')
    expect(page().querySelector('[aria-current="step"]')).toBeNull()
    click('开始查找')
    const before = snapshot()
    act(() => { window.history.pushState(null, '', '#overview'); window.dispatchEvent(new HashChangeEvent('hashchange')) })
    act(() => vi.advanceTimersByTime(10000))
    expect(snapshot()).toEqual(before)
    act(() => { window.history.pushState(null, '', '#bst-search'); window.dispatchEvent(new HashChangeEvent('hashchange')) })
    act(() => vi.advanceTimersByTime(850))
    expect(snapshot()).not.toEqual(before)
  } finally {
    act(() => root.unmount()); host.remove(); vi.useRealTimers(); vi.unstubAllGlobals()
    window.history.replaceState(null, '', window.location.pathname)
  }
})

it('opens the same refreshable route from overview and chapter knowledge', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  window.history.replaceState(null, '', '#overview')
  const host = document.createElement('div'), root = createRoot(host)
  document.body.append(host)
  const click = (text: string) => act(() => [...host.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === text || button.getAttribute('aria-label') === text)!.click())
  try {
    act(() => root.render(<App />))
    const links = [...host.querySelectorAll<HTMLAnchorElement>('.algorithm-card a')]
    expect(links.map(link => link.hash)).toEqual(['#linked-list-creation', '#bst-search'])
    act(() => links[1].click())
    expect(host.querySelector<HTMLElement>('.bst-page')?.hidden).toBe(false)
    click('本章知识')
    const items = [...host.querySelectorAll<HTMLButtonElement>('#chapter-knowledge ul:not([hidden]) li button')]
    expect(items[0].textContent).toBe('二叉搜索树查找')
    act(() => items[0].click())
    expect(window.location.hash).toBe('#bst-search')
    act(() => root.render(<App key="refresh" />))
    expect(host.querySelector<HTMLElement>('.bst-page')?.hidden).toBe(false)
  } finally {
    act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); window.history.replaceState(null, '', window.location.pathname)
  }
})
