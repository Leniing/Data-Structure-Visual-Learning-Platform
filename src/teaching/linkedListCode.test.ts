import { describe, expect, it } from 'vitest'
import { getLinkedListCode } from './linkedListCode'

describe('getLinkedListCode', () => {
  it('keeps stable line identifiers for the shared Node definition', () => {
    const headCode = getLinkedListCode('head')
    const tailCode = getLinkedListCode('tail')

    expect(headCode.slice(0, 6).map((line) => line.id)).toEqual([
      'include-vector',
      'include-cstddef',
      'node-definition-start',
      'node-definition-data',
      'node-definition-next',
      'node-definition-end',
    ])
    expect(tailCode.slice(0, 6).map((line) => line.id)).toEqual(headCode.slice(0, 6).map((line) => line.id))
  })

  it('returns the fixed head-insertion example', () => {
    const code = getLinkedListCode('head')

    expect(code.some((line) => line.id === 'head-link-node' && line.code.includes('head->next'))).toBe(true)
    expect(code.some((line) => line.id === 'tail-link-node')).toBe(false)
  })

  it('returns C code for both insertion methods', () => {
    const headCode = getLinkedListCode('head', 'c')
    const tailCode = getLinkedListCode('tail', 'c')

    expect(headCode[0]).toEqual({ id: 'include-stdlib', code: '#include <stdlib.h>' })
    expect(headCode.some((line) => line.id === 'head-link-node' && line.code.includes('head->next'))).toBe(true)
    expect(tailCode.some((line) => line.id === 'tail-update-next' && line.code.includes('tail->next'))).toBe(true)
    expect(headCode.some((line) => line.code.includes('std::vector'))).toBe(false)
    expect(tailCode.some((line) => line.code.includes('new Node'))).toBe(false)
  })

  it('keeps the C tail demonstration limited to the supplied creation statements', () => {
    const statements = getLinkedListCode('tail', 'c')
      .map((line) => line.code.replace(/\/\/.*$/, '').trim())
      .filter(Boolean)
    expect(statements).toEqual([
      'typedef struct Node {',
      'int data;',
      'struct Node* next;',
      '} Node;',
      'Node* head = NULL;',
      'Node* tail = NULL;',
      'int n;',
      'scanf("%d", &n);',
      'for (int i = 0; i < n; i++) {',
      'Node* s = (Node*)malloc(sizeof(Node));',
      'scanf("%d", &s->data);',
      's->next = NULL;',
      'if (head == NULL) {',
      'head = tail = s;',
      '}',
      'else {',
      'tail->next = s;',
      'tail = s;',
      '}',
      '}',
    ])
  })

  it('returns the fixed C++ tail-insertion example', () => {
    const code = getLinkedListCode('tail', 'cpp')

    expect(code.some((line) => line.id === 'tail-update-next' && line.code.includes('tail->next'))).toBe(true)
    expect(code.some((line) => line.id === 'head-link-node')).toBe(false)
  })
})
