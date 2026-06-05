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
    <div className="flex flex-col gap-4 py-2" aria-label="Extracting recipe…" aria-busy="true">
      {[0.67, 0.5, 0.75, 1, 0.8, 0.67, 1, 0.6].map((w, i) => (
        <div
          key={i}
          className="animate-pulse rounded-md"
          style={{
            height: i === 0 ? '20px' : '16px',
            width: `${w * 100}%`,
            background: 'var(--c-cream)',
          }}
        />
      ))}
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
                <span className="t-caption">or</span>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="t-caption"
                  style={{ color: 'var(--c-forest)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  upload a photo
                </button>
                {file && (
                  <span className="t-caption" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '12rem' }}>
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
                <div
                  className="rounded-lg px-4 py-3 flex flex-col gap-2"
                  style={{
                    background: 'rgba(160,82,45,0.08)',
                    border: '1px solid rgba(160,82,45,0.25)',
                    borderRadius: 'var(--r-md)',
                  }}
                >
                  <p className="t-small" style={{ color: 'var(--c-error)' }}>{error}</p>
                  <button
                    type="button"
                    onClick={enterManually}
                    className="t-caption"
                    style={{ color: 'var(--c-ink-soft)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                  >
                    Enter the recipe manually instead →
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="primary" onClick={extract} disabled={!rawInput.trim() && !file}>
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
          <RecipeEditor draft={draft} onUpdate={updateDraft} isDirty={() => false} />
          <div
            className="flex gap-3 pt-2"
            style={{ borderTop: '1px solid var(--c-line)' }}
          >
            <Button variant="primary" onClick={proceed}>Looks good →</Button>
            <Button variant="ghost" size="sm" onClick={back}>← Back</Button>
          </div>
        </div>
      )}

      {/* ── Step 3 — Commit ───────────────────────────────────────── */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div
            className="p-4 flex flex-col gap-1"
            style={{ background: 'var(--c-cream)', borderRadius: 'var(--r-md)' }}
          >
            <p className="t-h3" style={{ fontSize: 'var(--t-lead)', lineHeight: 'var(--lh-h3)' }}>
              {draft.title || 'Untitled recipe'}
            </p>
            <p className="t-caption">{draft.origin}</p>
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
            <Button variant="primary" onClick={commit}>Commit recipe</Button>
            <Button variant="ghost" size="sm" onClick={back}>← Back</Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
