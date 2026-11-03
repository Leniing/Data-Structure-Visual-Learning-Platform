export default function CanvasPanel() {
  return (
    <section className="canvas-panel panel" aria-labelledby="canvas-title">
      <div className="panel-heading">
        <h2 id="canvas-title">链表画布</h2>
        <span className="badge">静态示意</span>
      </div>
      <div className="canvas-surface">
        <svg viewBox="0 0 600 260" role="img" aria-labelledby="diagram-title diagram-description">
          <title id="diagram-title">单链表画布占位示意</title>
          <desc id="diagram-description">头指针指向空值 NULL，尚未创建节点。此图不代表算法执行状态。</desc>
          <text x="210" y="110" className="svg-label">头指针</text>
          <text x="210" y="143" className="svg-value">head</text>
          <path d="M 258 135 H 322 M 313 128 L 322 135 L 313 142" className="svg-arrow" />
          <rect x="340" y="113" width="80" height="44" rx="8" className="svg-null-box" />
          <text x="380" y="141" textAnchor="middle" className="svg-value">NULL</text>
        </svg>
        <p className="canvas-caption">节点与连线将在这里展示</p>
      </div>
      <p className="panel-note">当前仅为布局预览，尚未连接算法步骤。</p>
    </section>
  )
}
