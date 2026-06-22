import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Shell } from '../components/layout/Shell'
// import { ParallaxBackground } from '../components/layout/ParallaxBackground'
import { Header } from '../components/layout/Header'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { ImportDialog } from '../components/recipes/ImportDialog'
import { IconButton } from '../components/ui/IconButton'
import { Button } from '../components/ui/Button'
import { useGitHubFiles } from '../hooks/useGitHubFiles'
import { useGitHubStore } from '../store/github'
import shelfConfig from '../shelf.json'
import Logo from '../assets/logo.svg?react'
import PlusIcon from '../assets/icons/plus.svg?react'
import SettingsIcon from '../assets/icons/settings.svg?react'
import BookIcon from '../assets/icons/book.svg?react'
import GitHubIcon from '../assets/icons/github.svg?react'

type SortOrder = 'default' | 'prep-asc' | 'prep-desc'

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

function extractPrepTime(markdown: string): string {
  return (
    markdown.match(/\*\*Prep time:\*\*\s*([^·\n*]+)/i)?.[1]?.trim() ??
    markdown.match(/\*\*PrepTime:\*\*\s*([^·\n*]+)/)?.[1]?.trim() ??
    ''
  )
}

function extractImage(markdown: string): string | null {
  const md = markdown.match(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/)?.[1]
  const html = markdown.match(/<img[^>]+src="(https?:\/\/[^"]+)"/)?.[1]
  return md ?? html ?? null
}

function parsePrepMinutes(prepTime: string): number {
  if (!prepTime) return Infinity
  const hours = prepTime.match(/(\d+)\s*h/i)?.[1]
  const mins = prepTime.match(/(\d+)\s*m/i)?.[1]
  if (!hours && !mins) {
    const num = prepTime.match(/(\d+)/)?.[1]
    return num ? parseInt(num, 10) : Infinity
  }
  return (hours ? parseInt(hours, 10) * 60 : 0) + (mins ? parseInt(mins, 10) : 0)
}

interface CardInfo {
  path: string
  title: string
  origin: string
  tags: string[]
  prepTime: string
  image: string | null
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div style={{ height: '9rem', background: 'var(--bg-surface)' }} />
      <div className="p-4 flex flex-col gap-3">
        <div className="rounded" style={{ height: '1rem', width: '75%', background: 'var(--bg-surface)' }} />
        <div className="rounded" style={{ height: '0.75rem', width: '50%', background: 'var(--bg-surface)' }} />
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
        <p style={{ color: 'var(--text-secondary)', maxWidth: '36ch', textAlign: 'center', fontSize: 'var(--t-body)' }}>
          Every great collection starts with the first recipe. What will yours be?
        </p>
      </div>
      <Button variant="primary" onClick={onAdd}>
        Commit your first recipe
      </Button>
    </div>
  )
}

const SUGGEST_URL = `https://github.com/${shelfConfig.repoOwner}/${shelfConfig.repoName}/issues/new?title=Recipe+suggestion&body=I%27d+like+to+suggest+a+recipe+for+the+cookbook.`

