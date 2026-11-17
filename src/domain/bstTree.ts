// Fixed topology. NULL positions belong to edges, not real tree nodes.
export const bstTree = Object.freeze([
  { id: '14', value: 14, left: '7', right: '18', x: 360, y: 70 },
  { id: '7', value: 7, left: '5', right: '11', x: 200, y: 180 },
  { id: '18', value: 18, left: '18-L', right: '25', x: 520, y: 180 },
  { id: '5', value: 5, left: '5-L', right: '5-R', x: 110, y: 290 },
  { id: '11', value: 11, left: '11-L', right: '11-R', x: 290, y: 290 },
  { id: '25', value: 25, left: '25-L', right: '25-R', x: 610, y: 290 },
].map(node => Object.freeze(node)))

export const bstPositions = Object.freeze([
  ...bstTree,
  ...bstTree.flatMap(node => [node.left, node.right].flatMap((id, side) =>
    bstTree.some(child => child.id === id) ? [] : [{ id, value: null, x: node.x + (side ? 46 : -46), y: node.y + 100 }])),
].map(position => Object.freeze(position)))

export const bstEdges = Object.freeze(bstTree.flatMap(node => [node.left, node.right].map(to => Object.freeze({ from: node.id, to }))))
