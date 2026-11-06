import { create } from 'zustand'
import type { ThemeName } from '../types'
import { applyTheme, isThemeName, loadTheme } from '../lib/theme'
import shelfConfig from '../shelf.json'

const fallback: ThemeName = isThemeName(shelfConfig.theme) ? shelfConfig.theme : 'botanical'

interface ThemeStore {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: loadTheme(fallback),
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))
