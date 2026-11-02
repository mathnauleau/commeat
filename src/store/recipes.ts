import { create } from 'zustand'

const CACHE_LIFETIME_MS = 5 * 60 * 1000

interface CachedRecipe {
  text: string
  at: number
}

interface RecipesStore {
  readWith: string | null
  files: string[] | null
  filesAt: number
  markdown: Record<string, CachedRecipe>
  setFiles: (files: string[]) => void
  setMarkdown: (path: string, text: string) => void
  removeMarkdown: (path: string) => void
  reset: (readWith: string | null) => void
}

export function isFresh(at: number): boolean {
  return Date.now() - at < CACHE_LIFETIME_MS
}

// Memory only: a refresh starts clean. Entries past their lifetime stay on screen
// until the refetch lands, so an older shelf beats a skeleton or an error.
export const useRecipesStore = create<RecipesStore>((set) => ({
  readWith: null,
  files: null,
  filesAt: 0,
  markdown: {},

  setFiles: (files) => set({ files, filesAt: Date.now() }),

  setMarkdown: (path, text) =>
    set((state) => ({ markdown: { ...state.markdown, [path]: { text, at: Date.now() } } })),

  removeMarkdown: (path) =>
    set((state) => {
      const markdown = { ...state.markdown }
      delete markdown[path]
      return { markdown }
    }),

  reset: (readWith) => set({ readWith, files: null, filesAt: 0, markdown: {} }),
}))
