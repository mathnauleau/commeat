import { create } from 'zustand'

interface GitHubStore {
  token: string | null
  username: string | null
  syncError: string | null
  setAuth: (token: string, username: string) => void
  clearAuth: () => void
  setSyncError: (error: string | null) => void
}

function loadStored(): { token: string | null; username: string | null } {
  try {
    const raw = localStorage.getItem('commeat-github')
    if (raw) return JSON.parse(raw) as { token: string; username: string }
  } catch {}
  return { token: null, username: null }
}

const stored = loadStored()

export const useGitHubStore = create<GitHubStore>((set) => ({
  token: stored.token,
  username: stored.username,
  syncError: null,

  setAuth: (token, username) => {
    localStorage.setItem('commeat-github', JSON.stringify({ token, username }))
    set({ token, username, syncError: null })
  },

  clearAuth: () => {
    localStorage.removeItem('commeat-github')
    set({ token: null, username: null, syncError: null })
  },

  setSyncError: (error) => set({ syncError: error }),
}))
