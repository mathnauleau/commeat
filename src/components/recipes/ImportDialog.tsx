import { useRef } from 'react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { RecipeEditor } from './RecipeEditor'
import { useImport } from '../../hooks/useImport'
import type { Recipe } from '../../types'

interface ImportDialogProps {
  open: boolean
  onClose: () => void
  addRecipe: (recipe: Recipe) => void
}

function ExtractionSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4 py-2" aria-label="Extracting recipe…">
      <div className="h-5 bg-surface-sunken rounded-md w-2/3" />
      <div className="h-4 bg-surface-sunken rounded-md w-1/2" />
      <div className="h-4 bg-surface-sunken rounded-md w-3/4" />
      <div className="h-4 bg-surface-sunken rounded-md w-full" />
      <div className="h-4 bg-surface-sunken rounded-md w-4/5" />
      <div className="h-4 bg-surface-sunken rounded-md w-2/3" />
      <div className="h-4 bg-surface-sunken rounded-md w-full" />
      <div className="h-4 bg-surface-sunken rounded-md w-3/5" />
    </div>
  )
}

const STEP_TITLES = { 1: 'Import a recipe', 2: 'Review recipe', 3: 'Commit recipe' } as const

export function ImportDialog({ open, onClose, addRecipe }: ImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const {
    step, rawInput, setRawInput, file, setFile,
    extracting, error, draft, updateDraft,
    commitMessage, setCommitMessage,
    extract, enterManually, proceed, commit, back, reset,
  } = useImport(addRecipe, () => { onClose(); reset() })

  function handleClose() { onClose(); reset() }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={STEP_TITLES[step]}
      size={step === 2 ? 'lg' : 'md'}
    >
      {/* ── Step 1 — Input ────────────────────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          {extracting ? (
            <ExtractionSkeleton />
          ) : (
            <>
              <Textarea
                label="Recipe URL or text"
                placeholder={'Paste a URL, copy-paste a recipe, or type it out…\n\ne.g. https://www.seriouseats.com/best-pasta-carbonara-recipe'}
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                rows={6}
                autoFocus
              />

              <div className="flex items-center gap-2">
                <span className="text-xs text-content-muted font-body">or</span>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-xs font-body text-accent hover:underline focus:outline-none"
                >
                  upload a photo
                </button>
                {file && (
                  <span className="text-xs text-content-muted font-body truncate max-w-48">
                    {file.name}
                  </span>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null
                    setFile(f)
                    if (f) setRawInput('')
                  }}
                />
              </div>

              {error && (
                <div className="rounded-lg border px-4 py-3 flex flex-col gap-2 bg-error/10 border-error/30">
                  <p className="text-sm font-body text-error">{error}</p>
                  <button
                    type="button"
                    onClick={enterManually}
                    className="text-xs font-body text-content-secondary hover:text-content-primary text-left focus:outline-none"
                  >
                    Enter the recipe manually instead →
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={extract}
                  disabled={!rawInput.trim() && !file}
                >
                  Extract recipe
                </Button>
                <Button variant="ghost" size="sm" onClick={enterManually}>
                  Enter manually
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Step 2 — Review ───────────────────────────────────────── */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <RecipeEditor
            draft={draft}
            onUpdate={updateDraft}
            isDirty={() => false}
          />
          <div className="flex gap-3 pt-2 border-t border-border">
            <Button variant="primary" onClick={proceed}>
              Looks good →
            </Button>
            <Button variant="ghost" size="sm" onClick={back}>
              ← Back
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3 — Commit ───────────────────────────────────────── */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div className="bg-surface-sunken rounded-lg p-4 flex flex-col gap-1">
            <p className="font-display text-lg font-medium text-content-primary leading-snug">
              {draft.title || 'Untitled recipe'}
            </p>
            <p className="text-sm font-body text-content-muted">{draft.origin}</p>
          </div>

          <Input
            label="Commit message (optional)"
            placeholder="Exactly as found"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit() }}
            autoFocus
          />

          <div className="flex gap-3">
            <Button variant="primary" onClick={commit}>
              Commit recipe
            </Button>
            <Button variant="ghost" size="sm" onClick={back}>
              ← Back
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
