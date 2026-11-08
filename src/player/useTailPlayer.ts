import { useEffect, useState } from 'react'
import { createByTailSteps, type TailInsertionStep } from '../domain/tailInsertion'

export function useTailPlayer() {
  const [steps, setSteps] = useState<readonly TailInsertionStep[]>([])
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [runId, setRunId] = useState(0)
  const current = steps[index] ?? null
  const atEnd = steps.length > 0 && index === steps.length - 1

  useEffect(() => {
    if (!playing || atEnd || steps.length === 0) return
    const timer = window.setTimeout(() => {
      setIndex((value) => value + 1)
      if (index + 1 >= steps.length - 1) setPlaying(false)
    }, 850 / speed)
    return () => window.clearTimeout(timer)
  }, [playing, atEnd, index, steps, speed])

  function reset() {
    setPlaying(false)
    setSteps([])
    setIndex(0)
    setRunId((value) => value + 1)
  }

  function start(values: readonly number[]) {
    setSteps(createByTailSteps(values))
    setIndex(0)
    setPlaying(true)
    setRunId((value) => value + 1)
  }

  function move(delta: number) {
    setPlaying(false)
    setIndex((value) => Math.max(0, Math.min(steps.length - 1, value + delta)))
  }

  function toggle() {
    if (steps.length === 0) return
    if (atEnd) {
      setIndex(0)
      setRunId((value) => value + 1)
    }
    setPlaying((value) => !value)
  }

  return { current, index, total: steps.length, playing, speed, runId, atEnd, start, reset, move, toggle, setSpeed }
}
