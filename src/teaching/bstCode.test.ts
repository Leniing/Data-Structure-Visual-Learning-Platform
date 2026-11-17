import { expect, it } from 'vitest'
import { getBstCode } from './bstCode'

it('maps executable statements to fixed teaching lines in all four snippets', () => {
  for (const language of ['c', 'cpp'] as const) {
    for (const method of ['recursive', 'iterative'] as const) {
      const lines = getBstCode(method, language)
      const statement = (id: string) => lines.find(line => line.id === id)?.code.trim()
      expect(new Set(lines.map(line => line.id)).size).toBe(lines.length)
      expect(lines[0].code).toBe(language === 'c' ? 'typedef struct BSTNode {' : 'struct BSTNode {')
      expect(statement('null-check')).toBe(method === 'recursive' ? 'if (root == NULL)' : 'while (root != NULL) {')
      expect(statement('left')).toBe(method === 'recursive' ? 'return Search(root->lchild, x);' : 'root = root->lchild;')
      expect(statement('right')).toBe(method === 'recursive' ? 'return Search(root->rchild, x);' : 'root = root->rchild;')
      expect(statement('found')).toBe(method === 'recursive' ? 'return root;' : 'break;')
      if (method === 'iterative') expect(statement('result')).toBe('return root;')
      expect(statement('end')).toBe('}')
    }
  }
})
