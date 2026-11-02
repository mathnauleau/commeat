import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Shell } from '../components/layout/Shell'
import { Header } from '../components/layout/Header'
import { CommitBar } from '../components/recipes/CommitBar'
import { ReadProblemNotice } from '../components/recipes/ReadProblemNotice'
import { RecipeView } from '../components/recipes/RecipeView'
import { IconButton } from '../components/ui/IconButton'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Textarea'
import { Dialog } from '../components/ui/Dialog'
import { useGitHubFiles } from '../hooks/useGitHubFiles'
import { useGitHubStore } from '../store/github'
import { toReadProblem, type ReadProblem } from '../lib/github'
import shelfConfig from '../shelf.json'
import BackIcon from '../assets/icons/back.svg?react'
import EditIcon from '../assets/icons/edit.svg?react'
import TrashIcon from '../assets/icons/trash.svg?react'

function recipeSlugFromMarkdown(markdown: string): string {
  const title = markdown.match(/^#\s+(.+)/m)?.[1] ?? 'untitled'
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function Recipe() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { fetchFile, saveFile, deleteFile, resolveImages } = useGitHubFiles()
  const { token } = useGitHubStore()

  const originalPath = `recipes/${slug}.md`
  const repoUrl = `https://github.com/mathnauleau/commeat-recipes/tree/main/${originalPath}`
  const fileName = `${slug}.md`

  const [markdown, setMarkdown] = useState('')
  const [renderedMarkdown, setRenderedMarkdown] = useState('')
  const [loadError, setLoadError] = useState<ReadProblem | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [fetching, setFetching] = useState(true)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    let cancelled = false
    setFetching(true)
    setLoadError(null)
    fetchFile(originalPath)
      .then(async (md) => {
        if (cancelled) return
        setMarkdown(md)
        const resolved = await resolveImages(md, originalPath)
        if (!cancelled) { setRenderedMarkdown(resolved); setFetching(false) }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(toReadProblem(err))
          setFetching(false)
        }
      })
    return () => { cancelled = true }
  }, [originalPath, attempt]) // eslint-disable-line react-hooks/exhaustive-deps

  const enterEdit = useCallback(() => {
    setDraft(markdown)
    setEditing(true)
    setConfirming(false)
    setCommitMessage('')
  }, [markdown])

  const cancelEdit = useCallback(() => {
    setDraft('')
    setEditing(false)
    setConfirming(false)
    setCommitMessage('')
  }, [])

  const confirmCommit = useCallback(async () => {
    const message = commitMessage.trim() || 'Commit changes'
    const newSlug = recipeSlugFromMarkdown(draft)
    const newPath = `recipes/${newSlug}.md`
    setSaving(true)
    try {
      await saveFile(newPath, draft, message)
      if (newPath !== originalPath) {
        await deleteFile(originalPath, `Rename recipe to ${newSlug}`)
        navigate(`/recipe/${newSlug}`, { replace: true })
      } else {
        setMarkdown(draft)
      }
      setEditing(false)
      setConfirming(false)
      setCommitMessage('')
      setDraft('')
    } catch {
      // error surfaced globally via useGitHubFiles → setSyncError
    } finally {
      setSaving(false)
    }
  }, [draft, commitMessage, originalPath, saveFile, deleteFile, navigate])

  const confirmDelete = useCallback(async () => {
    try {
      await deleteFile(originalPath, `Delete recipe`)
      navigate('/', { replace: true })
    } catch {
      // error surfaced globally
    }
  }, [originalPath, deleteFile, navigate])

  const crumbs = (
    <>
      <Link to="/" className="btn btn-secondary min-h-11 shrink-0 no-underline">
        <BackIcon width={18} height={18} />
        Recipes
      </Link>
      {/* The file behind the page: quietly nerdy, and the first thing to go on a phone */}
      <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="t-caption no-underline truncate hidden sm:inline">
        {fileName}
      </a>
    </>
  )

  if (fetching) {
    return (
      <Shell>
        <Header left={crumbs} />
        <main className="max-w-2xl mx-auto px-5 py-24 flex items-center justify-center">
          <p className="t-body" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        </main>
      </Shell>
    )
  }

  if (loadError) {
    return (
      <Shell>
        <Header left={crumbs} />
        <main className="max-w-2xl mx-auto px-5 py-12">
          <ReadProblemNotice problem={loadError} signedIn={Boolean(token)} onRetry={() => setAttempt((n) => n + 1)} />
        </main>
      </Shell>
    )
  }

  return (
    <Shell>
      <Header
        left={crumbs}
        right={
          editing ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={() => setConfirming(true)}>
                Commit changes
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {!token && (
                <a
                  href={`https://github.com/${shelfConfig.repoOwner}/${shelfConfig.repoName}/issues/new?title=Suggestion+for+${encodeURIComponent(slug.replace(/-/g, ' '))}&body=I%27d+like+to+suggest+a+change+to+this+recipe.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary min-h-11 no-underline"
                >
                  <span className="hidden sm:inline">Suggest a change</span>
                  <span className="sm:hidden">Suggest</span>
                </a>
              )}
              {token && (
                <>
                  <IconButton label="Delete recipe" variant="destructive" onClick={() => setConfirmingDelete(true)}>
                    <TrashIcon />
                  </IconButton>
                  <IconButton label="Edit recipe" variant="default" onClick={enterEdit}>
                    <EditIcon />
                  </IconButton>
                </>
              )}
            </div>
          )
        }
      />

      {confirming && (
        <CommitBar
          message={commitMessage}
          onChange={setCommitMessage}
          onConfirm={confirmCommit}
          onCancel={() => { setConfirming(false); setCommitMessage('') }}
        />
      )}

      <Dialog open={confirmingDelete} onClose={() => setConfirmingDelete(false)} title="Delete recipe">
        <p className="t-body" style={{ marginBottom: '1.5rem' }}>
          This recipe will be permanently removed from your cookbook. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>Keep it</Button>
          <Button variant="primary" size="sm" onClick={confirmDelete}>Delete recipe</Button>
        </div>
      </Dialog>

      <main className="max-w-6xl mx-auto px-5 sm:px-10 pb-14">
        {saving && (
          <p className="t-caption" style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Saving…</p>
        )}
        {editing ? (
          <div className="max-w-3xl mx-auto pt-5">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={Math.max(20, draft.split('\n').length + 4)}
              style={{ fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.6 }}
            />
          </div>
        ) : (
          <RecipeView markdown={renderedMarkdown} slug={slug} />
        )}
      </main>
    </Shell>
  )
}
