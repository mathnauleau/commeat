import { useCallback } from 'react'
import { useGitHubStore } from '../store/github'
import { useRecipes } from './useRecipes'
import { parseRecipe, recipeSlug } from '../lib/parser'
import {
  validateToken,
  initRepo,
  commitFile,
  commitRecipeFile,
  deleteRecipeFile,
  deleteFile,
  readFile,
  listRecipes,
  GitHubError,
  type GitHubAuth,
} from '../lib/github'
import { generateReadme } from '../lib/readme'
import { useRecipeStore } from '../store/recipes'
import type { Recipe } from '../types'

function formatSyncError(err: unknown): string {
  if (err instanceof GitHubError) {
    if (err.status === 401 || err.status === 403) {
      return 'GitHub authentication failed. Please reconnect in Settings.'
    }
    if (err.status === 429) {
      return 'GitHub rate limit reached. Recipe saved locally — sync will resume on your next commit.'
    }
    return `GitHub sync failed: ${err.message}`
  }
  if (err instanceof Error) return `Sync error: ${err.message}`
  return 'GitHub sync failed. Your recipe is saved locally and will sync on the next attempt.'
}

export function useGitHub() {
  const { token, username, syncError, hydrating, setAuth, clearAuth, setSyncError, setHydrating } = useGitHubStore()
  const { setRecipes } = useRecipes()

  const auth: GitHubAuth | null =
    token && username ? { token, username } : null
  const isConnected = auth !== null

  const connect = useCallback(
    async (inputToken: string) => {
      const { username: name } = await validateToken(inputToken)
      setAuth(inputToken, name)
      const newAuth: GitHubAuth = { token: inputToken, username: name }
      await initRepo(newAuth)
    },
    [setAuth],
  )

  const disconnect = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  const clearSyncError = useCallback(() => setSyncError(null), [setSyncError])

  // Fire-and-forget: syncs a recipe to GitHub without blocking the caller.
  // Pass previousTitle when the recipe title changed, to delete the old file.
  const syncRecipe = useCallback(
    (recipe: Recipe, message: string, previousTitle?: string) => {
      if (!auth) {
        console.warn('[commeat] syncRecipe: no auth — token or username missing, skipping sync')
        return
      }

      const doSync = async () => {
        console.log('[commeat] syncRecipe: starting sync', { username: auth.username, title: recipe.title })
        await initRepo(auth)

        const recipePath = `recipes/${recipeSlug(recipe.title)}.md`
        console.log('[commeat] syncRecipe: committing recipe file', recipePath)
        await commitRecipeFile(auth, recipe, message)
        console.log('[commeat] syncRecipe: recipe file committed OK')

        if (previousTitle && previousTitle !== recipe.title) {
          const oldPath = `recipes/${recipeSlug(previousTitle)}.md`
          console.log('[commeat] syncRecipe: deleting old file after rename', oldPath)
          await deleteFile(auth, oldPath)
        }

        // Read store state at call time (not from the closure) to avoid staleness.
        // Commit README directly — not via syncRecipe — so no infinite loop.
        const currentRecipes = useRecipeStore.getState().recipes
        const readme = generateReadme(currentRecipes, auth.username)
        await commitFile(auth, 'README.md', readme, 'Update cookbook index')
        console.log('[commeat] syncRecipe: README updated OK')
      }

      doSync().catch((err) => {
        console.error('[commeat] syncRecipe: sync failed', err)
        setSyncError(formatSyncError(err))
      })
    },
    [auth, setSyncError],
  )

  const syncDeleteRecipe = useCallback(
    (title: string) => {
      if (!auth) {
        console.warn('[commeat] syncDeleteRecipe: no auth — skipping sync')
        return
      }

      const doSync = async () => {
        const deletePath = `recipes/${recipeSlug(title)}.md`
        console.log('[commeat] syncDeleteRecipe: deleting', deletePath)
        await deleteRecipeFile(auth, title)
        console.log('[commeat] syncDeleteRecipe: file deleted OK')
        const currentRecipes = useRecipeStore.getState().recipes
        const readme = generateReadme(currentRecipes, auth.username)
        await commitFile(auth, 'README.md', readme, 'Update cookbook index')
        console.log('[commeat] syncDeleteRecipe: README updated OK')
      }

      doSync().catch((err) => {
        console.error('[commeat] syncDeleteRecipe: sync failed', err)
        setSyncError(formatSyncError(err))
      })
    },
    [auth, setSyncError],
  )

  // Loads all recipes from the GitHub repo into the Zustand store.
  // No-ops if the repo is empty (preserves local data on first connect).
  const hydrate = useCallback(async () => {
    if (!auth) return
    setHydrating(true)
    try {
      const paths = await listRecipes(auth)
      if (paths.length === 0) return // Repo empty — keep local state

      const markdowns = await Promise.all(paths.map((p) => readFile(auth, p)))
      const recipes = markdowns.flatMap((md) => {
        try { return [parseRecipe(md)] } catch { return [] }
      })
      setRecipes(recipes)
    } catch (err) {
      setSyncError(formatSyncError(err))
    } finally {
      setHydrating(false)
    }
  }, [auth, setRecipes, setSyncError, setHydrating])

  return {
    isConnected,
    username,
    hydrating,
    syncError,
    clearSyncError,
    connect,
    disconnect,
    syncRecipe,
    syncDeleteRecipe,
    hydrate,
  }
}
