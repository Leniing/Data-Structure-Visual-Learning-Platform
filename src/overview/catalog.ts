export const categories = ['链表', '栈', '队列', '树', '查找', '图', '排序'] as const
export type Category = typeof categories[number]
export interface Algorithm {
  id: string
  category: Category
  name: string
  description: string
  keywords: string
  route?: string
}

const groups: [Category, [string, string, string, string?][]][] = [
  ['链表', [
    ['单链表创建', '从一个节点开始，用头插法或尾插法建立连接。', 'linked list create 头插 尾插', '#linked-list-creation'],
    ['单链表遍历', '沿 next 指针依次访问每一个节点。', 'traverse next'],
    ['单链表节点插入', '调整前后节点的连接，在指定位置加入节点。', 'insert 指针'],
    ['单链表节点删除', '重新连接相邻节点，移除目标节点。', 'delete 指针'],
  ]],
  ['栈', [
    ['入栈', '将新元素放入栈顶，理解后进先出的规则。', 'push stack LIFO 后进先出'],
    ['出栈', '取出栈顶元素，观察栈顶位置的变化。', 'pop stack LIFO 后进先出'],
    ['双栈创建', '在同一段存储空间中建立相向生长的两个栈。', 'double stack 共享栈'],
  ]],
  ['队列', [
    ['入队', '从队尾加入元素，保持先进先出的顺序。', 'enqueue queue FIFO 先进先出'],
    ['出队', '从队头取出元素，让后续元素依次等待。', 'dequeue queue FIFO 先进先出'],
    ['循环队列创建', '将顺序存储首尾相接，建立循环队列。', 'circular queue 环形'],
    ['循环队列入队', '移动队尾指针，通过取模回到数组起点。', 'circular enqueue rear 取模'],
    ['循环队列出队', '移动队头指针，在环形空间中释放位置。', 'circular dequeue front 取模'],
  ]],
  ['树', [
    ['二叉树创建', '连接根节点、左孩子与右孩子，建立树形结构。', 'binary tree root'],
    ['二叉树先序遍历', '按照根、左、右的顺序访问二叉树。', 'preorder DFS 深度优先'],
    ['二叉树中序遍历', '按照左、根、右的顺序访问二叉树。', 'inorder DFS 深度优先'],
    ['二叉树后序遍历', '按照左、右、根的顺序访问二叉树。', 'postorder DFS 深度优先'],
    ['二叉树层序遍历', '借助队列，从上到下逐层访问节点。', 'level order BFS 广度优先'],
    ['二叉搜索树查找', '比较节点值，逐步缩小到左子树或右子树。', 'BST search 二叉排序树'],
    ['二叉搜索树插入', '沿比较路径定位空位，保持左小右大的性质。', 'BST insert 二叉排序树'],
    ['二叉搜索树删除', '根据孩子数量处理删除，并保持搜索树有序。', 'BST delete 二叉排序树 后继'],
    ['建堆', '从非叶节点向下调整，建立最大堆或最小堆。', 'heap heapify 最大堆 最小堆'],
    ['堆插入元素', '加入元素后向上调整，支持最大堆和最小堆。', 'heap insert sift up 最大堆 最小堆'],
    ['删除堆顶', '用末尾元素替换堆顶，再向下调整最大堆或最小堆。', 'heap delete sift down 最大堆 最小堆'],
  ]],
  ['查找', [
    ['二分查找', '在有序序列中比较中点，每次排除一半范围。', 'binary search 折半 有序'],
    ['插值查找', '根据目标值估算位置，在有序序列中缩小范围。', 'interpolation search 有序'],
    ['哈希查找', '通过哈希函数定位桶，并处理可能发生的冲突。', 'hash search 散列 冲突'],
  ]],
  ['图', [
    ['深度优先搜索（DFS）', '沿一条路径深入，再回溯访问其他分支。', 'graph depth first 图遍历 栈'],
    ['广度优先搜索（BFS）', '借助队列，逐层访问相邻的未访问顶点。', 'graph breadth first 图遍历 队列'],
    ['Prim 算法', '不断选取连接树内外的最小权边，扩展生成树。', 'minimum spanning tree MST 最小生成树 普里姆'],
    ['Kruskal 算法', '按边权从小到大选边，跳过形成环的连接。', 'minimum spanning tree MST 最小生成树 并查集 克鲁斯卡尔'],
    ['Dijkstra 算法', '逐步确定源点到各顶点的最短距离，适用非负边权。', 'shortest path 最短路径 迪杰斯特拉'],
    ['Floyd 算法', '逐个引入中转顶点，更新所有点对的最短距离。', 'shortest path 最短路径 动态规划 弗洛伊德'],
  ]],
  ['排序', [
    ['简单选择排序', '每轮选出最小元素，放到未排序区间的起点。', 'selection sort'],
    ['堆排序', '建立堆并反复取出堆顶，得到有序序列。', 'heap sort 最大堆 最小堆'],
    ['直接插入排序', '将当前元素插入前方已有序序列的合适位置。', 'insertion sort'],
    ['希尔排序', '按逐渐缩小的间隔分组，进行插入排序。', 'shell sort 增量'],
    ['冒泡排序', '比较相邻元素并交换，让较大元素逐步移向末尾。', 'bubble sort'],
    ['快速排序', '选择基准分区，再递归整理左右两侧。', 'quick sort pivot 分治'],
  ]],
]

export const algorithms: Algorithm[] = groups.flatMap(([category, entries], group) => entries.map(([name, description, keywords, route], index) => ({
  id: `${group}-${index}`, category, name, description, keywords, route,
})))

export function filterAlgorithms(query: string, category: Category | '全部') {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return algorithms.filter(item => (category === '全部' || item.category === category) && terms.every(term =>
    `${item.name} ${item.category} ${item.description} ${item.keywords}`.toLocaleLowerCase().includes(term)))
}
