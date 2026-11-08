import type { ParseListInputResult } from './parseListInput'

export const DEFAULT_TERMINAL_INPUT = '5\n3 1 4 1 5'

export function parseTerminalInput(input: string): ParseListInputResult {
  if (input.length > 160) return { ok: false, error: '输入内容过长，最多允许 160 个字符。' }
  const lines = input.replace(/\r\n/g, '\n').split('\n')
  if (lines.length !== 2) return { ok: false, error: '请填写两行：第一行节点个数 n，第二行节点值（n = 0 时第二行留空）。' }
  const countText = lines[0]!.trim()
  if (!/^\d+$/.test(countText)) return { ok: false, error: '第一行 n 必须是 0 到 12 的整数。' }
  const count = Number(countText)
  if (count > 12) return { ok: false, error: '节点个数 n 必须在 0 到 12 之间。' }
  const valueLine = lines[1]!
  if (!/^[ +\-0-9]*$/.test(valueLine)) return { ok: false, error: '第二行只允许整数和普通空格；不支持逗号、小数、制表符或其他字符。' }
  const tokens = valueLine.trim() === '' ? [] : valueLine.trim().split(/ +/)
  if (tokens.length !== count) return { ok: false, error: `n 为 ${count}，但第二行有 ${tokens.length} 个值，请保持数量一致。` }
  const values: number[] = []
  for (const token of tokens) {
    if (!/^[+-]?\d+$/.test(token)) return { ok: false, error: `“${token}”不是有效整数。` }
    const value = Number(token)
    if (!Number.isInteger(value) || value < -999 || value > 999) return { ok: false, error: '每个节点值必须是 -999 到 999 的整数。' }
    values.push(value)
  }
  return { ok: true, values }
}
