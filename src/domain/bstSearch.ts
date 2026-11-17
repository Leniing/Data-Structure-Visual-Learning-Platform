import { bstTree, type BstNode } from './bstTree'
import type { BstLine, BstMethod } from '../teaching/bstCode'

export interface BstVisualState {
  readonly current: string | null
  readonly visited: readonly string[]
  readonly traversed: readonly string[]
  readonly found: string | null
  readonly failed: string | null
  readonly arrow: Readonly<{ from: string; to: string; kind: 'down' | 'return' }> | null
}
export interface BstStep extends BstVisualState {
  readonly line: BstLine
  readonly phase: 'enter' | 'check' | 'compare' | 'branch' | 'move' | 'found' | 'return' | 'done'
  readonly condition: boolean | null
  readonly description: string
  readonly result: number | 'NULL' | null
}
export function parseSearchValue(input: string): { ok: true; value: number } | { ok: false; error: string } {
  const text = input.trim()
  if (!text) return { ok: false, error: '请输入一个整数查找值' }
  if (!/^[+-]?\d+$/.test(text)) return { ok: false, error: '查找值必须是整数' }
  const value = Number(text)
  if (!Number.isSafeInteger(value) || value < -2147483648 || value > 2147483647) return { ok: false, error: '查找值范围：-2147483648 ～ 2147483647' }
  return { ok: true, value }
}

export function createBstSearchSteps(target: number, method: BstMethod, tree: readonly BstNode[] = bstTree): readonly BstStep[] {
  if (!parseSearchValue(String(target)).ok) throw new RangeError('查找值必须为 32 位有符号整数')
  const steps: BstStep[] = []
  const visited: string[] = [], traversed: string[] = []
  let current: string | null = tree[0]?.id ?? null, found: string | null = null, failed: string | null = null
  const emit = (line: BstLine, phase: BstStep['phase'], description: string, condition: boolean | null = null, arrow: BstVisualState['arrow'] = null, result: BstStep['result'] = null) => {
    steps.push(Object.freeze({ current, found, failed, visited: Object.freeze([...visited]), traversed: Object.freeze([...traversed]),
      line, phase, description, condition, arrow: arrow ? Object.freeze({ ...arrow }) : null, result }))
  }
  const frames: { parent: string; child: string; line: 'left' | 'right' }[] = []
  emit('enter', 'enter', `开始查找 ${target}`)
  // Each descent visits a distinct node of the fixed finite tree.
  for (let depth = 0; depth <= tree.length; depth++) {
    const node = tree.find(item => item.id === current)
    if (node && !visited.includes(node.id)) visited.push(node.id)
    if (!node && method === 'iterative') failed = current
    emit('null-check', 'check', node ? `判空：节点 ${node.value} 非空` : '判空：到达 NULL', method === 'recursive' ? !node : Boolean(node))
    if (!node) {
      failed = current
      if (method === 'recursive') emit('null-return', 'return', '空子树返回 NULL')
      break
    }
    emit('less', 'compare', `比较：${target} < ${node.value} 为${target < node.value ? '真' : '假'}`, target < node.value)
    if (target >= node.value) emit('greater', 'compare', `比较：${target} > ${node.value} 为${target > node.value ? '真' : '假'}`, target > node.value)
    if (target === node.value) {
      emit('equal', 'branch', `${target} = ${node.value}，进入相等分支`)
      found = node.id
      emit('found', 'found', method === 'recursive' ? `找到节点 ${target}，返回该节点` : `找到节点 ${target}，执行 break 退出循环`)
      break
    }
    const left = target < node.value, child = left ? node.left : node.right, line = left ? 'left' : 'right'
    emit(left ? 'less' : 'greater', 'branch', `进入${left ? '左' : '右'}子树分支`, true)
    frames.push({ parent: node.id, child, line })
    traversed.push(child)
    current = child
    emit(line, 'move', `${method === 'recursive' ? '调用查找' : '移动到'}${left ? '左' : '右'}孩子${child.includes('-') ? ' NULL' : ` ${child}`}`, null, { from: node.id, to: child, kind: 'down' })
  }
  if (method === 'recursive') {
    for (const frame of frames.reverse()) {
      current = frame.parent
      emit(frame.line, 'return', `子调用结束，将结果返回节点 ${frame.parent} 所在的调用`, null, { from: frame.child, to: frame.parent, kind: 'return' })
    }
    current = null
    emit('end', 'done', `最外层函数结束，${found ? `找到节点 ${target}` : '查找失败，返回 NULL'}`, null, null, found ? target : 'NULL')
  } else {
    current = null
    emit('result', 'done', `执行 return root，${found ? `返回节点 ${target}` : '返回 NULL'}`, null, null, found ? target : 'NULL')
  }
  return Object.freeze(steps)
}
