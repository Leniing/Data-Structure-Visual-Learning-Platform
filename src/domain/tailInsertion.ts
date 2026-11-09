export interface TailNodeSnapshot {
  readonly id: string
  readonly data: number | null
  // undefined means the field has not been initialized yet.
  readonly next: string | null | undefined
}

export interface TailInsertionStep {
  readonly nodes: readonly TailNodeSnapshot[]
  readonly headId: string | null | undefined
  readonly tailId: string | null | undefined
  readonly newNodeId: string | null
  readonly settledCount: number
  readonly inputIndex: number | null
  readonly codeLineId: string | null
  readonly condition: boolean | null
  readonly phase: 'normal' | 'disconnect' | 'attach' | 'settle' | 'complete'
  readonly description: string
}

export function createByTailSteps(values: readonly number[]): readonly TailInsertionStep[] {
  if (values.length > 12 || Array.from(values).some((value) => !Number.isInteger(value) || value < -999 || value > 999)) {
    throw new RangeError('需要 0 至 12 个 -999 到 999 的整数。')
  }
  const steps: TailInsertionStep[] = []
  let nodes: TailNodeSnapshot[] = []
  let headId: string | null | undefined
  let tailId: string | null | undefined
  let newNodeId: string | null = null
  let settledCount = 0
  let inputIndex: number | null = null
  const emit = (codeLineId: string | null, description: string, condition: boolean | null = null, phase: TailInsertionStep['phase'] = 'normal') => {
    steps.push(Object.freeze({
      nodes: Object.freeze(nodes.map((node) => Object.freeze({ ...node }))),
      headId, tailId, newNodeId, settledCount, inputIndex, codeLineId, condition, phase, description,
    }))
  }

  headId = null
  emit('tail-head', '创建空链表：head 指向 NULL，没有头结点。')
  tailId = null
  emit('tail-initialise', '创建尾指针：tail 也指向 NULL。')
  emit('tail-count-declare', '声明节点个数 n，等待读取第一行。')
  emit('tail-count', `读取第一行：n = ${values.length}。`)

  for (let index = 0; index < values.length; index++) {
    inputIndex = index
    emit('tail-loop-start', `i = ${index}，i < ${values.length} 成立，创建第 ${index + 1} 个节点。`, true)
    newNodeId = `node-${index}`
    nodes = [...nodes, { id: newNodeId, data: null, next: undefined }]
    emit('tail-create-node', '分配新节点 s：数据域和 next 尚未初始化。')
    emit('tail-read-value', `读取第 ${index + 1} 个值 ${values[index]}，写入 s 的数据域。`)
    nodes = nodes.map((node) => node.id === newNodeId ? { ...node, data: values[index]! } : node)
    emit('tail-read-value', `第 ${index + 1} 个值已写入 s 的数据域。`)
    nodes = nodes.map((node) => node.id === newNodeId ? { ...node, next: null } : node)
    emit('tail-link-node', '将 s->next 初始化为 NULL。')
    const isFirst = headId === null
    emit('tail-if-first', isFirst ? 'head == NULL 成立，进入第一个节点分支。' : 'head == NULL 不成立（红色），进入 else 分支。', isFirst)
    if (isFirst) {
      emit('tail-first', '先移除 head、tail 原来连接的 NULL 图示。', null, 'disconnect')
      headId = newNodeId
      tailId = newNodeId
      emit('tail-first', 'head 和 tail 同时指向 s 的数据域。', null, 'attach')
      settledCount++
      newNodeId = null
      emit('tail-first', '隐藏 s 标记，将节点移到 head 右侧、tail 上方。', null, 'settle')
    } else {
      emit('tail-else', '执行非第一个节点的尾插分支。')
      emit('tail-update-next', '移除原尾节点 next 指向的 NULL 图示；tail 仍指向原尾节点。', null, 'disconnect')
      nodes = nodes.map((node) => node.id === tailId ? { ...node, next: newNodeId } : node)
      emit('tail-update-next', '原尾节点的 next 指向 s；此时 tail 本身尚未移动。', null, 'attach')
      settledCount++
      newNodeId = null
      emit('tail-update-next', '隐藏 s 标记，将新节点移到原尾节点右侧。', null, 'settle')
      tailId = nodes[index]!.id
      emit('tail-advance', '执行 tail = s：尾指针移到新节点下方并指向它。')
    }
  }
  inputIndex = values.length
  emit('tail-loop-start', `i = ${values.length}，i < ${values.length} 不成立（红色），退出循环。`, false)
  emit(null, '创建完成；可拖动节点查看连线，或重新输入并创建。', null, 'complete')
  return Object.freeze(steps)
}
