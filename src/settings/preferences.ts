import { useLayoutEffect, useState } from 'react'
import './preferences.css'

export const options = {
  theme: ['light', 'dark', 'system'],
  palette: ['multicolor', 'sand', 'sage', 'slate'],
  font: ['default', 'system', 'serif'],
  codeFont: ['jetbrains', 'consolas', 'courier'],
} as const

export type Preferences = { [Key in keyof typeof options]: typeof options[Key][number] }

export const defaults: Preferences = {
  theme: 'light',
  palette: 'multicolor',
  font: 'default',
  codeFont: 'jetbrains',
}

const storageKey = 'ds-visual-learning.preferences'

function readPreferences(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    return {
      theme: options.theme.includes(saved?.theme) ? saved.theme : defaults.theme,
      palette: options.palette.includes(saved?.palette) ? saved.palette : defaults.palette,
      font: options.font.includes(saved?.font) ? saved.font : defaults.font,
      codeFont: options.codeFont.includes(saved?.codeFont) ? saved.codeFont : defaults.codeFont,
    }
  } catch {
    return defaults
  }
}

export function usePreferences() {
  const [preferences, setPreferences] = useState(readPreferences)

  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = preferences.theme
    root.dataset.palette = preferences.palette
    root.dataset.interfaceFont = preferences.font
    root.dataset.codeFont = preferences.codeFont
    try {
      localStorage.setItem(storageKey, JSON.stringify(preferences))
    } catch {
      // Preferences still apply for the current session when storage is unavailable.
    }
    return () => {
      delete root.dataset.theme
      delete root.dataset.palette
      delete root.dataset.interfaceFont
      delete root.dataset.codeFont
    }
  }, [preferences])

  return [preferences, setPreferences] as const
}
