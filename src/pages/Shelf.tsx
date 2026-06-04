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

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9 1.5v1.25M9 15.25V16.5M1.5 9h1.25M15.25 9H16.5M3.4 3.4l.88.88M13.72 13.72l.88.88M14.6 3.4l-.88.88M4.28 13.72l-.88.88"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
      />
    </svg>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-surface-raised border border-border rounded-lg overflow-hidden animate-pulse">
      <div className="h-36 bg-surface-sunken" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-surface-sunken rounded w-3/4" />
        <div className="h-3 bg-surface-sunken rounded w-1/2" />
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
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div className="w-20 h-20 rounded-full bg-accent-soft flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path
            d="M20 6 C14 6 8 8 8 12 L8 32 C8 34 10 35 12 35 L20 35 L28 35 C30 35 32 34 32 32 L32 12 C32 8 26 6 20 6 Z"
            fill="var(--color-surface-sunken)"
            stroke="var(--color-border-strong)"
            strokeWidth="1.5"
          />
          <line x1="20" y1="6" x2="20" y2="35" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          <line x1="11" y1="16" x2="18" y2="16" stroke="var(--color-content-muted)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="11" y1="21" x2="18" y2="21" stroke="var(--color-content-muted)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="11" y1="26" x2="16" y2="26" stroke="var(--color-content-muted)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="22" y1="16" x2="29" y2="16" stroke="var(--color-content-muted)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="22" y1="21" x2="29" y2="21" stroke="var(--color-content-muted)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="22" y1="26" x2="27" y2="26" stroke="var(--color-content-muted)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-medium text-content-primary">
          Your cookbook is empty.
        </h2>
        <p className="text-content-muted font-body text-base max-w-xs">
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
          <span className="font-display text-xl font-semibold text-content-primary tracking-tight">
            Commeat
          </span>
        }
        right={
          <div className="flex items-center gap-1">
            <Link
              to="/settings"
              aria-label="Settings"
              className="inline-flex items-center justify-center w-11 h-11 rounded-lg transition-colors text-content-secondary hover:bg-surface-sunken hover:text-content-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <SettingsIcon />
            </Link>
            <IconButton
              label="Add recipe"
              variant="default"
              onClick={() => setImportOpen(true)}
            >
              <PlusIcon />
            </IconButton>
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
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
