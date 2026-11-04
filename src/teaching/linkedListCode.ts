import type { InsertMethod } from '../algorithms/parseListInput'

export interface CodeLine {
  readonly id: string
  readonly code: string
}

const NODE_DEFINITION: readonly CodeLine[] = [
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

const TAIL_INSERTION_CODE: readonly CodeLine[] = [
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

export function getLinkedListCode(insertMethod: InsertMethod): readonly CodeLine[] {
  return [
    ...NODE_DEFINITION,
    SEPARATOR,
    ...(insertMethod === 'head' ? HEAD_INSERTION_CODE : TAIL_INSERTION_CODE),
  ]
}
