import { useEffect, useState } from 'react'
import { createBstSearchSteps, type BstStep } from '../domain/bstSearch'
import type { BstMethod } from '../teaching/bstCode'

export function useBstPlayer(active = true) {
  const [steps, setSteps] = useState<readonly BstStep[]>([])
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const atEnd = steps.length > 0 && index === steps.length - 1
  useEffect(() => {
    if (!active || !playing || atEnd || !steps.length) return
    const timer = window.setTimeout(() => {
      setIndex(value => Math.min(value + 1, steps.length - 1))
      if (index + 1 === steps.length - 1) setPlaying(false)
    }, 850 / speed)
    return () => window.clearTimeout(timer)
  }, [active, playing, atEnd, steps, index, speed])
  const reset = () => { setSteps([]); setIndex(0); setPlaying(false) }
  const start = (target: number, method: BstMethod) => { setSteps(createBstSearchSteps(target, method)); setIndex(0); setPlaying(true) }
  const move = (delta: number) => { setPlaying(false); setIndex(value => Math.max(0, Math.min(steps.length - 1, value + delta))) }
  const toggle = () => { if (!steps.length) return; if (atEnd) setIndex(0); setPlaying(value => !value) }
  return { current: steps[index] ?? null, total: steps.length, index, playing, atEnd, speed, setSpeed, reset, start, move, toggle }
}
