import { describe, expect, it } from 'vitest'
import { getLinkedListCode } from './linkedListCode'

describe('getLinkedListCode', () => {
  it('keeps stable line identifiers for the shared Node definition', () => {
    const headCode = getLinkedListCode('head')
    const tailCode = getLinkedListCode('tail')

    expect(headCode.slice(0, 5).map((line) => line.id)).toEqual([
      'include-vector',
      'node-definition-start',
      'node-definition-data',
      'node-definition-next',
      'node-definition-end',
    ])
    expect(tailCode.slice(0, 5).map((line) => line.id)).toEqual(headCode.slice(0, 5).map((line) => line.id))
  })

  it('returns the fixed head-insertion example', () => {
    const code = getLinkedListCode('head')

    expect(code.some((line) => line.id === 'head-link-node' && line.code.includes('head->next'))).toBe(true)
    expect(code.some((line) => line.id === 'tail-link-node')).toBe(false)
  })

  it('returns the fixed tail-insertion example', () => {
    const code = getLinkedListCode('tail')

    expect(code.some((line) => line.id === 'tail-update-next' && line.code.includes('tail->next'))).toBe(true)
    expect(code.some((line) => line.id === 'head-link-node')).toBe(false)
  })
})
