import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shell } from '../components/layout/Shell'
import { Header } from '../components/layout/Header'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { ImportDialog } from '../components/recipes/ImportDialog'
import { IconButton } from '../components/ui/IconButton'
import { Button } from '../components/ui/Button'
import { useRecipes } from '../hooks/useRecipes'
import { useGitHub } from '../hooks/useGitHub'
import { toSlug } from '../lib/slug'
import PlusIcon from '../assets/icons/plus.svg?react'
import SettingsIcon from '../assets/icons/settings.svg?react'
import BookIcon from '../assets/icons/book.svg?react'

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
  const { recipes, addRecipe } = useRecipes()
  const { hydrating } = useGitHub()
  const [importOpen, setImportOpen] = useState(false)

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
        {hydrating ? (
          <ShelfSkeleton />
        ) : recipes.length === 0 ? (
          <EmptyState onAdd={() => setImportOpen(true)} />
        ) : (
          <div className="recipe-grid gap-5">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.title}
                recipe={recipe}
                to={`/recipe/${toSlug(recipe.title)}`}
              />
            ))}
          </div>
        )}
      </main>

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        addRecipe={addRecipe}
      />
    </Shell>
  )
}
