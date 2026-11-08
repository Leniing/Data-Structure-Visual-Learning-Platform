import type { useTailPlayer } from './useTailPlayer'

export default function PlaybackControls({ player }: { player: ReturnType<typeof useTailPlayer> }) {
  const { total, index, playing, atEnd, speed, reset, move, toggle, setSpeed } = player
  return (
    <section className="playback-panel panel" aria-labelledby="playback-title">
      <div>
        <h2 id="playback-title">播放控制</h2>
        <p className="muted">{total ? `${index + 1} / ${total} 步 · ${atEnd ? '创建完成' : playing ? '播放中' : '已暂停'}` : '等待创建 · 画布为空'}</p>
      </div>
      <div className="playback-buttons" role="group" aria-label="播放操作">
        <button type="button" disabled={!total} onClick={reset}>重置</button>
        <button type="button" disabled={!total || index === 0} onClick={() => move(-1)}>上一步</button>
        <button type="button" className="primary-button" disabled={!total} onClick={toggle}>{playing ? '暂停' : atEnd ? '重播' : '播放'}</button>
        <button type="button" disabled={!total || atEnd} onClick={() => move(1)}>下一步</button>
      </div>
      <label className="speed-control" htmlFor="playback-speed">
        速度
        <select id="playback-speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
          <option value="0.5">0.5×</option>
          <option value="1">1×</option>
          <option value="2">2×</option>
          <option value="4">4×</option>
        </select>
      </label>
    </section>
  )
}
