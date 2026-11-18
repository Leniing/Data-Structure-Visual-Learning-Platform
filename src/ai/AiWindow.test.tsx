import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { AiWindow } from './AiWindow'
import { aiClient } from './aiClient'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
beforeEach(() => { aiClient.configured = false })
afterEach(() => { vi.restoreAllMocks(); aiClient.configured = false })

const context = { chapterId: 'list', chapterTitle: '单链表创建' }

function setup(onClose = () => {}) {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  const render = (visible: boolean) => act(() => root.render(<AiWindow visible={visible} onClose={onClose} context={context} />))
  render(true)
  return { host, render, cleanup: () => { act(() => root.unmount()); host.remove() } }
}

function type(host: HTMLElement, value: string) {
  const input = host.querySelector('textarea')!
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

it('preserves the same textarea, draft and rectangle while hidden and reopened', () => {
  const app = setup()
  try {
    type(app.host, '如何创建单链表？')
    const input = app.host.querySelector('textarea')!
    const rect = app.host.querySelector('section')!.getAttribute('style')
    app.render(false)
    expect(app.host.querySelector('section')!.hidden).toBe(true)
    app.render(true)
    expect(app.host.querySelector('textarea')).toBe(input)
    expect(input.value).toBe('如何创建单链表？')
    expect(app.host.querySelector('section')!.getAttribute('style')).toBe(rect)
  } finally { app.cleanup() }
})

it('labels the region AI 解答 and leaves titlebar buttons outside drag capture', () => {
  const close = vi.fn()
  const app = setup(close)
  try {
    const section = app.host.querySelector('section')!
    expect(document.getElementById(section.getAttribute('aria-labelledby')!)!.textContent).toBe('AI 解答')
    expect(app.host.querySelector('textarea')!.placeholder).toBe('请输入你的疑问...')
    const header = app.host.querySelector('header')!
    const capture = vi.fn()
    Object.defineProperty(header, 'setPointerCapture', { value: capture })
    expect(header.querySelectorAll('button')).toHaveLength(1)
    expect(header.querySelector('svg')).not.toBeNull()
    const closeButton = app.host.querySelector<HTMLButtonElement>('[aria-label="关闭 AI 窗口"]')!
    act(() => {
      closeButton.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }))
      closeButton.click()
    })
    expect(close).toHaveBeenCalledOnce()
    expect(capture).not.toHaveBeenCalled()
  } finally { app.cleanup() }
})

it('keeps input editable but disables sending without calling a service', () => {
  const send = vi.spyOn(aiClient, 'sendMessage')
  const app = setup()
  try {
    type(app.host, '测试问题')
    const button = app.host.querySelector('button[type="submit"]') as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(button.title).toBe('AI 服务尚未接入')
    act(() => app.host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
    expect(send).not.toHaveBeenCalled()
    expect(app.host.querySelector('textarea')!.value).toBe('测试问题')
    expect(app.host.querySelector('[role="status"]')!.textContent).toBe('')
  } finally { app.cleanup() }
})

it('clamps geometry after a viewport resize', () => {
  const app = setup()
  const originalWidth = window.innerWidth
  const originalHeight = window.innerHeight
  try {
    const section = app.host.querySelector('section')!
    act(() => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 240 })
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: 280 })
      window.dispatchEvent(new Event('resize'))
    })
    expect(section.style.width).toBe('224px')
    expect(section.style.height).toBe('264px')
    expect(section.style.left).toBe('8px')
    act(() => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: 700 })
      window.dispatchEvent(new Event('resize'))
    })
    for (let index = 0; index < 10; index += 1) {
      act(() => app.host.querySelector('[aria-label="调整 AI 窗口大小"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true })))
    }
    for (let index = 0; index < 15; index += 1) {
      act(() => app.host.querySelector('[aria-label="调整 AI 窗口大小"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', shiftKey: true, bubbles: true })))
    }
    expect(section.style.left).toBe('8px')
    expect(section.style.top).toBe('8px')
    expect(section.style.width).toBe('374px')
    expect(section.style.height).toBe('684px')
  } finally {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalHeight })
    app.cleanup()
  }
})

it('does not send Enter during IME composition', () => {
  aiClient.configured = true
  const send = vi.spyOn(aiClient, 'sendMessage')
  const app = setup()
  try {
    type(app.host, '输入中')
    act(() => app.host.querySelector('textarea')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true })))
    expect(send).not.toHaveBeenCalled()
    expect(app.host.querySelector('textarea')!.value).toBe('输入中')
  } finally { app.cleanup() }
})

it('ignores a late response after stopping and supports retry with safe text rendering', async () => {
  aiClient.configured = true
  let resolve!: (value: string) => void
  const send = vi.spyOn(aiClient, 'sendMessage').mockImplementationOnce(() => new Promise((done) => { resolve = done }))
    .mockResolvedValueOnce('<script>unsafe</script>\n```ts\nconst n = 1\n```')
  const app = setup()
  try {
    type(app.host, '问题')
    await act(async () => app.host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
    const stop = [...app.host.querySelectorAll('button')].find((button) => button.textContent === '停止生成')!
    act(() => stop.click())
    expect(send.mock.calls[0][0].signal.aborted).toBe(true)
    await act(async () => resolve('过期回复'))
    expect(app.host.textContent).not.toContain('过期回复')
    await act(async () => [...app.host.querySelectorAll('button')].find((button) => button.textContent === '重试发送')!.click())
    expect(app.host.querySelector('script')).toBeNull()
    expect(app.host.querySelector('code')!.textContent).toBe('const n = 1\n')
    app.render(false)
    app.render(true)
    expect(app.host.querySelectorAll('article')).toHaveLength(2)
  } finally { app.cleanup() }
})
