import { useState, useEffect, useMemo } from 'react'
import { Shell } from '../components/layout/Shell'
// import { ParallaxBackground } from '../components/layout/ParallaxBackground'
import { Header } from '../components/layout/Header'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { ImportDialog } from '../components/recipes/ImportDialog'
import { ReadProblemNotice } from '../components/recipes/ReadProblemNotice'
import { ShelfActions } from '../components/layout/ShelfActions'
import { Button } from '../components/ui/Button'
import { useGitHubFiles } from '../hooks/useGitHubFiles'
import { useGitHubStore } from '../store/github'
import { useRecipesStore } from '../store/recipes'
import { extractHeading, extractImage, extractOrigin, extractPrepTime, extractTags } from '../lib/recipeLayout'
import Logo from '../assets/logo.svg?react'
import SearchIcon from '../assets/icons/search.svg?react'
import BookIcon from '../assets/icons/book.svg?react'

type SortOrder = 'default' | 'prep-asc' | 'prep-desc'

function pathToSlug(path: string): string {
  return path.replace(/^recipes\//, '').replace(/\.md$/, '')
}

function deSlugTitle(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
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

function toCard(path: string, markdown?: string): CardInfo {
  const fallbackTitle = deSlugTitle(pathToSlug(path))
  const heading = markdown ? extractHeading(markdown) : ''
  if (!markdown || !heading) return { path, title: fallbackTitle, origin: '', tags: [], prepTime: '', image: null }
  return {
    path,
    title: heading,
    origin: extractOrigin(markdown),
    tags: extractTags(markdown),
    prepTime: extractPrepTime(markdown),
    image: extractImage(markdown),
  }
}

function SkeletonCard() {
  return (
    <div className="card card-recipe animate-pulse">
      <div className="card-media" style={{ background: 'var(--bg-surface)' }} />
      <div className="px-2 flex flex-col gap-3">
        <div className="rounded" style={{ height: '1rem', width: '75%', background: 'var(--bg-surface)' }} />
        <div className="rounded" style={{ height: '0.75rem', width: '50%', background: 'var(--bg-surface)' }} />
      </div>
    </div>
  )
}

function ShelfSkeleton() {
  return (
    <div className="recipe-grid gap-5 sm:gap-8" aria-label="Loading recipes…" aria-busy="true">
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

export function Shelf() {
  const { files, loading, error, fetchFile, saveFile, reload } = useGitHubFiles()
  const { token } = useGitHubStore()
  const cachedRecipes = useRecipesStore((s) => s.markdown)
  const [importOpen, setImportOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sort, setSort] = useState<SortOrder>('default')

  const cards = useMemo(
    () => files.map((path) => toCard(path, cachedRecipes[path]?.text)),
    [files, cachedRecipes],
  )

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

    if (selectedTag) {
      result = result.filter((c) => c.tags.includes(selectedTag))
    }

    if (sort === 'prep-asc') {
      result = [...result].sort((a, b) => parsePrepMinutes(a.prepTime) - parsePrepMinutes(b.prepTime))
    } else if (sort === 'prep-desc') {
      result = [...result].sort((a, b) => parsePrepMinutes(b.prepTime) - parsePrepMinutes(a.prepTime))
    }

    return result
  }, [cards, query, selectedTag, sort])

  // Cards start from filenames; fetchFile fills the cache and the real titles follow
  useEffect(() => {
    for (const path of files) {
      fetchFile(path).catch(() => {/* leave filename-derived title */ })
    }
  }, [files, fetchFile])

  function handleImportClose() {
    setImportOpen(false)
    reload()
  }

  return (
    <Shell>
      <Header
        left={<Logo className="logo h-8.5 sm:h-10 w-auto" />}
        center={
          <label className="search-field">
            <SearchIcon width={18} height={18} aria-hidden />
            <input
              type="search"
              placeholder="Search recipes"
              aria-label="Search recipes"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        }
        right={<ShelfActions signedIn={Boolean(token)} onAdd={() => setImportOpen(true)} />}
      />

      <main className="max-w-6xl mx-auto px-5 sm:px-10 pt-5 pb-12">
        {loading ? (
          <ShelfSkeleton />
        ) : error && cards.length === 0 ? (
          <ReadProblemNotice problem={error} signedIn={Boolean(token)} onRetry={reload} />
        ) : cards.length === 0 ? (
          <EmptyState onAdd={() => setImportOpen(true)} />
        ) : (
          <>
            {/* Filter + Sort bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
              {/* One tag at a time: native radios give arrow-key movement for free */}
              <div className="filterbar" role="radiogroup" aria-label="Filter by tag">
                {[null, ...allTags].map((tag) => (
                  <label key={tag ?? 'all'} className="filter-chip">
                    <input
                      type="radio"
                      name="tag-filter"
                      className="sr-only"
                      checked={selectedTag === tag}
                      onChange={() => setSelectedTag(tag)}
                    />
                    {tag ?? 'All'}
                  </label>
                ))}
              </div>

              <select
                className="sort-select"
                aria-label="Sort recipes"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOrder)}
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
                <Button variant="secondary" onClick={() => { setSelectedTag(null); setQuery('') }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="recipe-grid gap-5 sm:gap-8">
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
