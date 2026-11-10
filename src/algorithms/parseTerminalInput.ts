import type { ParseListInputResult } from './parseListInput'

export const DEFAULT_TERMINAL_INPUT = '5\n3 1 4 1 5'

export function parseTerminalInput(input: string): ParseListInputResult {
  if (input.length > 160) return { ok: false, error: '输入不能超过 160 个字符' }
  if (!input.trim()) return { ok: false, error: '请输入节点个数和节点值' }
  const lines = input.replace(/\r\n?/g, '\n').split('\n')
  if (lines.length > 2) return { ok: false, error: '仅支持两行输入' }
  const countText = lines[0]!.trim()
  if (!countText) return { ok: false, error: '请输入节点个数' }
  if (!/^\+?\d+$/.test(countText)) return { ok: false, error: '节点个数须为 0～12 的整数' }
  const count = Number(countText)
  if (count > 12) return { ok: false, error: '节点个数不能超过 12' }
  const valueLine = (lines[1] ?? '').trim()
  if (/[,，、;；]/.test(valueLine)) return { ok: false, error: '节点值请用空格分隔' }
  const tokens = valueLine ? valueLine.split(/\s+/) : []
  if (tokens.some((token) => !/^[+-]?\d+$/.test(token))) return { ok: false, error: '节点值须为整数' }
  const values = tokens.map(Number)
  if (values.some((value) => !Number.isInteger(value) || value < -999 || value > 999)) {
    return { ok: false, error: '节点值须在 -999～999 之间' }
  }
  if (values.length < count) return { ok: false, error: '节点值个数不足' }
  if (values.length > count) return { ok: false, error: '节点值个数过多' }
  return { ok: true, values }
}
