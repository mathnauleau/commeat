import { useState, useCallback, useEffect } from 'react'
import { useGitHubStore } from '../store/github'
import {
  listRecipes,
  readFile,
  commitFile,
  deleteFile as deleteFileGH,
  GitHubError,
  type GitHubAuth,
} from '../lib/github'
import { generateReadme } from '../lib/readme'
import shelfConfig from '../shelf.json'

function formatError(err: unknown): string {
  if (err instanceof GitHubError) {
    if (err.status === 401 || err.status === 403) return 'GitHub authentication failed. Please reconnect in Settings.'
    if (err.status === 429) return 'GitHub rate limit reached. Try again in a moment.'
    return `GitHub sync failed: ${err.message}`
  }
  return err instanceof Error ? err.message : 'GitHub sync failed.'
}

export function useGitHubFiles() {
  const { token, username, setSyncError } = useGitHubStore()
  const auth: GitHubAuth | null =
    token && username ? { token, username, repoName: shelfConfig.repoName } : null

  const [files, setFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!auth) return
    setLoading(true)
    setError(null)
    try {
      const paths = await listRecipes(auth)
      setFiles(paths)
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }, [token, username]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    reload()
  }, [reload])

  const updateReadme = useCallback(
    (currentFiles: string[]) => {
      if (!auth) return
      const readme = generateReadme(currentFiles, auth.username)
      commitFile(auth, 'README.md', readme, 'Update cookbook index').catch((err) =>
        setSyncError(formatError(err)),
      )
    },
    [token, username, setSyncError], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const fetchFile = useCallback(
    async (path: string): Promise<string> => {
      if (!auth) throw new Error('Not connected to GitHub')
      return readFile(auth, path)
    },
    [token, username], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const saveFile = useCallback(
    async (path: string, content: string, message: string): Promise<void> => {
      if (!auth) throw new Error('Not connected to GitHub')
      try {
        await commitFile(auth, path, content, message)
        setFiles((prev) => {
          const next = prev.includes(path) ? prev : [...prev, path]
          updateReadme(next)
          return next
        })
      } catch (err) {
        const msg = formatError(err)
        setSyncError(msg)
        throw err
      }
    },
    [token, username, updateReadme, setSyncError], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const deleteFile = useCallback(
    async (path: string, message: string): Promise<void> => {
      if (!auth) throw new Error('Not connected to GitHub')
      try {
        await deleteFileGH(auth, path, message)
        setFiles((prev) => {
          const next = prev.filter((f) => f !== path)
          updateReadme(next)
          return next
        })
      } catch (err) {
        const msg = formatError(err)
        setSyncError(msg)
        throw err
      }
    },
    [token, username, updateReadme, setSyncError], // eslint-disable-line react-hooks/exhaustive-deps
  )

  return { files, loading, error, fetchFile, saveFile, deleteFile, reload }
}
