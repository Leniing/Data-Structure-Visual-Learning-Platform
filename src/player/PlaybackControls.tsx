export default function PlaybackControls() {
  return (
    <section className="playback-panel panel" aria-labelledby="playback-title">
      <div>
        <h2 id="playback-title">播放控制</h2>
        <p className="muted">尚无步骤 · 控件占位</p>
      </div>
      <div className="playback-buttons" role="group" aria-label="播放操作（尚未开放）">
        <button type="button" disabled>重置</button>
        <button type="button" disabled>上一步</button>
        <button type="button" className="primary-button" disabled>播放</button>
        <button type="button" disabled>下一步</button>
      </div>
      <label className="speed-control" htmlFor="playback-speed">
        速度
        <select id="playback-speed" disabled defaultValue="1">
          <option value="1">1×</option>
        </select>
      </label>
    </section>
  )
}
