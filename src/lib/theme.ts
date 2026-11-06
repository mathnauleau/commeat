import type { ThemeName } from '../types'

// Read by the inline script in index.html too, so the page paints in the right theme first time
export const THEME_STORAGE_KEY = 'commeat-theme'

export function isThemeName(value: unknown): value is ThemeName {
  return value === 'botanical' || value === 'dusk'
}

export function loadTheme(fallback: ThemeName): ThemeName {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeName(stored) ? stored : fallback
  } catch {
    return fallback
  }
}

/** Botanical is the stylesheet's default; any other theme is a data-theme attribute on <html> */
export function applyTheme(theme: ThemeName): void {
  const root = document.documentElement
  if (theme === 'botanical') delete root.dataset.theme
  else root.dataset.theme = theme
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Private mode: the theme still applies for this visit
  }
}
