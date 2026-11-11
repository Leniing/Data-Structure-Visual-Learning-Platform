export interface KnowledgeItem {
  id: string
  title: string
  status: 'placeholder' | 'configured'
  route?: string
}

export interface Chapter {
  chapterId: string
  chapterTitle: string
  items: KnowledgeItem[]
}

export const linkedListChapter: Chapter = {
  chapterId: 'linked-list-creation',
  chapterTitle: '单链表创建',
  items: Array.from({ length: 6 }, (_, index) => ({
    id: `knowledge-${index + 1}`,
    title: `知识点占位 ${String(index + 1).padStart(2, '0')}`,
    status: 'placeholder',
  })),
}
