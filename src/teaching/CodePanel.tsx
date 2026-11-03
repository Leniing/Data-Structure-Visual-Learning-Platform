export default function CodePanel() {
  return (
    <section className="code-panel panel" aria-labelledby="code-title">
      <div className="panel-heading">
        <h2 id="code-title">教学代码</h2>
        <span className="badge">占位</span>
      </div>
      <div className="code-placeholder">
        <span className="code-label">单链表 · 创建</span>
        <pre><code>{'// 教学代码将在此展示\n// 当前尚未添加算法实现\n// 逐步高亮功能尚未开放'}</code></pre>
      </div>
      <p className="panel-note">后续将与画布共用同一个当前步骤。</p>
    </section>
  )
}
