export default function InputPanel() {
  return (
    <section className="input-panel panel" aria-labelledby="input-title">
      <div>
        <h2 id="input-title">创建单链表</h2>
        <p className="muted">输入节点值，逐步观察链表的创建过程。</p>
      </div>
      <div className="input-controls">
        <label htmlFor="node-values">节点值 <span className="muted">（界面占位）</span></label>
        <div className="input-row">
          <input id="node-values" type="text" placeholder="例如：12, 24, 36" maxLength={80} disabled />
          <button type="button" className="primary-button" disabled>创建链表</button>
        </div>
        <p className="field-hint">输入与创建功能尚未开放。</p>
      </div>
    </section>
  )
}
