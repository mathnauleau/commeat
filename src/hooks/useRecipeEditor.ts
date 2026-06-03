import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { appendCommit } from '../lib/parser'
import { toSlug } from '../lib/slug'
import { useRecipe, useRecipes } from './useRecipes'
import { useGitHub } from './useGitHub'
import type { Recipe } from '../types'

function comparableValue(recipe: Recipe, key: keyof Recipe): unknown {
  const val = recipe[key]
  if (Array.isArray(val)) return val.filter(Boolean)
  return val
}

export function useRecipeEditor(slug: string) {
  const recipe = useRecipe(slug)
  const { updateRecipe } = useRecipes()
  const { syncRecipe } = useGitHub()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [draft, setDraft] = useState<Recipe | null>(null)
  const [commitMessage, setCommitMessage] = useState('')

  const enterEdit = useCallback(() => {
    if (!recipe) return
    setDraft({ ...recipe })
    setEditing(true)
    setConfirming(false)
    setCommitMessage('')
  }, [recipe])

  const cancelEdit = useCallback(() => {
    setDraft(null)
    setEditing(false)
    setConfirming(false)
    setCommitMessage('')
  }, [])

  const updateDraft = useCallback((updates: Partial<Recipe>) => {
    setDraft((prev) => (prev ? { ...prev, ...updates } : null))
  }, [])

  const beginCommit = useCallback(() => setConfirming(true), [])

  const cancelCommit = useCallback(() => {
    setConfirming(false)
    setCommitMessage('')
  }, [])

  const confirmCommit = useCallback(() => {
    if (!draft || !recipe) return
    const clean: Recipe = {
      ...draft,
      ingredients: draft.ingredients.filter(Boolean),
      steps: draft.steps.filter(Boolean),
      tags: draft.tags.filter(Boolean),
      quote: draft.quote?.trim() || undefined,
      notes: draft.notes?.trim() || undefined,
    }
    const committed = appendCommit(clean, commitMessage.trim())
    const previousTitle = recipe.title
    updateRecipe(previousTitle, committed)
    syncRecipe(committed, commitMessage.trim() || 'Commit changes', previousTitle)
    setDraft(null)
    setEditing(false)
    setConfirming(false)
    setCommitMessage('')
    const newSlug = toSlug(committed.title)
    if (newSlug !== slug) navigate(`/recipe/${newSlug}`, { replace: true })
  }, [draft, recipe, commitMessage, updateRecipe, syncRecipe, slug, navigate])

  const isDirty = useCallback(
    (key: keyof Recipe): boolean => {
      if (!draft || !recipe) return false
      return (
        JSON.stringify(comparableValue(draft, key)) !==
        JSON.stringify(comparableValue(recipe, key))
      )
    },
    [draft, recipe],
  )

  return {
    recipe,
    draft,
    editing,
    confirming,
    commitMessage,
    enterEdit,
    cancelEdit,
    updateDraft,
    beginCommit,
    cancelCommit,
    setCommitMessage,
    confirmCommit,
    isDirty,
  }
}
