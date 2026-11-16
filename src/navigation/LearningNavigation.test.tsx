import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'
import LearningNavigation from './LearningNavigation'
import { linkedListChapter } from './chapter'

it('opens knowledge only on click, navigates available knowledge and keeps unavailable entries inert and maps menu actions', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  vi.useFakeTimers()
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  const openAi = vi.fn()
  const select = vi.fn()
  const openSettings = vi.fn()
  try {
    act(() => root.render(<LearningNavigation chapter={linkedListChapter} onOpenAi={openAi} onSelectKnowledge={select} onSettings={openSettings} />))
    const button = (name: string) => host.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!
    expect([...host.querySelectorAll('nav button[aria-label]')].map(node => node.getAttribute('aria-label'))).toEqual(['学习总览', '本章知识', 'AI 解答', '练习挑战', '设置'])
    act(() => button('本章知识').focus())
    expect(host.querySelector('#chapter-knowledge')).toBeNull()
    act(() => button('本章知识').click())
    expect(host.querySelector('.chapter-panel h2')?.textContent).toBe('本章知识')
    expect(host.querySelectorAll('.chapter-panel ul:not([hidden]) li')).toHaveLength(4)
    act(() => host.querySelector<HTMLButtonElement>('.chapter-panel ul:not([hidden]) li button')!.click())
    expect(select).toHaveBeenCalledWith(expect.objectContaining({ title: '单链表创建', route: '#linked-list-creation' }))
    expect(host.querySelector('#chapter-knowledge')).toBeNull()
    act(() => button('本章知识').click())
    select.mockClear()
    act(() => host.querySelectorAll<HTMLButtonElement>('.chapter-panel ul:not([hidden]) li button')[1].click())
    expect(select).not.toHaveBeenCalled()
    expect(host.querySelector('[role="status"]')?.textContent).toBe('该知识点暂未开放')
    const toggles = [...host.querySelectorAll<HTMLButtonElement>('.chapter-toggle')]
    expect(toggles.map(toggle => toggle.textContent)).toEqual(['链表', '栈', '队列', '树', '查找', '图', '排序'])
    expect(toggles.map(toggle => toggle.getAttribute('aria-expanded'))).toEqual(['true', 'false', 'false', 'false', 'false', 'false', 'false'])
    expect(host.querySelector('select')).toBeNull()
    for (const [name, count, groups] of [
      ['栈', 3, []], ['队列', 5, []],
      ['树', 11, ['二叉树', '二叉搜索树', '堆（最大堆 / 最小堆）']],
      ['查找', 3, []], ['图', 6, ['图遍历', '最小生成树', '最短路径']], ['排序', 6, []],
    ] as const) {
      const toggle = toggles.find(node => node.textContent === name)!
      const category = toggle.closest('section')!
      act(() => toggle.click())
      expect(toggle.getAttribute('aria-expanded')).toBe('true')
      expect(category.querySelector('ul')!.hidden).toBe(false)
      expect(category.querySelectorAll('li')).toHaveLength(count)
      expect([...category.querySelectorAll('.chapter-group')].map(node => node.textContent)).toEqual(groups)
      expect(toggles[0].getAttribute('aria-expanded')).toBe('true')
      act(() => toggle.click())
      expect(category.querySelector('ul')!.hidden).toBe(true)
    }
    act(() => toggles[0].click())
    expect(host.querySelectorAll('.chapter-panel ul:not([hidden])')).toHaveLength(0)
    act(() => button('本章知识').click())
    act(() => button('本章知识').click())
    expect(host.querySelector('.chapter-toggle')!.getAttribute('aria-expanded')).toBe('true')
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(host.querySelector('#chapter-knowledge')).toBeNull()
    expect(document.activeElement).toBe(button('本章知识'))
    for (const name of ['学习总览', '练习挑战']) {
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
    expect(openSettings).toHaveBeenCalledOnce()
    const settings = button('设置')
    act(() => settings.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 })))
    expect(settings.hasAttribute('data-hover-suppressed')).toBe(true)
    act(() => settings.dispatchEvent(new MouseEvent('pointerout', { bubbles: true, relatedTarget: document.body })))
    expect(settings.hasAttribute('data-hover-suppressed')).toBe(false)
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
    expect(host.querySelector('[role="status"]')?.classList.contains('visible')).toBe(false)
    expect(host.querySelector('[role="status"]')?.textContent).toContain('功能暂未开放')
    act(() => {
      const event = new Event('transitionend', { bubbles: true })
      Object.defineProperty(event, 'propertyName', { value: 'opacity' })
      host.querySelector('[role="status"]')!.dispatchEvent(event)
    })
    expect(host.querySelector('[role="status"]')?.textContent?.trim()).toBe('')
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


it('opens all categories collapsed in overview and restores the current category in learning', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  const host = document.createElement('div')
  const root = createRoot(host)
  const render = (overviewOpen: boolean) => act(() => root.render(
    <LearningNavigation chapter={linkedListChapter} overviewOpen={overviewOpen}
      onOpenAi={() => {}} onSelectKnowledge={() => {}} onSettings={() => {}} />,
  ))
  const togglePanel = () => act(() => host.querySelector<HTMLButtonElement>('button[aria-label="本章知识"]')!.click())
  try {
    render(true)
    togglePanel()
    expect(host.querySelectorAll('.chapter-toggle[aria-expanded="true"]')).toHaveLength(0)
    act(() => host.querySelector<HTMLButtonElement>('.chapter-toggle')!.click())
    expect(host.querySelectorAll('.chapter-toggle[aria-expanded="true"]')).toHaveLength(1)
    togglePanel()
    togglePanel()
    expect(host.querySelectorAll('.chapter-toggle[aria-expanded="true"]')).toHaveLength(0)
    togglePanel()
    render(false)
    togglePanel()
    expect([...host.querySelectorAll('.chapter-toggle[aria-expanded="true"]')].map(node => node.textContent)).toEqual(['链表'])
    togglePanel()
    render(true)
    togglePanel()
    expect(host.querySelectorAll('.chapter-toggle[aria-expanded="true"]')).toHaveLength(0)
  } finally {
    act(() => root.unmount())
  }
})
