import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import CodePanel from './CodePanel'

it('scrolls the highlighted line inside the code panel and marks false conditions', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  const host = document.createElement('div')
  const root = createRoot(host)
  const top = vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('code-line') ? 800 : 350
  })
  const height = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(200)
  const lineHeight = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(24)
  try {
    act(() => root.render(<CodePanel insertMethod="tail" language="c" onLanguageChange={() => {}} activeLineId="tail-if-first" condition={false} />))
    expect(host.querySelector('.code-placeholder')!.scrollTop).toBe(700)
    expect(host.querySelector('[aria-current="step"]')?.classList.contains('condition-false')).toBe(true)
    act(() => root.render(<CodePanel insertMethod="tail" language="c" onLanguageChange={() => {}} activeLineId={null} condition={null} />))
    expect(host.querySelector('[aria-current="step"]')).toBeNull()
  } finally {
    act(() => root.unmount())
    top.mockRestore()
    height.mockRestore()
    lineHeight.mockRestore()
  }
})
