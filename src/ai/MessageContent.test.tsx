import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import MessageContent from './MessageContent'

function render(text: string) {
  const host = document.createElement('div')
  host.innerHTML = renderToStaticMarkup(<MessageContent text={text} />)
  return host
}

it('renders formatted replies including emphasis, lists, tables and literal code', () => {
  const host = render('# 标题\n\n**加粗**和*斜体*与 `head`\n\n- 节点\n- 指针\n\n> 引用\n\n| 名称 | 值 |\n| --- | --- |\n| head | 1 |\n\n```c\n// **不是加粗**\nhead = NULL;\n```')
  expect(host.querySelector('h1')?.textContent).toBe('标题')
  expect(host.querySelector('strong')?.textContent).toBe('加粗')
  expect(host.querySelector('em')?.textContent).toBe('斜体')
  expect(host.querySelectorAll('li')).toHaveLength(2)
  expect(host.querySelector('blockquote')?.textContent).toContain('引用')
  expect(host.querySelectorAll('td')).toHaveLength(2)
  expect(host.querySelector('pre code')?.textContent).toContain('**不是加粗**')
  expect(host.querySelector('pre strong')).toBeNull()
})

it('does not execute HTML or unsafe links and respects escaped markdown', () => {
  const host = render('<script>alert(1)</script>\n\n[危险](javascript:alert%281%29)\n\n![图片](https://example.com/tracker.png)\n\n[文档](https://example.com)\n\n\\*\\*原样符号\\*\\*')
  expect(host.querySelector('script')).toBeNull()
  expect(host.querySelector('img')).toBeNull()
  expect(host.querySelector('a[href^="javascript:"]')).toBeNull()
  expect(host.querySelector('a[href="https://example.com"]')?.getAttribute('rel')).toBe('noopener noreferrer')
  expect(host.textContent).toContain('**原样符号**')
  expect(host.querySelector('strong')).toBeNull()
})
