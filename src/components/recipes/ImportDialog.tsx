import { useState, useRef, useCallback } from 'react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { extractFromUrl, extractFromText, extractFromImage } from '../../lib/extractor'

interface ImportDialogProps {
  open: boolean
  onClose: () => void
  saveFile: (path: string, content: string, message: string) => Promise<void>
}

type Step = 1 | 2 | 3

const STEP_TITLES: Record<Step, string> = {
  1: 'Import a recipe',
  2: 'Review recipe',
  3: 'Commit recipe',
}

function recipeSlugFromMarkdown(markdown: string): string {
  const title = markdown.match(/^#\s+(.+)/m)?.[1] ?? 'untitled'
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function extractTitle(markdown: string): string {
  return markdown.match(/^#\s+(.+)/m)?.[1] ?? 'Untitled recipe'
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
            background: 'var(--bg-surface)',
          }}
        />
      ))}
    </div>
  )
}

export function ImportDialog({ open, onClose, saveFile }: ImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>(1)
  const [rawInput, setRawInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [markdown, setMarkdown] = useState('')
  const [commitMessage, setCommitMessage] = useState('')
  const [committing, setCommitting] = useState(false)

  const reset = useCallback(() => {
    setStep(1)
    setRawInput('')
    setFile(null)
    setExtracting(false)
    setError(null)
    setMarkdown('')
    setCommitMessage('')
    setCommitting(false)
  }, [])

  function handleClose() { onClose(); reset() }

  const extract = useCallback(async () => {
    setExtracting(true)
    setError(null)
    try {
      let md: string
      if (file) {
        md = await extractFromImage(file)
      } else if (/^https?:\/\//i.test(rawInput.trim())) {
        md = await extractFromUrl(rawInput.trim())
      } else {
        md = await extractFromText(rawInput)
      }
      setMarkdown(md)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setExtracting(false)
    }
  }, [rawInput, file])

  const enterManually = useCallback(() => {
    setError(null)
    setMarkdown('# \n\n**Origin:** \n**Prep time:** · **Cook time:** · **Serves:** \n\n## Ingredients\n- \n\n## Steps\n1. \n\n## Notes\n')
    setStep(2)
  }, [])

  const commit = useCallback(async () => {
    const message = commitMessage.trim() || 'Exactly as found'
    const slug = recipeSlugFromMarkdown(markdown)
    const path = `recipes/${slug}.md`
    setCommitting(true)
    setError(null)
    try {
      await saveFile(path, markdown, message)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save recipe. Check your GitHub connection.')
    } finally {
      setCommitting(false)
    }
  }, [markdown, commitMessage, saveFile]) // eslint-disable-line react-hooks/exhaustive-deps

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
                  style={{ color: 'var(--text-link)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
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
                  className="px-4 py-3 flex flex-col gap-2"
                  style={{
                    background: 'var(--feedback-error-bg-subtle)',
                    border: '1px solid var(--feedback-error-border-subtle)',
                    borderRadius: 'var(--r-md)',
                  }}
                >
                  <p className="t-small" style={{ color: 'var(--feedback-error-text)' }}>{error}</p>
                  <button
                    type="button"
                    onClick={enterManually}
                    className="t-caption"
                    style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
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
          <Textarea
            label="Review and edit the recipe Markdown"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={Math.max(16, markdown.split('\n').length + 2)}
            style={{ fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.6 }}
          />
          <div
            className="flex gap-3 pt-2"
            style={{ borderTop: '1px solid var(--border-default)' }}
          >
            <Button variant="primary" onClick={() => setStep(3)}>Looks good →</Button>
            <Button variant="ghost" size="sm" onClick={() => { setStep(1); setError(null) }}>← Back</Button>
          </div>
        </div>
      )}

      {/* ── Step 3 — Commit ───────────────────────────────────────── */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div
            className="p-4 flex flex-col gap-1"
            style={{ background: 'var(--bg-surface)', borderRadius: 'var(--r-md)' }}
          >
            <p className="t-h3" style={{ fontSize: 'var(--t-lead)', lineHeight: 'var(--lh-h3)' }}>
              {extractTitle(markdown)}
            </p>
          </div>

          <Input
            label="Commit message (optional)"
            placeholder="Exactly as found"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit() }}
            autoFocus
          />

          {error && (
            <p className="t-small" style={{ color: 'var(--feedback-error-text)' }}>{error}</p>
          )}

          <div className="flex gap-3">
            <Button variant="primary" onClick={commit} disabled={committing}>
              {committing ? 'Committing…' : 'Commit recipe'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>← Back</Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
