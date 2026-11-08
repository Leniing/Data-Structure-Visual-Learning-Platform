import { describe, expect, it } from 'vitest'
import { DEFAULT_TERMINAL_INPUT, parseTerminalInput } from './parseTerminalInput'

describe('parseTerminalInput', () => {
  it.each([
    [DEFAULT_TERMINAL_INPUT, [3, 1, 4, 1, 5]],
    ['0\n', []],
    ['4\n5 7 4 3', [5, 7, 4, 3]],
    ['3\n-999 0 +999', [-999, 0, 999]],
    ['3\r\n 1  1 1 ', [1, 1, 1]],
    ['12\n' + Array(12).fill('2').join(' '), Array(12).fill(2)],
  ])('parses %j', (input, values) => {
    expect(parseTerminalInput(input)).toEqual({ ok: true, values })
  })

  it.each(['', '0', '3 1 4', '2\n1', '1\n1 2', '0\n1', '13\n', '-1\n', '1.5\n1',
    '2\n1,2', '2\n1，2', '2\n1\t2', '2\n1　2', '1\n1.2', '1\na', '1\n1000',
    '1\n-1000', '1\n1e2', '1\n+', '2\n1\n2', '1\n0x1', '1\n' + '0'.repeat(161)])(
    'rejects invalid input %j without truncation', (input) => {
      expect(parseTerminalInput(input).ok).toBe(false)
    },
  )
})
