export interface ListNodeSnapshot {
  readonly id: string
  readonly data: number | null
  readonly next: string | null | undefined
}

export interface HeadInsertionStep {
  readonly nodes: readonly ListNodeSnapshot[]
  readonly headId: string | null | undefined
  readonly newNodeId: string | null
  readonly inputIndex: number | null
  readonly codeLineId: string | null
  readonly condition: boolean | null
  readonly phase: 'normal' | 'disconnect' | 'attach' | 'settle' | 'complete'
  readonly description: string
}

export function createByHeadSteps(values: readonly number[]): readonly HeadInsertionStep[] {
  if (values.length > 12 || Array.from(values).some((value) => !Number.isInteger(value) || value < -999 || value > 999)) {
    throw new RangeError('需要 0 至 12 个 -999 到 999 的整数。')
  }

  const steps: HeadInsertionStep[] = []
  let nodes: ListNodeSnapshot[] = []
  let headId: string | null | undefined
  let newNodeId: string | null = null
  let inputIndex: number | null = null
  const emit = (codeLineId: string | null, description: string, condition: boolean | null = null, phase: HeadInsertionStep['phase'] = 'normal') => {
    steps.push(Object.freeze({
      nodes: Object.freeze(nodes.map((node) => Object.freeze({ ...node }))),
      headId, newNodeId, inputIndex, codeLineId, condition, phase, description,
    }))
  }

  headId = null
  emit('head-head', '创建空链表：head 指向 NULL。')
  emit('head-count-declare', '声明节点个数 n，等待读取第一行。')
  emit('head-count', `读取第一行：n = ${values.length}。`)

  for (let index = 0; index < values.length; index += 1) {
    inputIndex = index
    emit('head-loop-start', `i = ${index}，i < ${values.length} 成立，创建第 ${index + 1} 个节点。`, true)
    newNodeId = `node-${index}`
    nodes = [...nodes, { id: newNodeId, data: null, next: undefined }]
    emit('head-create-node', '分配新节点 s：数据域和 next 尚未初始化。')
    nodes = nodes.map((node) => node.id === newNodeId ? { ...node, data: values[index]! } : node)
    emit('head-read-value', `读取第 ${index + 1} 个值 ${values[index]}，写入 s 的数据域。`)
    nodes = nodes.map((node) => node.id === newNodeId ? { ...node, next: headId } : node)
    emit('head-link-node', '让 s->next 指向 head 当前指向的位置。')
    emit('head-update', '移除 head 原来的箭头，保留 s->next 箭头。', null, 'disconnect')
    headId = newNodeId
    emit('head-update', '标识 s 消失，head 的箭头改为指向新节点。', null, 'attach')
    newNodeId = null
    emit('head-update', '新节点移动到 head 的右方，原有节点及 NULL 向右移动。', null, 'settle')
  }

  inputIndex = values.length
  emit('head-loop-start', `i = ${values.length}，i < ${values.length} 不成立（红色），退出循环。`, false)
  emit(null, '创建完成；可拖动节点查看连线，或重新输入并创建。', null, 'complete')
  return Object.freeze(steps)
}
