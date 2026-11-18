import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import InputPanel from './InputPanel'

it('hides valid feedback and explains rejected multiline paste without changing input', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  const host = document.createElement('div')
  const root = createRoot(host)
  try {
    act(() => root.render(<InputPanel supported activeInput={null} inputIndex={null} onCreate={() => {}} onInputChange={() => {}} />))
    const input = host.querySelector('textarea')!
    const feedback = host.querySelector('#input-feedback') as HTMLElement
    expect(host.querySelector('label')).toBeNull()
    expect(input.getAttribute('aria-label')).toBe('节点输入')
    expect(feedback.hidden).toBe(false)
    expect(feedback.textContent).toBe('')
    input.setSelectionRange(0, input.value.length)
    const paste = new Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(paste, 'clipboardData', { value: { getData: () => '2\n1\n2' } })
    act(() => input.dispatchEvent(paste))
    expect(paste.defaultPrevented).toBe(true)
    expect(input.value).toBe('5\n3 1 4 1 5')
    expect(feedback.hidden).toBe(false)
    expect(feedback.textContent).toBe('仅支持两行输入')
  } finally {
    act(() => root.unmount())
  }
})

it('creates from the second line only for valid input and allows replacing the newline', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  const host = document.createElement('div')
  const root = createRoot(host)
  const onCreate = vi.fn()
  try {
    act(() => root.render(<InputPanel supported activeInput={null} inputIndex={null} onCreate={onCreate} onInputChange={() => {}} />))
    const input = host.querySelector('textarea')!
    input.setSelectionRange(input.value.length, input.value.length)
    const blocked = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    act(() => input.dispatchEvent(blocked))
    expect(blocked.defaultPrevented).toBe(true)
    expect(onCreate).toHaveBeenCalledWith([3, 1, 4, 1, 5])
    onCreate.mockClear()
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true })))
    expect(onCreate).not.toHaveBeenCalled()
    input.setSelectionRange(1, 2)
    const replacement = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    act(() => input.dispatchEvent(replacement))
    expect(replacement.defaultPrevented).toBe(false)
    expect(onCreate).not.toHaveBeenCalled()
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(input, '2\n1')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    input.setSelectionRange(input.value.length, input.value.length)
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })))
    expect(onCreate).not.toHaveBeenCalled()
  } finally {
    act(() => root.unmount())
  }
})

it('highlights only the count or indexed value token without replacing input text', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  const host = document.createElement('div')
  const root = createRoot(host)
  try {
    act(() => root.render(<InputPanel supported activeInput="count" inputIndex={null} onCreate={() => {}} onInputChange={() => {}} />))
    let activeTokens = host.querySelectorAll('.terminal-input-token.active')
    expect(activeTokens).toHaveLength(1)
    expect(activeTokens[0]?.textContent).toBe('5')

    act(() => root.render(<InputPanel supported activeInput="value" inputIndex={2} onCreate={() => {}} onInputChange={() => {}} />))
    activeTokens = host.querySelectorAll('.terminal-input-token.active')
    expect(activeTokens).toHaveLength(1)
    expect(activeTokens[0]?.textContent).toBe('4')
    expect(host.querySelector('#node-values')).toBeTruthy()
    expect((host.querySelector('#node-values') as HTMLTextAreaElement).value).toBe('5\n3 1 4 1 5')
  } finally {
    act(() => root.unmount())
  }
})
