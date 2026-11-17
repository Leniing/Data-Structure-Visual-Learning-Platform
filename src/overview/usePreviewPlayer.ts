import { useEffect, useState } from 'react'

export function usePreviewPlayer(length: number, active: boolean) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [index, setIndex] = useState(0)
  const [wasActive, setWasActive] = useState(active)
  if (wasActive !== active) {
    setWasActive(active)
    if (!active) { setHovered(false); setFocused(false) }
  }
  const engaged = active && !reduced && (hovered || focused)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(media.matches)
    media.addEventListener?.('change', change)
    return () => media.removeEventListener?.('change', change)
  }, [])
  useEffect(() => {
    if (!engaged) return
    let next = 1
    let timer = window.setTimeout(function advance() {
      setIndex(next++)
      if (next < length) timer = window.setTimeout(advance, 480)
    }, 80)
    return () => window.clearTimeout(timer)
  }, [engaged, length])
  const [wasEngaged, setWasEngaged] = useState(engaged)
  if (wasEngaged !== engaged) { setWasEngaged(engaged); setIndex(0) }
  return { index: engaged ? index : 0, events: {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
    },
  } }
}
