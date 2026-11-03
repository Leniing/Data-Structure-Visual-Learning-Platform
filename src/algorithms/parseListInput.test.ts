import { describe, expect, it } from 'vitest'
import { parseListInput } from './parseListInput'

describe('parseListInput', () => {
  it('parses the default values and supported separators', () => {
    expect(parseListInput('3, 1, 4, 1, 5')).toEqual({ ok: true, values: [3, 1, 4, 1, 5] })
    expect(parseListInput('3，1 4,\n5')).toEqual({ ok: true, values: [3, 1, 4, 5] })
  })

  it('accepts empty input', () => {
    expect(parseListInput(' \t\n')).toEqual({ ok: true, values: [] })
  })

  it('preserves repeated values', () => {
    expect(parseListInput('1, 1, 2, 2')).toEqual({ ok: true, values: [1, 1, 2, 2] })
  })

  it('accepts negative integers in range', () => {
    expect(parseListInput('-999, -1, 0, 999')).toEqual({ ok: true, values: [-999, -1, 0, 999] })
  })

  it.each(['1.5', '1, nope', '1000', '-1000', '1,2,3,4,5,6,7,8,9,10,11,12,13'])('rejects invalid input: %s', (input) => {
    expect(parseListInput(input).ok).toBe(false)
  })

  it('rejects empty comma-separated tokens instead of ignoring malformed input', () => {
    expect(parseListInput('1,,2').ok).toBe(false)
  })
})
