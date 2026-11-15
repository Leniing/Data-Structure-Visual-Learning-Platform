import type { InsertMethod } from '../algorithms/parseListInput'
import { C_TAIL_CODE } from './cTailCode'
import { CPP_HEAD_CODE, CPP_TAIL_CODE } from './cppCode'

export interface CodeLine {
  readonly id: string
  readonly code: string
}

export type CodeLanguage = 'c' | 'cpp'

const C_HEAD_NODE_DEFINITION: readonly CodeLine[] = [
  { id: 'node-definition-start', code: 'typedef struct Node {' },
  { id: 'node-definition-data', code: '    int data;           // 数据域' },
  { id: 'node-definition-next', code: '    struct Node* next;  // 指针域' },
  { id: 'node-definition-end', code: '} Node;' },
]

const C_HEAD_INSERTION_CODE: readonly CodeLine[] = [
  { id: 'head-head-comment', code: '// 创建空链表' },
  { id: 'head-head', code: 'Node* head = NULL;' },
  { id: 'head-head-gap', code: '' },
  { id: 'head-count-comment', code: '// 输入数据个数 n' },
  { id: 'head-count-declare', code: 'int n;' },
  { id: 'head-count', code: 'scanf("%d", &n);' },
  { id: 'head-count-gap', code: '' },
  { id: 'head-loop-start', code: 'for (int i = 0; i < n; i++) {' },
  { id: 'head-create-comment', code: '    // 创建节点' },
  { id: 'head-create-node', code: '    Node* s = (Node*)malloc(sizeof(Node));' },
  { id: 'head-create-gap', code: '' },
  { id: 'head-read-comment', code: '    // 读入数据' },
  { id: 'head-read-value', code: '    scanf("%d", &s->data);' },
  { id: 'head-read-gap', code: '' },
  { id: 'head-link-comment', code: '    // 新节点的 next 与 head 指向相同' },
  { id: 'head-null-comment', code: '    // 空链表时为 NULL' },
  { id: 'head-link-node', code: '    s->next = head;' },
  { id: 'head-insert-gap', code: '' },
  { id: 'head-insert-comment', code: '    // 将节点插入链表（头插法）' },
  { id: 'head-update-comment', code: '    // 头指针指向新节点' },
  { id: 'head-update', code: '    head = s;' },
  { id: 'head-loop-end', code: '}' },
]

const SEPARATOR: CodeLine = { id: 'code-separator', code: '' }

export function getLinkedListCode(insertMethod: InsertMethod, language: CodeLanguage = 'cpp'): readonly CodeLine[] {
  if (language === 'cpp') return insertMethod === 'head' ? CPP_HEAD_CODE : CPP_TAIL_CODE
  return insertMethod === 'head'
    ? [...C_HEAD_NODE_DEFINITION, SEPARATOR, ...C_HEAD_INSERTION_CODE]
    : C_TAIL_CODE
}
