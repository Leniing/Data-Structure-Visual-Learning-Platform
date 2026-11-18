import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import App from './App'
import BstSearchPage from './BstSearchPage'

it('rejects oversized edits and paste, and allows editing and restarting during playback or pause', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.useFakeTimers()
  const host = document.createElement('div'), root = createRoot(host)
  document.body.append(host)
  try {
    act(() => root.render(<BstSearchPage active language="c" onLanguageChange={() => {}} />))
    const input = host.querySelector('input')!
    const button = host.querySelector<HTMLButtonElement>('.primary-button')!
    const status = () => host.querySelector('.playback-panel .muted')!.textContent
    const type = (value: string) => act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    type('1'.repeat(65))
    expect(input.value).toBe('11')
    expect(host.querySelector('#bst-input-feedback')!.textContent).toBe('输入不能超过 64 个字符')
    input.setSelectionRange(0, input.value.length)
    const paste = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(paste, 'clipboardData', { value: { getData: () => '2'.repeat(65) } })
    act(() => input.dispatchEvent(paste))
    expect(paste.defaultPrevented).toBe(true)
    expect(input.value).toBe('11')
    act(() => button.click())
    expect(status()).toMatch(/^1 \/ .*播放中$/)
    expect(button.disabled).toBe(false)
    expect(input.readOnly).toBe(false)
    act(() => vi.advanceTimersByTime(850))
    act(() => button.click())
    expect(status()).toMatch(/^1 \/ .*播放中$/)
    type('14')
    expect(status()).toBe('等待查找')
    act(() => vi.advanceTimersByTime(1700))
    expect(status()).toBe('等待查找')
    act(() => button.click())
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="暂停"]')!.click())
    type('18')
    expect(input.value).toBe('18')
    expect(status()).toBe('等待查找')
    act(() => button.click())
    expect(status()).toMatch(/^1 \/ .*播放中$/)
  } finally {
    act(() => root.unmount()); host.remove(); vi.useRealTimers()
  }
})

it('defers incomplete input feedback and prevents submission during composition', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  const host = document.createElement('div'), root = createRoot(host)
  document.body.append(host)
  try {
    act(() => root.render(<BstSearchPage active language="c" onLanguageChange={() => {}} />))
    const input = host.querySelector('input')!
    const button = host.querySelector<HTMLButtonElement>('.primary-button')!
    const feedback = () => host.querySelector('#bst-input-feedback')!
    const type = (value: string) => act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    act(() => input.focus())
    type('   ')
    expect(feedback().textContent).toBe('请输入查找值')
    expect(input.getAttribute('aria-invalid')).toBe('false')
    expect(feedback().querySelector('.field-error')).toBeNull()
    expect(button.disabled).toBe(true)
    act(() => input.blur())
    expect(feedback().textContent).toBe('')
    for (const sign of ['+', '-']) {
      act(() => input.focus())
      type(` ${sign} `)
      expect(feedback().textContent).toBe('')
      expect(input.getAttribute('aria-invalid')).toBe('false')
      expect(button.disabled).toBe(true)
      act(() => input.blur())
      expect(feedback().textContent).toBe('查找值必须是整数')
      expect(input.getAttribute('aria-invalid')).toBe('true')
    }
    act(() => input.focus())
    for (const invalid of ['++', '--', '1-', 'abc', '1.2', '1 2', '2147483648']) {
      type(invalid)
      expect(input.getAttribute('aria-invalid')).toBe('true')
      expect(feedback().querySelector('.field-error')).not.toBeNull()
      expect(button.disabled).toBe(true)
    }
    type('11')
    expect(button.disabled).toBe(false)
    act(() => input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })))
    expect(button.disabled).toBe(true)
    act(() => host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
    expect(host.querySelector('.playback-panel .muted')!.textContent).toBe('等待查找')
    type('中')
    expect(feedback().textContent).toBe('')
    expect(input.getAttribute('aria-invalid')).toBe('false')
    act(() => input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })))
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(feedback().textContent).toBe('查找值必须是整数')
    type('-11')
    expect(feedback().textContent).toBe('')
    expect(button.disabled).toBe(false)
  } finally {
    act(() => root.unmount()); host.remove()
  }
})

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
    result: page().querySelector('output[aria-label="返回值"]')?.textContent ?? null,
    status: page().querySelector('.playback-panel .muted')!.textContent,
  })
  try {
    act(() => root.render(<App />))
    expect(page().hidden).toBe(false)
    expect(snapshot().result).toBeNull()
    expect(page().querySelectorAll('.bst-null')).toHaveLength(7)
    // A tree can be rearranged before a search; reset must already be available.
    const originalCanvas = snapshot().svg
    const surface = page().querySelector<HTMLElement>('.canvas-surface')!
    const svg = surface.querySelector('svg')!
    Object.defineProperty(svg, 'getScreenCTM', { value: () => ({ inverse: () => ({}) }) })
    surface.setPointerCapture = vi.fn()
    vi.stubGlobal('DOMPoint', class {
      x: number; y: number
      constructor(x: number, y: number) { this.x = x; this.y = y }
      matrixTransform() { return this }
    })
    for (const id of ['14', '18-L']) {
      const node = surface.querySelector(`[data-bst-node="${id}"]`)!
      for (const [type, target, x] of [['pointerdown', node, 0], ['pointermove', surface, 60], ['pointerup', surface, 60]] as const) {
        act(() => {
          const event = new MouseEvent(type, { bubbles: true, button: 0, clientX: x })
          Object.defineProperty(event, 'pointerId', { value: 1 }); target.dispatchEvent(event)
        })
      }
    }
    expect(snapshot().svg).not.toBe(originalCanvas)
    expect(page().querySelector<HTMLButtonElement>('[aria-label="重置"]')!.disabled).toBe(false)
    click('重置')
    expect(snapshot().svg).toBe(originalCanvas)
    expect(snapshot().status).toBe('等待查找')
    for (const method of ['递归', '非递归']) {
      click(method)
      const initial = snapshot()
      click('开始查找')
      expect(snapshot().result).toBe('返回值：—')
      expect(snapshot().status).toMatch(/^1 \/ \d+ 步 · 播放中$/)
      click('暂停')
      expect(snapshot().status).toMatch(/^1 \/ \d+ 步 · 已暂停$/)
      expect(page().querySelector('input')!.readOnly).toBe(false)
      const snapshots = [snapshot()]
      for (let n = 0; n < 100 && !page().querySelector<HTMLButtonElement>('[aria-label="下一步"]')!.disabled; n++) {
        click('下一步'); snapshots.push(snapshot())
        click('C++'); expect(snapshot()).toEqual(snapshots.at(-1))
        click('C'); expect(snapshot()).toEqual(snapshots.at(-1))
      }
      expect(snapshot().result).toBe('返回值：节点11')
      expect(snapshot().status).toMatch(/步 · 查找完成$/)
      expect(page().querySelector('[aria-current="step"]')).toBeNull()
      for (let n = snapshots.length - 2; n >= 0; n--) { click('上一步'); expect(snapshot()).toEqual(snapshots[n]) }
      click('重置'); expect(snapshot()).toEqual(initial)
      expect(page().querySelector('input')!.readOnly).toBe(false)
    }
    click('开始查找'); click('递归')
    expect(snapshot().result).toBeNull()
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
