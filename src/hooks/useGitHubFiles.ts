import { useState, useCallback, useEffect } from 'react'
import { useGitHubStore } from '../store/github'
import {
  listRecipes,
  readFile,
  readImageAsDataUrl,
  commitFile,
  deleteFile as deleteFileGH,
  GitHubError,
  type GitHubAuth,
  type GitHubReadConfig,
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

  // Read config always works — public repo is readable without a token
  const readConfig: GitHubReadConfig = {
    username: shelfConfig.repoOwner,
    repoName: shelfConfig.repoName,
    token: token ?? undefined,
  }

  // Write auth — only available when a PAT is configured
  const auth: GitHubAuth | null =
    token && username ? { token, username, repoName: shelfConfig.repoName } : null

  const [files, setFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const paths = await listRecipes(readConfig)
      setFiles(paths)
    } catch (err) {
      setError(formatError(err))
    } finally {
      setLoading(false)
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

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
      return readFile(readConfig, path)
    },
    [token], // eslint-disable-line react-hooks/exhaustive-deps
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

  const resolveImages = useCallback(
    async (markdown: string, fromPath: string): Promise<string> => {

      const dir = fromPath.replace(/\/[^/]+$/, '') // e.g. "recipes"

      // Collect all relative src values from markdown ![]() and HTML <img>
      const mdMatches = [...markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1])
      const htmlMatches = [...markdown.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1])
      const relativePaths = [...new Set([...mdMatches, ...htmlMatches])].filter(
        (s) => !s.startsWith('http') && !s.startsWith('data:'),
      )

      if (relativePaths.length === 0) return markdown

      const replacements = await Promise.all(
        relativePaths.map(async (relPath) => {
          try {
            const parts = [...dir.split('/'), ...relPath.split('/')]
            const resolved: string[] = []
            for (const p of parts) {
              if (p === '..') resolved.pop()
              else if (p !== '.') resolved.push(p)
            }
            const dataUrl = await readImageAsDataUrl(readConfig, resolved.join('/'))
            return [relPath, dataUrl] as const
          } catch {
            return null
          }
        }),
      )

      let result = markdown
      for (const pair of replacements) {
        if (pair) result = result.replaceAll(pair[0], pair[1])
      }
      return result
    },
    [token], // eslint-disable-line react-hooks/exhaustive-deps
  )

  return { files, loading, error, fetchFile, saveFile, deleteFile, reload, resolveImages }
}
