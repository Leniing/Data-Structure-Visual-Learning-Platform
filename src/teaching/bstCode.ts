import type { CodeLanguage, CodeLine } from './linkedListCode'

// Fixed teaching text only. The animation never executes these snippets.
const definitions = {
  c: `typedef struct BSTNode {
    int data;
    struct BSTNode *lchild, *rchild;
} BSTNode;`,
  cpp: `struct BSTNode {
    int data;
    BSTNode *lchild, *rchild;
};`,
}
const recursive = `BSTNode* Search(BSTNode *root, int x) {
    // 空树
    // 返回 NULL
    if (root == NULL)
        return NULL;

    // 查找值 < 节点值
    // 往左子树查找
    else if (x < root->data)
        return Search(root->lchild, x);

    // 查找值 > 节点值
    // 往右子树查找
    else if (x > root->data)
        return Search(root->rchild, x);

    // 查找值 = 节点值
    // x == root->data
    // 返回该节点的地址
    else
        return root;
}`
const iterative = `BSTNode* Search(BSTNode *root, int x) {
    // 当前节点不为空
    // 继续查找
    while (root != NULL) {
        // 查找值 < 节点值
        // 往左子树查找
        if (x < root->data) {
            root = root->lchild;
        }

        // 查找值 > 节点值
        // 往右子树查找
        else if (x > root->data) {
            root = root->rchild;
        }

        // 查找值 = 节点值
        // x == root->data
        // 查找成功，退出循环
        else {
            break;
        }
    }

    // 查找成功，返回该节点的地址
    // 查找失败，返回 NULL
    return root;
}`

export type BstMethod = 'recursive' | 'iterative'
export type BstLine = 'enter' | 'null-check' | 'null-return' | 'less' | 'left' | 'greater' | 'right' | 'equal' | 'found' | 'result' | 'end'
const semanticLines: Record<BstMethod, Partial<Record<BstLine, number>>> = {
  recursive: { enter: 0, 'null-check': 3, 'null-return': 4, less: 8, left: 9, greater: 13, right: 14, equal: 19, found: 20, end: 21 },
  iterative: { enter: 0, 'null-check': 3, less: 6, left: 7, greater: 12, right: 13, equal: 19, found: 20, result: 26, end: 27 },
}

export function getBstCode(method: BstMethod, language: CodeLanguage): readonly CodeLine[] {
  const text = `${definitions[language]}\n\n${method === 'recursive' ? recursive : iterative}`
  return Object.freeze(text.split('\n').map((code, index) => Object.freeze({
    id: Object.entries(semanticLines[method]).find(([, line]) => line === index - 5)?.[0] ?? `text-${index}`,
    code,
  })))
}
