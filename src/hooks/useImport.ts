import { useState, useCallback } from 'react'
import { extractFromUrl, extractFromText, extractFromImage } from '../lib/extractor'
import { useGitHub } from './useGitHub'
import type { Recipe } from '../types'

type Step = 1 | 2 | 3

const today = () => new Date().toISOString().split('T')[0]

const BLANK_RECIPE: Recipe = {
  title: '',
  origin: '',
  importedFrom: '',
  committedAt: today(),
  version: 1,
  forkOf: null,
  tags: [],
  prepTime: '',
  cookTime: '',
  servings: 2,
  ingredients: [],
  steps: [],
  commits: [],
}

function detectType(input: string, file: File | null): 'url' | 'text' | 'image' {
  if (file) return 'image'
  if (/^https?:\/\//i.test(input.trim())) return 'url'
  return 'text'
}

function formatError(err: unknown): string {
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}

export function useImport(addRecipe: (recipe: Recipe) => void, onClose: () => void) {
  const { syncRecipe } = useGitHub()
  const [step, setStep] = useState<Step>(1)
  const [rawInput, setRawInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<Recipe>(BLANK_RECIPE)
  const [commitMessage, setCommitMessage] = useState('')

  const reset = useCallback(() => {
    setStep(1)
    setRawInput('')
    setFile(null)
    setExtracting(false)
    setError(null)
    setDraft(BLANK_RECIPE)
    setCommitMessage('')
  }, [])

  const extract = useCallback(async () => {
    setExtracting(true)
    setError(null)
    try {
      const type = detectType(rawInput, file)
      let partial: Partial<Recipe>
      if (type === 'image' && file) {
        partial = await extractFromImage(file)
      } else if (type === 'url') {
        partial = await extractFromUrl(rawInput.trim())
      } else {
        partial = await extractFromText(rawInput)
      }
      setDraft({ ...BLANK_RECIPE, committedAt: today(), ...partial })
      setStep(2)
    } catch (err) {
      setError(formatError(err))
    } finally {
      setExtracting(false)
    }
  }, [rawInput, file])

  const enterManually = useCallback(() => {
    setError(null)
    setDraft({ ...BLANK_RECIPE, committedAt: today(), importedFrom: 'manual entry' })
    setStep(2)
  }, [])

  const updateDraft = useCallback((updates: Partial<Recipe>) => {
    setDraft((prev) => ({ ...prev, ...updates }))
  }, [])

  const commit = useCallback(() => {
    const message = commitMessage.trim() || 'Exactly as found'
    const finalRecipe: Recipe = {
      ...draft,
      ingredients: draft.ingredients.filter(Boolean),
      steps: draft.steps.filter(Boolean),
      tags: draft.tags.filter(Boolean),
      quote: draft.quote?.trim() || undefined,
      notes: draft.notes?.trim() || undefined,
      committedAt: today(),
      commits: [{ version: 1, date: today(), message }],
    }
    addRecipe(finalRecipe)
    syncRecipe(finalRecipe, message)
    onClose()
    reset()
  }, [draft, commitMessage, addRecipe, syncRecipe, onClose, reset])

  const proceed = useCallback(() => {
    if (step === 2) setStep(3)
  }, [step])

  const back = useCallback(() => {
    if (step === 2) { setStep(1); setError(null) }
    if (step === 3) setStep(2)
  }, [step])

  return {
    step,
    rawInput, setRawInput,
    file, setFile,
    extracting,
    error,
    draft, updateDraft,
    commitMessage, setCommitMessage,
    extract,
    enterManually,
    proceed,
    commit,
    back,
    reset,
  }
}
