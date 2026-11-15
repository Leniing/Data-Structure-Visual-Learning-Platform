import { describe, expect, it } from 'vitest'
import { getLinkedListCode } from './linkedListCode'
import { createByHeadSteps } from '../domain/headInsertion'
import { createByTailSteps } from '../domain/tailInsertion'

describe('getLinkedListCode', () => {
  it('keeps stable line identifiers for the shared Node definition', () => {
    const headCode = getLinkedListCode('head')
    const tailCode = getLinkedListCode('tail')

    expect(headCode.slice(0, 4).map((line) => line.id)).toEqual([
      'node-definition-start',
      'node-definition-data',
      'node-definition-next',
      'node-definition-end',
    ])
    expect(tailCode.slice(0, 4).map((line) => line.id)).toEqual(headCode.slice(0, 4).map((line) => line.id))
  })

  it('returns the fixed head-insertion example', () => {
    const code = getLinkedListCode('head')

    expect(code.some((line) => line.id === 'head-link-node' && line.code.includes('s->next = head'))).toBe(true)
    expect(code.some((line) => line.id === 'tail-link-node')).toBe(false)
  })

  it('returns C code for both insertion methods', () => {
    const headCode = getLinkedListCode('head', 'c')
    const tailCode = getLinkedListCode('tail', 'c')

    expect(headCode[0]).toEqual({ id: 'node-definition-start', code: 'typedef struct Node {' })
    expect(headCode.some((line) => line.id === 'head-link-node' && line.code.includes('s->next = head'))).toBe(true)
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

  it.each(['head', 'tail'] as const)('matches supplied C++ %s statements and maps every animation step', (method) => {
    const code = getLinkedListCode(method, 'cpp')
    const statements = code.map((line) => line.code.replace(/\/\/.*$/, '').trim()).filter(Boolean)
    const cStatements = getLinkedListCode(method, 'c')
      .map((line) => line.code.replace(/\/\/.*$/, '').trim()).filter(Boolean)
      .map((line) => line.replace('typedef struct Node {', 'struct Node {')
        .replace('struct Node* next;', 'Node* next;').replace('} Node;', '};')
        .replace('int n;', 'int n = 0;')
        .replace('scanf("%d", &n);', 'std::cin >> n;')
        .replace('scanf("%d", &s->data);', 'std::cin >> s->data;')
        .replace('(Node*)malloc(sizeof(Node))', 'new Node'))
    expect(statements).toEqual(cStatements)
    const ids = code.map((line) => line.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const values of [[], [5], [5, 7, 4, 3]]) {
      const steps = method === 'head' ? createByHeadSteps(values) : createByTailSteps(values)
      for (const step of steps) {
        if (step.codeLineId) expect(ids).toContain(step.codeLineId)
      }
    }
  })

  it('returns the fixed C++ tail-insertion example', () => {
    const code = getLinkedListCode('tail', 'cpp')

    expect(code.some((line) => line.id === 'tail-update-next' && line.code.includes('tail->next'))).toBe(true)
    expect(code.some((line) => line.id === 'head-link-node')).toBe(false)
  })
})
