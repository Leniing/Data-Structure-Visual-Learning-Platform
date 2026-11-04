export interface ListNodeSnapshot {
  readonly id: string
  readonly data: number | null
  readonly next: string | null
}

export interface HeadInsertionStep {
  readonly nodes: readonly ListNodeSnapshot[]
  readonly headId: string
  readonly newNodeId: string | null
  readonly inputIndex: number | null
  readonly codeLineId: string
  readonly description: string
}

const HEAD_ID = 'head'
const CODE_LINE_IDS = {
  createHead: 'head-sentinel',
  readValue: 'head-read-value',
  createNode: 'head-create-node',
  linkNode: 'head-link-node',
  updateHead: 'head-update-next',
  returnHead: 'head-return',
} as const

function snapshotNodes(nodes: readonly ListNodeSnapshot[]): readonly ListNodeSnapshot[] {
  return nodes.map((node) => Object.freeze({ ...node }))
}

function createStep(
  nodes: readonly ListNodeSnapshot[],
  newNodeId: string | null,
  inputIndex: number | null,
  codeLineId: string,
  description: string,
): HeadInsertionStep {
  return Object.freeze({
    nodes: Object.freeze(snapshotNodes(nodes)),
    headId: HEAD_ID,
    newNodeId,
    inputIndex,
    codeLineId,
    description,
  })
}

export function createByHeadSteps(values: readonly number[]): readonly HeadInsertionStep[] {
  const steps: HeadInsertionStep[] = []
  let nodes: ListNodeSnapshot[] = [{ id: HEAD_ID, data: null, next: null }]

  steps.push(createStep(nodes, null, null, CODE_LINE_IDS.createHead, '创建头结点；头结点不保存用户数据。'))

  for (let inputIndex = 0; inputIndex < values.length; inputIndex += 1) {
    const value = values[inputIndex]
    if (value === undefined) {
      continue
    }

    steps.push(createStep(nodes, null, inputIndex, CODE_LINE_IDS.readValue, `读取第 ${inputIndex + 1} 个值：${value}。`))

    const newNodeId = `node-${inputIndex}`
    const head = nodes[0]
    if (head === undefined) {
      return steps
    }

    const newNode: ListNodeSnapshot = { id: newNodeId, data: value, next: null }
    nodes = [...nodes, newNode]
    steps.push(createStep(nodes, newNodeId, inputIndex, CODE_LINE_IDS.createNode, `创建数据为 ${value} 的新节点。`))

    nodes = nodes.map((node) => node.id === newNodeId ? { ...node, next: head.next } : node)
    steps.push(createStep(nodes, newNodeId, inputIndex, CODE_LINE_IDS.linkNode, '将 node->next 指向原来的 head->next。'))

    nodes = nodes.map((node) => node.id === HEAD_ID ? { ...node, next: newNodeId } : node)
    steps.push(createStep(nodes, newNodeId, inputIndex, CODE_LINE_IDS.updateHead, '将 head->next 指向新节点。'))
  }

  steps.push(createStep(nodes, null, null, CODE_LINE_IDS.returnHead, '返回 head；使用结束后需要释放所有节点。'))
  return Object.freeze(steps)
}
