import type { InsertMethod } from '../algorithms/parseListInput'
import { C_TAIL_CODE } from './cTailCode'

export interface CodeLine {
  readonly id: string
  readonly code: string
}

export type CodeLanguage = 'c' | 'cpp'

const CPP_NODE_DEFINITION: readonly CodeLine[] = [
  { id: 'include-vector', code: '#include <vector>' },
  { id: 'include-cstddef', code: '#include <cstddef>' },
  { id: 'node-definition-start', code: 'struct Node {' },
  { id: 'node-definition-data', code: '    int data;' },
  { id: 'node-definition-next', code: '    Node* next;' },
  { id: 'node-definition-end', code: '};' },
]

const HEAD_INSERTION_CODE: readonly CodeLine[] = [
  { id: 'head-function-start', code: 'Node* createByHead(const std::vector<int>& values) {' },
  { id: 'head-sentinel', code: '    Node* head = new Node{0, nullptr};' },
  { id: 'head-loop-start', code: '    for (std::size_t index = 0; index < values.size(); ++index) {' },
  { id: 'head-read-value', code: '        const int value = values[index];' },
  { id: 'head-create-node', code: '        Node* node = new Node{value, nullptr};' },
  { id: 'head-link-node', code: '        node->next = head->next;' },
  { id: 'head-update-next', code: '        head->next = node;' },
  { id: 'head-loop-end', code: '    }' },
  { id: 'head-return', code: '    return head;' },

  { id: 'head-function-end', code: '}' },
]

const C_NODE_DEFINITION: readonly CodeLine[] = [
  { id: 'include-stdlib', code: '#include <stdlib.h>' },
  { id: 'node-definition-start', code: 'typedef struct Node {' },
  { id: 'node-definition-data', code: '    int data;' },
  { id: 'node-definition-next', code: '    struct Node* next;' },
  { id: 'node-definition-end', code: '} Node;' },
]

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

const CPP_TAIL_INSERTION_CODE: readonly CodeLine[] = [
  { id: 'tail-function-start', code: 'Node* createByTail(const std::vector<int>& values) {' },
  { id: 'tail-sentinel', code: '    Node* head = new Node{0, nullptr};' },
  { id: 'tail-initialise', code: '    Node* tail = head;' },
  { id: 'tail-create-node', code: '    for (int value : values) {' },
  { id: 'tail-link-node', code: '        Node* node = new Node{value, nullptr};' },
  { id: 'tail-update-next', code: '        tail->next = node;' },
  { id: 'tail-advance', code: '        tail = node;' },
  { id: 'tail-loop-end', code: '    }' },
  { id: 'tail-return', code: '    return head;' },
  { id: 'tail-function-end', code: '}' },
]

const SEPARATOR: CodeLine = { id: 'code-separator', code: '' }

export function getLinkedListCode(insertMethod: InsertMethod, language: CodeLanguage = 'cpp'): readonly CodeLine[] {
  if (language === 'c' && insertMethod === 'tail') return C_TAIL_CODE
  const nodeDefinition = language === 'c'
    ? insertMethod === 'head' ? C_HEAD_NODE_DEFINITION : C_NODE_DEFINITION
    : CPP_NODE_DEFINITION
  const insertionCode = language === 'c'
    ? insertMethod === 'head' ? C_HEAD_INSERTION_CODE : C_TAIL_CODE
    : insertMethod === 'head' ? HEAD_INSERTION_CODE : CPP_TAIL_INSERTION_CODE

  return language === 'c' && insertMethod === 'head'
    ? [...nodeDefinition, SEPARATOR, ...insertionCode]
    : language === 'c' && insertMethod === 'tail'
      ? C_TAIL_CODE
      : [...nodeDefinition, SEPARATOR, ...insertionCode]
}