export function Shelf() {
  const { files, loading, error, fetchFile, saveFile, reload } = useGitHubFiles()
  const { token } = useGitHubStore()
  const [cards, setCards] = useState<CardInfo[]>([])
  const [importOpen, setImportOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sort, setSort] = useState<SortOrder>('default')

  const allTags = useMemo(() => {
    const set = new Set<string>()
    cards.forEach((c) => c.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [cards])

  const filteredCards = useMemo(() => {
    let result = cards

    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          c.origin.toLowerCase().includes(q),
      )
    }

    if (selectedTags.length > 0) {
      result = result.filter((c) => selectedTags.some((tag) => c.tags.includes(tag)))
    }

    if (sort === 'prep-asc') {
      result = [...result].sort((a, b) => parsePrepMinutes(a.prepTime) - parsePrepMinutes(b.prepTime))
    } else if (sort === 'prep-desc') {
      result = [...result].sort((a, b) => parsePrepMinutes(b.prepTime) - parsePrepMinutes(a.prepTime))
    }

    return result
  }, [cards, query, selectedTags, sort])

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Initialise cards from filenames, then lazily load real titles
  useEffect(() => {
    setCards(
      files.map((path) => ({
        path,
        title: deSlugTitle(pathToSlug(path)),
        origin: '',
        tags: [],
        prepTime: '',
        image: null,
      })),
    )

    for (const path of files) {
      fetchFile(path)
        .then((md) => {
          const heading = extractHeading(md)
          const origin = extractOrigin(md)
          const tags = extractTags(md)
          const prepTime = extractPrepTime(md)
          const image = extractImage(md)
          if (heading) {
            setCards((prev) =>
              prev.map((c) =>
                c.path === path ? { ...c, title: heading, origin, tags, prepTime, image } : c,
              ),
            )
          }
        })
        .catch(() => {/* leave filename-derived title */ })
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
          <Logo style={{ height: '44px', width: 'auto' }} />
        }
        center={
          <input
            type="search"
            placeholder="Search recipes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px',
              borderRadius: '9999px',
              border: `1px solid ${searchFocused ? 'var(--focus-color)' : 'var(--border-strong)'}`,
              background: 'var(--bg-surface-raised)',
              color: 'var(--text-primary)',
              fontSize: 'var(--t-small)',
              outline: 'none',
              boxShadow: searchFocused ? 'var(--ring)' : 'none',
              transition: 'border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease)',
            }}
          />
        }
        right={
          <div className="flex items-center gap-1">
            {!token && (
              <a
                href={SUGGEST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
              >
                <GitHubIcon style={{ width: '24px', height: '24px', flexShrink: 0 }} />
                Add a recipe
              </a>
            )}
            <Link
              to="/settings"
              aria-label="Settings"
              className="btn btn-ghost btn-icon"
              style={{ textDecoration: 'none' }}
            >
              <SettingsIcon />
            </Link>
            {token && (
              <IconButton label="Add recipe" variant="default" onClick={() => setImportOpen(true)}>
                <PlusIcon />
              </IconButton>
            )}
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-8" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {loading ? (
          <ShelfSkeleton />
        ) : error ? (
          <div className="empty">
            <div className="empty-mark" style={{ background: 'var(--c-clay-tint)', color: 'var(--c-clay-deep)' }}>
              <GitHubIcon />
            </div>
            <h3 className="t-h3">Rate limit reached</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '36ch', textAlign: 'center', fontSize: 'var(--t-body)' }}>
              Connect a GitHub account in Settings to keep browsing your cookbook.
            </p>
            <Link to="/settings" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Go to Settings
            </Link>
          </div>
        ) : cards.length === 0 ? (
          <EmptyState onAdd={() => setImportOpen(true)} />
        ) : (
          <>
            {/* Filter + Sort bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
              {/* Tag chips — horizontally scrollable */}
              <div style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sp-2)',
                overflowX: 'auto',
                background: 'white',
                padding: '8px',
                borderRadius: 'var(--r-xl)',
              }}>
                <button
                  className="chip"
                  onClick={() => setSelectedTags([])}
                  style={{
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    whiteSpace: 'nowrap',
                    background: selectedTags.length === 0 ? 'var(--accent-primary)' : 'var(--neutral-100)',
                    color: selectedTags.length === 0 ? 'var(--white)' : 'var(--accent-primary)',
                    borderColor: selectedTags.length === 0 ? 'var(--green-800)' : 'transparent',
                  }}
                >
                  All
                </button>
                {allTags.map((tag) => {
                  const active = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      className="chip"
                      onClick={() => toggleTag(tag)}
                      style={{
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        whiteSpace: 'nowrap',
                        background: active ? 'var(--accent-primary)' : 'var(--neutral-100)',
                        color: active ? 'var(--white)' : 'var(--neutral-300)',
                        borderColor: active ? 'var(--green-800)' : 'transparent',

                      }}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>

              {/* Sort dropdown */}
              <select
                className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOrder)}
                style={{
                  flexShrink: 0,
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--t-caption)',
                  color: 'var(--text-primary)',
                  background: 'var(--white)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--r-xl)',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  outline: 'none',
                  height: '40px',
                }}
              >
                <option value="default">Default</option>
                <option value="prep-asc">Prep time: low to high</option>
                <option value="prep-desc">Prep time: high to low</option>
              </select>
            </div>

            {/* Grid or filter empty state */}
            {filteredCards.length === 0 ? (
              <div className="empty">
                <div className="empty-mark">
                  <BookIcon />
                </div>
                <h3 className="t-h3">No recipes match your filters.</h3>
                <Button variant="secondary" onClick={() => { setSelectedTags([]); setQuery('') }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="recipe-grid gap-5">
                {filteredCards.map((card) => (
                  <RecipeCard
                    key={card.path}
                    title={card.title}
                    origin={card.origin}
                    tags={card.tags}
                    prepTime={card.prepTime}
                    image={card.image}
                    to={`/recipe/${pathToSlug(card.path)}`}
                  />
                ))}
              </div>
            )}
          </>
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
