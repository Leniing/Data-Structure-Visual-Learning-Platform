import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import InputPanel from './InputPanel'

it('blocks a third line but allows replacing the existing newline', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  const host = document.createElement('div')
  const root = createRoot(host)
  try {
    act(() => root.render(<InputPanel supported activeInput={null} inputIndex={null} onCreate={() => {}} onInputChange={() => {}} />))
    const input = host.querySelector('textarea')!
    input.setSelectionRange(input.value.length, input.value.length)
    const blocked = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    act(() => input.dispatchEvent(blocked))
    expect(blocked.defaultPrevented).toBe(true)
    input.setSelectionRange(1, 2)
    const replacement = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    act(() => input.dispatchEvent(replacement))
    expect(replacement.defaultPrevented).toBe(false)
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
