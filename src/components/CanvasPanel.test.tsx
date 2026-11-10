import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import CanvasPanel from './CanvasPanel'

it('shows compact zoom controls without canvas status or caption text', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  const host = document.createElement('div')
  const root = createRoot(host)
  try {
    act(() => root.render(<CanvasPanel insertMethod="head" onInsertMethodChange={() => {}} step={null} playing={false} />))
    expect(host.querySelector('.badge')).toBeNull()
    expect(host.querySelector('.panel-note')).toBeNull()
    expect(host.querySelector('.canvas-caption')).toBeNull()
    const zoom = host.querySelector('output')!
    expect(zoom.textContent).toBe('100%')
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="放大"]')!.click())
    expect(zoom.textContent).toBe('110%')
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="缩小"]')!.click())
    expect(zoom.textContent).toBe('100%')
  } finally {
    act(() => root.unmount())
    vi.unstubAllGlobals()
  }
})
