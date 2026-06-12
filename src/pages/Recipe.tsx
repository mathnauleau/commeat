import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { marked } from 'marked'
import { Shell } from '../components/layout/Shell'
import { Header } from '../components/layout/Header'
import { CommitBar } from '../components/recipes/CommitBar'
import { IconButton } from '../components/ui/IconButton'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Textarea'
import { Dialog } from '../components/ui/Dialog'
import { useGitHubFiles } from '../hooks/useGitHubFiles'
import { useGitHubStore } from '../store/github'
import shelfConfig from '../shelf.json'
import BackIcon from '../assets/icons/back.svg?react'
import EditIcon from '../assets/icons/edit.svg?react'
import TrashIcon from '../assets/icons/trash.svg?react'
import GitHubIcon from '../assets/icons/github.svg?react'

const backLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: 'var(--t-small)',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  minHeight: '44px',
  padding: '0 4px',
  transition: 'color var(--t-fast) var(--ease)',
}

function recipeSlugFromMarkdown(markdown: string): string {
  const title = markdown.match(/^#\s+(.+)/m)?.[1] ?? 'untitled'
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function extractFirstImage(html: string): { imageHtml: string; restHtml: string } | null {
  const wrappedMatch = html.match(/<p>\s*(<img\b[^>]*\/?>)\s*<\/p>/i)
  if (wrappedMatch) {
    return { imageHtml: wrappedMatch[1], restHtml: html.replace(wrappedMatch[0], '').trim() }
  }
  const bareMatch = html.match(/<img\b[^>]*\/?>/)
  if (bareMatch) {
    return { imageHtml: bareMatch[0], restHtml: html.replace(bareMatch[0], '').trim() }
  }
  return null
}

export function Recipe() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { fetchFile, saveFile, deleteFile, resolveImages } = useGitHubFiles()
  const { token } = useGitHubStore()

  const originalPath = `recipes/${slug}.md`

  const [markdown, setMarkdown] = useState('')
  const [renderedMarkdown, setRenderedMarkdown] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
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
          setLoadError(err instanceof Error ? err.message : 'Failed to load recipe')
          setFetching(false)
        }
      })
    return () => { cancelled = true }
  }, [originalPath]) // eslint-disable-line react-hooks/exhaustive-deps

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

  if (fetching) {
    return (
      <Shell>
        <Header left={<Link to="/" style={backLinkStyle}><BackIcon />Shelf</Link>} />
        <main className="max-w-2xl mx-auto px-4 py-24 flex items-center justify-center">
          <p className="t-body" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        </main>
      </Shell>
    )
  }

  if (loadError) {
    return (
      <Shell>
        <Header left={<Link to="/" style={backLinkStyle}><BackIcon />Shelf</Link>} />
        <main className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-center gap-5 text-center">
          <h1 className="t-h2">Recipe not found.</h1>
          <p className="t-lead" style={{ fontSize: 'var(--t-body)' }}>
            {loadError}
          </p>
          <Button variant="secondary" onClick={() => window.history.back()}>Back to shelf</Button>
        </main>
      </Shell>
    )
  }

  return (
    <Shell>
      <Header
        left={<Link to="/" style={backLinkStyle}><BackIcon />Shelf</Link>}
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
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                >
                  <GitHubIcon style={{ width: '24px', height: '24px', flexShrink: 0 }} />
                  Suggest a change
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

      <main className="mx-auto px-6 py-8">
        {saving && (
          <p className="t-caption" style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Saving…</p>
        )}
        {editing ? (
          <div className="max-w-2xl mx-auto">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={Math.max(20, draft.split('\n').length + 4)}
              style={{ fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.6 }}
            />
          </div>
        ) : (() => {
          const fullHtml = marked.parse(renderedMarkdown) as string
          const split = extractFirstImage(fullHtml)
          if (!split) {
            return <div className="max-w-2xl mx-auto prose" dangerouslySetInnerHTML={{ __html: fullHtml }} />
          }
          return (
            <div className="max-w-5xl mx-auto md:flex md:gap-10 md:h-[calc(100dvh-7rem)] md:items-start">
              <div
                className="md:w-2/5 md:shrink-0 mb-6 md:mb-0 overflow-hidden [&_img]:block [&_img]:w-full [&_img]:h-auto [&_img]:m-0"
                style={{ borderRadius: 'var(--r-md)' }}
                dangerouslySetInnerHTML={{ __html: split.imageHtml }}
              />
              <div className="prose md:flex-1 md:overflow-y-auto md:h-full md:pr-2" dangerouslySetInnerHTML={{ __html: split.restHtml }} />
            </div>
          )
        })()}
      </main>
    </Shell>
  )
}
