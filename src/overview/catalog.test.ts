import { expect, it } from 'vitest'
import { algorithms, categories, filterAlgorithms } from './catalog'

it('stably prioritizes open lessons without changing IDs after search and filtering', () => {
  for (const [query, category] of [['', '全部'], ['', '树'], ['二叉', '树']] as const) {
    const result = filterAlgorithms(query, category)
    const open = result.filter(item => item.route)
    expect(result.slice(0, open.length)).toEqual(open)
    expect(result.filter(item => !item.route)).toEqual(algorithms.filter(item => result.includes(item) && !item.route))
  }
  expect(algorithms.find(item => item.route === '#bst-search')?.id).toBe('3-5')
})

it('covers all 38 operations with only the implemented lesson open', () => {
  expect(algorithms).toHaveLength(38)
  expect(new Set(algorithms.map(item => item.name)).size).toBe(38)
  expect(categories.map(category => filterAlgorithms('', category).length)).toEqual([4, 3, 5, 11, 3, 6, 6])
  expect(algorithms.filter(item => item.route).map(item => item.name)).toEqual(['单链表创建', '二叉搜索树查找'])
})

it('combines category and case-insensitive keyword search', () => {
  expect(filterAlgorithms('  dFs ', '图').map(item => item.name)).toEqual(['深度优先搜索（DFS）'])
  expect(filterAlgorithms('最小堆', '树')).toHaveLength(3)
  expect(filterAlgorithms('最短路径', '图')).toHaveLength(2)
  expect(filterAlgorithms('循环 入队', '队列').map(item => item.name)).toEqual(['循环队列入队'])
  expect(filterAlgorithms('二分', '栈')).toEqual([])
})
