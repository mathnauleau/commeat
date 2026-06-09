import { useCallback } from 'react'
import { useGitHubStore } from '../store/github'
import { validateToken, initRepo, type GitHubAuth } from '../lib/github'
import shelfConfig from '../shelf.json'

export function useGitHub() {
  const { token, username, syncError, setSyncError, setAuth, clearAuth } = useGitHubStore()

  const auth: GitHubAuth | null =
    token && username ? { token, username, repoName: shelfConfig.repoName } : null

  const isConnected = auth !== null

  const connect = useCallback(
    async (inputToken: string) => {
      const { username: name } = await validateToken(inputToken)
      setAuth(inputToken, name)
      const newAuth: GitHubAuth = { token: inputToken, username: name, repoName: shelfConfig.repoName }
      await initRepo(newAuth)
    },
    [setAuth],
  )

  const disconnect = useCallback(() => clearAuth(), [clearAuth])

  const clearSyncError = useCallback(() => setSyncError(null), [setSyncError])

  return { isConnected, username, syncError, clearSyncError, connect, disconnect }
}
