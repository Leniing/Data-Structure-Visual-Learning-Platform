import { expect, it } from 'vitest'
import { clampRect, initialRect, maximizedRect } from './geometry'

it('starts at 232 with a 380 by 480 rectangle on desktop', () => {
  expect(initialRect({ width: 1200, height: 800 })).toEqual({ left: 232, top: 80, width: 380, height: 480 })
})

it('enforces minimum size and clamps position', () => {
  expect(clampRect({ left: -20, top: 1000, width: 10, height: 10 }, { width: 800, height: 600 }))
    .toEqual({ left: 8, top: 272, width: 300, height: 320 })
})

it('fits small mobile viewports even below the normal minimum', () => {
  expect(initialRect({ width: 240, height: 280 })).toEqual({ left: 8, top: 8, width: 224, height: 264 })
  expect(initialRect({ width: 0, height: 0 })).toEqual({ left: 0, top: 0, width: 0, height: 0 })
})

it('maximizes with an eight pixel margin on desktop and mobile', () => {
  expect(maximizedRect({ width: 1500, height: 1000 })).toEqual({ left: 8, top: 8, width: 1484, height: 984 })
  expect(maximizedRect({ width: 390, height: 700 })).toEqual({ left: 8, top: 8, width: 374, height: 684 })
})

it('prioritizes available space over minimum size on tiny viewports', () => {
  expect(initialRect({ width: 10, height: 12 })).toEqual({ left: 5, top: 6, width: 0, height: 0 })
  expect(maximizedRect({ width: 16, height: 16 })).toEqual({ left: 8, top: 8, width: 0, height: 0 })
  expect(maximizedRect({ width: -1, height: -1 })).toEqual({ left: 0, top: 0, width: 0, height: 0 })
})

it('clamps oversized rectangles inside all four safe edges', () => {
  expect(clampRect({ left: 1500, top: -20, width: 2000, height: 2000 }, { width: 390, height: 700 }))
    .toEqual(maximizedRect({ width: 390, height: 700 }))
})
