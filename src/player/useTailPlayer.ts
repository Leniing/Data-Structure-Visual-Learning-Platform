import { useEffect, useState } from 'react'
import { createByHeadSteps, type HeadInsertionStep } from '../domain/headInsertion'
import { createByTailSteps, type TailInsertionStep } from '../domain/tailInsertion'
import type { InsertMethod } from '../algorithms/parseListInput'

export function useTailPlayer() {
  const [method, setMethod] = useState<InsertMethod>('tail')
  const [steps, setSteps] = useState<readonly (TailInsertionStep | HeadInsertionStep)[]>([])
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

  function setInsertMethod(nextMethod: InsertMethod) {
    setMethod(nextMethod)
    reset()
  }

  function start(values: readonly number[]) {
    setSteps(method === 'head' ? createByHeadSteps(values) : createByTailSteps(values))
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

  return { current, index, total: steps.length, playing, speed, runId, atEnd, start, reset, move, toggle, setSpeed, method, setInsertMethod }
}
