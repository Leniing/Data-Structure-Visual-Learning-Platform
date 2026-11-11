import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import LearningNavigation from './LearningNavigation'
import { linkedListChapter } from './chapter'

it('opens knowledge only on click, keeps placeholders inert and maps menu actions', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.useFakeTimers()
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  const openAi = vi.fn()
  const select = vi.fn()
  try {
    act(() => root.render(<LearningNavigation chapter={linkedListChapter} onOpenAi={openAi} onSelectKnowledge={select} />))
    const button = (name: string) => host.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!
    expect([...host.querySelectorAll('nav button[aria-label]')].map(node => node.getAttribute('aria-label'))).toEqual(['学习总览', '本章知识', 'AI 解答', '练习挑战', '设置'])
    act(() => button('本章知识').focus())
    expect(host.querySelector('#chapter-knowledge')).toBeNull()
    act(() => button('本章知识').click())
    expect(host.querySelectorAll('.chapter-panel li')).toHaveLength(6)
    act(() => host.querySelector<HTMLButtonElement>('.chapter-panel li button')!.click())
    expect(select).not.toHaveBeenCalled()
    expect(host.querySelector('[role="status"]')?.textContent).toBe('知识点暂未配置')
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(host.querySelector('#chapter-knowledge')).toBeNull()
    expect(document.activeElement).toBe(button('本章知识'))
    for (const name of ['学习总览', '练习挑战', '设置']) {
      act(() => button(name).click())
      expect(host.querySelector('[role="status"]')?.textContent).toBe('功能暂未开放')
    }
    for (const name of ['学习总览', 'AI 解答', '练习挑战', '设置']) {
      act(() => {
        button(name).dispatchEvent(new Event('pointerdown', { bubbles: true }))
        button(name).focus()
        button(name).click()
        button(name).dispatchEvent(new MouseEvent('pointerout', { bubbles: true, relatedTarget: document.body }))
      })
      act(() => vi.advanceTimersByTime(180))
      expect(host.querySelector('nav')?.classList.contains('expanded')).toBe(false)
    }
    openAi.mockClear()
    act(() => {
      button('设置').blur()
      button('设置').focus()
      button('设置').dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
      button('设置').dispatchEvent(new MouseEvent('pointerout', { bubbles: true, relatedTarget: document.body }))
    })
    act(() => vi.advanceTimersByTime(180))
    expect(host.querySelector('nav')?.classList.contains('expanded')).toBe(true)
    act(() => button('设置').dispatchEvent(new Event('pointerdown', { bubbles: true })))
    expect(host.querySelectorAll('[role="status"]')).toHaveLength(1)
    act(() => vi.advanceTimersByTime(2000))
    expect(host.querySelector('[role="status"]')?.textContent).toBe('')
    act(() => button('AI 解答').click())
    expect(openAi).toHaveBeenCalledOnce()
    act(() => {
      button('本章知识').click()
      button('本章知识').focus()
    })
    act(() => host.querySelector('.chapter-panel')!.dispatchEvent(new MouseEvent('pointerout', { bubbles: true, relatedTarget: document.body })))
    act(() => vi.advanceTimersByTime(180))
    expect(host.querySelector('#chapter-knowledge')).toBeNull()
    expect(host.querySelector('nav')?.classList.contains('expanded')).toBe(false)
    act(() => button('本章知识').click())
    act(() => document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })))
    expect(host.querySelector('#chapter-knowledge')).toBeNull()
  } finally {
    act(() => root.unmount())
    host.remove()
    vi.useRealTimers()
  }
})
