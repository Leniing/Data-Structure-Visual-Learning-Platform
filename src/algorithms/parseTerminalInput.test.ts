import { describe, expect, it } from 'vitest'
import { DEFAULT_TERMINAL_INPUT, parseTerminalInput } from './parseTerminalInput'

describe('parseTerminalInput', () => {
  it.each([
    [' \n\t', '请输入节点个数和节点值'],
    ['\n1', '请输入节点个数'],
    ['-1\n', '节点个数须为 0～12 的整数'],
    ['13\n', '节点个数不能超过 12'],
    ['3\n1 a', '节点值须为整数'],
    ['3\n1000', '节点值须在 -999～999 之间'],
    ['3\n1,2', '节点值请用空格分隔'],
    ['3\n1', '节点值个数不足'],
    ['0\n1', '节点值个数过多'],
  ])('shows a concise prioritized message for %j', (input, error) => {
    expect(parseTerminalInput(input)).toEqual({ ok: false, error })
  })

  it.each([
    [DEFAULT_TERMINAL_INPUT, [3, 1, 4, 1, 5]],
    ['0\n', []],
    ['0', []],
    ['3\n  +3\t003　-2 ', [3, 3, -2]],
    ['4\n5 7 4 3', [5, 7, 4, 3]],
    ['3\n-999 0 +999', [-999, 0, 999]],
    ['3\r\n 1  1 1 ', [1, 1, 1]],
    ['12\n' + Array(12).fill('2').join(' '), Array(12).fill(2)],
  ])('parses %j', (input, values) => {
    expect(parseTerminalInput(input)).toEqual({ ok: true, values })
  })

  it.each(['', '3 1 4', '2\n1', '1\n1 2', '0\n1', '13\n', '-1\n', '1.5\n1',
    '2\n1,2', '2\n1，2', '1\n1.2', '1\na', '1\n1000',
    '1\n-1000', '1\n1e2', '1\n+', '2\n1\n2', '1\n0x1', '1\n' + '0'.repeat(161)])(
    'rejects invalid input %j without truncation', (input) => {
      expect(parseTerminalInput(input).ok).toBe(false)
    },
  )
})
