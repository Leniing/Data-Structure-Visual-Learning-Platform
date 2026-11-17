import type { useTailPlayer } from './useTailPlayer'

import PlatformIcon from '../components/PlatformIcon'

type PlaybackPlayer = Pick<ReturnType<typeof useTailPlayer>, 'total' | 'index' | 'playing' | 'atEnd' | 'speed' | 'reset' | 'move' | 'toggle' | 'setSpeed'>

export default function PlaybackControls({ player, status }: { player: PlaybackPlayer; status?: string }) {
  const { total, index, playing, atEnd, speed, reset, move, toggle, setSpeed } = player
  const toggleLabel = playing ? '暂停' : atEnd ? '重播' : '继续'
  return (
    <section className="playback-panel panel" aria-labelledby="playback-title">
      <div>
        <h2 id="playback-title">播放控制</h2>
        <p className="muted">{status ?? (total ? `${index + 1} / ${total} 步 · ${atEnd ? '创建完成' : playing ? '播放中' : '已暂停'}` : '等待创建')}</p>
      </div>
      <div className="playback-buttons" role="group" aria-label="播放操作">
        <button type="button" aria-label="重置" title="重置" disabled={!total} onClick={reset}>
          <PlatformIcon name="reset" />
        </button>
        <button type="button" aria-label="上一步" title="上一步" disabled={!total || index === 0} onClick={() => move(-1)}>
          <PlatformIcon name="step-back" />
        </button>
        <button type="button" className="playback-toggle" aria-label={toggleLabel} title={toggleLabel} disabled={!total} onClick={toggle}>
          <PlatformIcon name={playing ? 'pause' : 'resume'} />
        </button>
        <button type="button" aria-label="下一步" title="下一步" disabled={!total || atEnd} onClick={() => move(1)}>
          <PlatformIcon name="step-forward" />
        </button>
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
