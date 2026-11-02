import { useState, useCallback, useEffect } from 'react'
import { useGitHubStore } from '../store/github'
import { useRecipesStore, isFresh } from '../store/recipes'
import {
  listRecipes,
  readFile,
  readImageUrl,
  commitFile,
  deleteFile as deleteFileGH,
  GitHubError,
  toReadProblem,
  type GitHubAuth,
  type GitHubReadConfig,
  type ReadProblem,
} from '../lib/github'
import { generateReadme } from '../lib/readme'
import shelfConfig from '../shelf.json'

const NO_FILES: string[] = []

function formatError(err: unknown): string {
  if (err instanceof GitHubError) {
    if (err.status === 401 || err.status === 403) return 'GitHub authentication failed. Please reconnect in Settings.'
    if (err.status === 429) return 'GitHub rate limit reached. Please try again later.'
    return `GitHub sync failed: ${err.message}`
  }
  return err instanceof Error ? err.message : 'GitHub sync failed.'
}

export function useGitHubFiles() {
  const { token, username, setSyncError } = useGitHubStore()
  const cachedFiles = useRecipesStore((s) => s.files)

  // Read config always works — public repo is readable without a token
  const readConfig: GitHubReadConfig = {
    username: shelfConfig.repoOwner,
    repoName: shelfConfig.repoName,
    token: token ?? undefined,
  }

  // Write auth — only available when a PAT is configured
  const auth: GitHubAuth | null =
    token && username ? { token, username, repoName: shelfConfig.repoName } : null

  const [error, setError] = useState<ReadProblem | null>(null)

  const loadFiles = useCallback(async (force: boolean) => {
    const cache = useRecipesStore.getState()
    if (cache.readWith !== token) cache.reset(token)
    else if (!force && cache.files && isFresh(cache.filesAt)) return

    try {
      const paths = await listRecipes(readConfig)
      useRecipesStore.getState().setFiles(paths)
      setError(null)
    } catch (err) {
      setError(toReadProblem(err))
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const reload = useCallback(() => loadFiles(true), [loadFiles])

  useEffect(() => {
    loadFiles(false)
  }, [loadFiles])

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
      const cached = useRecipesStore.getState().markdown[path]
      if (cached && isFresh(cached.at)) return cached.text
      const text = await readFile(readConfig, path)
      useRecipesStore.getState().setMarkdown(path, text)
      return text
    },
    [token], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const saveFile = useCallback(
    async (path: string, content: string, message: string): Promise<void> => {
      if (!auth) throw new Error('Not connected to GitHub')
      try {
        await commitFile(auth, path, content, message)
        const { files, setFiles, setMarkdown } = useRecipesStore.getState()
        const prev = files ?? []
        const next = prev.includes(path) ? prev : [...prev, path]
        setFiles(next)
        setMarkdown(path, content)
        updateReadme(next)
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
        const { files, setFiles, removeMarkdown } = useRecipesStore.getState()
        const next = (files ?? []).filter((f) => f !== path)
        setFiles(next)
        removeMarkdown(path)
        updateReadme(next)
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
            const url = await readImageUrl(readConfig, resolved.join('/'))
            return [relPath, url] as const
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

  return {
    files: cachedFiles ?? NO_FILES,
    loading: cachedFiles === null && error === null,
    error,
    fetchFile,
    saveFile,
    deleteFile,
    reload,
    resolveImages,
  }
}
