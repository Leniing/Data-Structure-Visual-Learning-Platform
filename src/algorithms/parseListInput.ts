export type InsertMethod = 'head' | 'tail'

export type ParseListInputResult =
  | { ok: true; values: number[] }
  | { ok: false; error: string }

const MAX_VALUES = 12
const MIN_VALUE = -999
const MAX_VALUE = 999

export function parseListInput(input: string): ParseListInputResult {
  const trimmed = input.trim()
  if (trimmed === '') {
    return { ok: true, values: [] }
  }

  if (/^(?:[,，]|.*[,，]\s*$)|(?:^\s*[,，])|(?:[,，]\s*[,，])/.test(trimmed)) {
    return { ok: false, error: '逗号之间必须填写整数。' }
  }

  const tokens = trimmed.split(/[,，\s]+/)
  if (tokens.length > MAX_VALUES) {
    return { ok: false, error: `最多输入 ${MAX_VALUES} 个整数。` }
  }

  const values: number[] = []
  for (const token of tokens) {
    if (!/^[+-]?\d+$/.test(token)) {
      return { ok: false, error: `“${token}”不是有效整数。` }
    }

    const value = Number(token)
    if (value < MIN_VALUE || value > MAX_VALUE) {
      return { ok: false, error: `每个整数必须在 ${MIN_VALUE} 到 ${MAX_VALUE} 之间。` }
    }

    values.push(value)
  }

  return { ok: true, values }
}
