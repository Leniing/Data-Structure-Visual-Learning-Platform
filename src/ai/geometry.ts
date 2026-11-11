export interface WindowRect {
  left: number
  top: number
  width: number
  height: number
}

export interface Viewport {
  width: number
  height: number
}

export const SAFE_MARGIN = 8

export function maximizedRect(viewport: Viewport): WindowRect {
  const viewportWidth = Math.max(0, viewport.width)
  const viewportHeight = Math.max(0, viewport.height)
  const left = Math.min(SAFE_MARGIN, viewportWidth / 2)
  const top = Math.min(SAFE_MARGIN, viewportHeight / 2)
  return { left, top, width: viewportWidth - 2 * left, height: viewportHeight - 2 * top }
}

export function clampRect(rect: WindowRect, viewport: Viewport): WindowRect {
  const bounds = maximizedRect(viewport)
  const width = Math.min(bounds.width, Math.max(300, rect.width))
  const height = Math.min(bounds.height, Math.max(320, rect.height))
  return {
    width,
    height,
    left: Math.max(bounds.left, Math.min(rect.left, bounds.left + bounds.width - width)),
    top: Math.max(bounds.top, Math.min(rect.top, bounds.top + bounds.height - height)),
  }
}

export function initialRect(viewport: Viewport, left = 232): WindowRect {
  return clampRect({ left, top: 80, width: 380, height: 480 }, viewport)
}
