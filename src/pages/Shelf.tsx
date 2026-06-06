import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Shell } from '../components/layout/Shell'
import { Header } from '../components/layout/Header'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { ImportDialog } from '../components/recipes/ImportDialog'
import { IconButton } from '../components/ui/IconButton'
import { Button } from '../components/ui/Button'
import { useGitHubFiles } from '../hooks/useGitHubFiles'
import PlusIcon from '../assets/icons/plus.svg?react'
import SettingsIcon from '../assets/icons/settings.svg?react'
import BookIcon from '../assets/icons/book.svg?react'

function pathToSlug(path: string): string {
  return path.replace(/^recipes\//, '').replace(/\.md$/, '')
}

function deSlugTitle(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function extractHeading(markdown: string): string {
  return markdown.match(/^#\s+(.+)/m)?.[1] ?? ''
}

function extractOrigin(markdown: string): string {
  return markdown.match(/\*\*Origin:\*\*\s*([^\n*]+)/)?.[1]?.trim() ?? ''
}

function extractTags(markdown: string): string[] {
  const raw = markdown.match(/\*\*Tags:\*\*\s*([^\n*]+)/)?.[1]?.trim() ?? ''
  return raw ? raw.split(',').map((t) => t.trim()).filter(Boolean) : []
}

function extractImage(markdown: string): string | null {
  const md = markdown.match(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/)?.[1]
  const html = markdown.match(/<img[^>]+src="(https?:\/\/[^"]+)"/)?.[1]
  return md ?? html ?? null
}

interface CardInfo {
  path: string
  title: string
  origin: string
  tags: string[]
  image: string | null
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div style={{ height: '9rem', background: 'var(--c-cream)' }} />
      <div className="p-4 flex flex-col gap-3">
        <div className="rounded" style={{ height: '1rem', width: '75%', background: 'var(--c-cream)' }} />
        <div className="rounded" style={{ height: '0.75rem', width: '50%', background: 'var(--c-cream)' }} />
      </div>
    </div>
  )
}

function ShelfSkeleton() {
  return (
    <div className="recipe-grid gap-5" aria-label="Loading recipes…" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="empty">
      <div className="empty-mark">
        <BookIcon />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="t-h3">Your cookbook is empty.</h2>
        <p style={{ color: 'var(--c-ink-soft)', maxWidth: '36ch', textAlign: 'center', fontSize: 'var(--t-body)' }}>
          Every great collection starts with the first recipe. What will yours be?
        </p>
      </div>
      <Button variant="primary" onClick={onAdd}>
        Commit your first recipe
      </Button>
    </div>
  )
}

export function Shelf() {
  const { files, loading, error, fetchFile, saveFile, reload } = useGitHubFiles()
  const [cards, setCards] = useState<CardInfo[]>([])
  const [importOpen, setImportOpen] = useState(false)

  // Initialise cards from filenames, then lazily load real titles
  useEffect(() => {
    setCards(
      files.map((path) => ({
        path,
        title: deSlugTitle(pathToSlug(path)),
        origin: '',
        tags: [],
        image: null,
      })),
    )

    for (const path of files) {
      fetchFile(path)
        .then((md) => {
          const heading = extractHeading(md)
          const origin = extractOrigin(md)
          const tags = extractTags(md)
          const image = extractImage(md)
          if (heading) {
            setCards((prev) =>
              prev.map((c) =>
                c.path === path ? { ...c, title: heading, origin, tags, image } : c,
              ),
            )
          }
        })
        .catch(() => {/* leave filename-derived title */})
    }
  }, [files]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleImportClose() {
    setImportOpen(false)
    reload()
  }

  return (
    <Shell>
      <Header
        left={
          <span className="t-h3" style={{ letterSpacing: '-0.02em' }}>Commeat</span>
        }
        right={
          <div className="flex items-center gap-1">
            <Link
              to="/settings"
              aria-label="Settings"
              className="btn btn-ghost btn-icon"
              style={{ textDecoration: 'none' }}
            >
              <SettingsIcon />
            </Link>
            <IconButton label="Add recipe" variant="default" onClick={() => setImportOpen(true)}>
              <PlusIcon />
            </IconButton>
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-8" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {loading ? (
          <ShelfSkeleton />
        ) : error ? (
          <div className="empty">
            <p className="t-body" style={{ color: 'var(--c-error)' }}>{error}</p>
          </div>
        ) : cards.length === 0 ? (
          <EmptyState onAdd={() => setImportOpen(true)} />
        ) : (
          <div className="recipe-grid gap-5">
            {cards.map((card) => (
              <RecipeCard
                key={card.path}
                title={card.title}
                origin={card.origin}
                tags={card.tags}
                image={card.image}
                to={`/recipe/${pathToSlug(card.path)}`}
              />
            ))}
          </div>
        )}
      </main>

      <ImportDialog
        open={importOpen}
        onClose={handleImportClose}
        saveFile={saveFile}
      />
    </Shell>
  )
}
