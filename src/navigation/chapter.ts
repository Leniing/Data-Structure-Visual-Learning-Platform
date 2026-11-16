import { algorithms, categories } from '../overview/catalog'

export interface KnowledgeItem {
  id: string
  title: string
  status: 'unavailable' | 'configured'
  group?: string
  route?: string
}

export interface Chapter {
  chapterId: string
  chapterTitle: string
  items: KnowledgeItem[]
}

export const chapters: Chapter[] = categories.map(category => ({
  chapterId: category,
  chapterTitle: category,
  items: algorithms.filter(item => item.category === category).map((item, index) => ({
    id: item.id,
    title: item.name,
    status: item.route ? 'configured' : 'unavailable',
    route: item.route,
    group: category === '树'
      ? index < 5 ? '二叉树' : index < 8 ? '二叉搜索树' : '堆（最大堆 / 最小堆）'
      : category === '图'
        ? index < 2 ? '图遍历' : index < 4 ? '最小生成树' : '最短路径'
        : undefined,
  })),
}))

export const linkedListChapter = chapters[0]
