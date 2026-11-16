import type { Algorithm } from './catalog'

/** Inline SVG inherits the same theme tokens as the card. No animation state. */
export default function AlgorithmDiagram({ algorithm }: { algorithm: Algorithm }) {
  const { category, name } = algorithm
  const node = (x: number, y: number, label: string, active = false) => <g key={`${x}-${y}`}>
    <rect x={x - 18} y={y - 16} width="36" height="32" rx="8" className={active ? 'diagram-active' : 'diagram-node'} />
    <text x={x} y={y + 5}>{label}</text>
  </g>
  let drawing
  if (category === '树') {
    const heap = name.includes('堆')
    drawing = <><path d="M150 28 90 72M150 28 210 72M90 72 55 116M90 72 120 116" />
      {[[150, 28, heap ? '9' : '6'], [90, 72, '3'], [210, 72, heap ? '7' : '8'], [55, 116, '1'], [120, 116, '2']].map(([x, y, label], i) => node(Number(x), Number(y), String(label), i === 0))}</>
  } else if (category === '图') {
    drawing = <><path d="M50 78 120 30 240 55 205 119 120 30M50 78 130 120 205 119M130 120 240 55" />
      {[[50, 78], [120, 30], [240, 55], [205, 119], [130, 120]].map(([x, y], i) => node(x, y, 'ABCDE'[i], i === 0))}</>
  } else if (category === '栈') {
    drawing = <><path d="M90 28v104h120V28M235 30v65m-7-7 7 7 7-7" />
      {[112, 78, 44].map((y, i) => node(150, y, String(i + 1), i === 2))}<text x="245" y="120">top</text></>
  } else if (category === '排序') {
    drawing = <>{[40, 80, 55, 100, 65, 115].map((h, i) => <rect key={i} x={30 + i * 42} y={138 - h} width="26" height={h} rx="4" className={i === 3 ? 'diagram-active' : 'diagram-node'} />)}<path d="M78 13h82m-7-5 7 5-7 5" /></>
  } else if (category === '队列' && name.includes('循环')) {
    drawing = <><ellipse cx="150" cy="80" rx="94" ry="48" />{[[56, 80], [103, 38], [197, 38], [244, 80], [197, 122], [103, 122]].map(([x, y], i) => node(x, y, String(i), i === 0))}</>
  } else {
    const search = category === '查找'
    drawing = <><path d="M35 80h230m-7-6 7 6-7 6" />
      {(search ? ['2', '5', '8', '12', '19'] : ['1', '2', '3', '4']).map((value, i) => node(40 + i * (search ? 55 : 70), 80, value, i === (search ? 2 : 0)))}
      <text x="150" y="35">{search ? (name.includes('哈希') ? 'key → hash(key)' : 'low → mid ← high') : category === '链表' ? 'head → next' : 'front → rear'}</text></>
  }
  return <svg className="algorithm-diagram" viewBox="0 0 300 160" role="img" aria-label={`${name}的${category}结构示意图`}>
    {drawing}
  </svg>
}
