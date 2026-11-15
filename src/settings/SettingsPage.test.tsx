import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import App from '../App'

it('opens settings, keeps the learning page mounted, and restores saved preferences on reload', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  const host = document.createElement('div')
  document.body.append(host)
  let root = createRoot(host)
  const originalUrl = window.location.href
  const storageKey = 'ds-visual-learning.preferences'
  const originalStorage = localStorage.getItem(storageKey)
  const originalState = window.history.state
  const button = (selector: string) => host.querySelector<HTMLButtonElement>(selector)!
  const radio = (name: string, value: string) =>
    host.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`)!
  const appearance = document.documentElement.dataset

  try {
    localStorage.removeItem(storageKey)
    act(() => root.render(<App />))
    const learningPage = host.querySelector<HTMLElement>('.experiment-page')!
    act(() => button('.nav-settings').click())
    expect(window.location.hash).toBe('#settings')
    expect(document.activeElement?.id).toBe('settings-title')
    expect(learningPage.hidden).toBe(true)
    expect(radio('palette', 'multicolor').checked).toBe(true)
    expect(radio('palette', 'sand').checked).toBe(false)
    expect(radio('palette', 'multicolor').labels?.[0].textContent).toBe('默认')
    expect(host.querySelector('.settings-palette-preview[data-palette="multicolor"] use')?.getAttribute('href'))
      .toBe('/pictures/previews/learning-layout.svg#learning-layout')
    expect(radio('font', 'default').labels?.[0].querySelector('.settings-option-label')?.textContent).toBe('默认')

    act(() => {
      radio('theme', 'dark').click()
      radio('palette', 'sage').click()
      radio('font', 'serif').click()
      radio('codeFont', 'courier').click()
    })
    expect(appearance).toMatchObject({ theme: 'dark', palette: 'sage', interfaceFont: 'serif', codeFont: 'courier' })

    act(() => {
      window.history.replaceState(originalState, '', originalUrl)
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(host.querySelector('.settings-page')).toBeNull()
    expect(host.querySelector('.experiment-page')).toBe(learningPage)
    expect(learningPage.hidden).toBe(false)

    act(() => root.unmount())
    window.history.replaceState(null, '', '#settings')
    root = createRoot(host)
    act(() => root.render(<App />))
    expect(radio('theme', 'dark').checked).toBe(true)
    expect(radio('palette', 'sage').checked).toBe(true)
    expect(radio('font', 'serif').checked).toBe(true)
    expect(radio('codeFont', 'courier').checked).toBe(true)

    act(() => button('.settings-page > button').click())
    expect(appearance).toMatchObject({ theme: 'light', palette: 'multicolor', interfaceFont: 'default', codeFont: 'jetbrains' })
    act(() => button('.settings-header button').click())
    expect(window.location.hash).toBe('')
    expect(host.querySelector('.settings-page')).toBeNull()
  } finally {
    act(() => root.unmount())
    host.remove()
    vi.unstubAllGlobals()
    window.history.replaceState(originalState, '', originalUrl)
    if (originalStorage === null) localStorage.removeItem(storageKey)
    else localStorage.setItem(storageKey, originalStorage)
  }
})
