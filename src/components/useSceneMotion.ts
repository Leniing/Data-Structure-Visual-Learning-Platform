import { useEffect, useRef, useState } from 'react'
import type { SceneItem } from './tailScene'

export function useSceneMotion(items: readonly SceneItem[]) {
  const previous = useRef(items)
  const [frame, setFrame] = useState(items)
  useEffect(() => {
    const from = previous.current
    const started = performance.now()
    let handle = 0
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180
    const tick = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min(1, (now - started) / duration)
      const eased = progress * progress * (3 - 2 * progress)
      const next = items.map((item) => {
        const origin = from.find((old) => old.id === item.id)?.position ?? item.position
        return { ...item, position: { x: origin.x + (item.position.x - origin.x) * eased, y: origin.y + (item.position.y - origin.y) * eased } }
      })
      previous.current = next
      setFrame(next)
      if (progress < 1) handle = requestAnimationFrame(tick)
    }
    handle = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(handle)
  }, [items])
  // Topology and values switch immediately; only positions interpolate.
  return items.map((item) => ({ ...item, position: frame.find((old) => old.id === item.id)?.position ?? item.position }))
}
