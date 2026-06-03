import { Shell } from '../components/layout/Shell'
import { Header } from '../components/layout/Header'
import { RecipeCard } from '../components/recipes/RecipeCard'
import { IconButton } from '../components/ui/IconButton'
import { Button } from '../components/ui/Button'
import { useRecipes } from '../hooks/useRecipes'
import type { Recipe } from '../types'

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function EmptyState() {
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

      <Button
        variant="primary"
        onClick={() => console.log('open import dialog')}
      >
        Commit your first recipe
      </Button>
    </div>
  )
}

function handleCardSelect(recipe: Recipe) {
  console.log(recipe.title)
}

export function Shelf() {
  const { recipes } = useRecipes()

  return (
    <Shell>
      <Header
        left={
          <span className="font-display text-xl font-semibold text-content-primary tracking-tight">
            Commeat
          </span>
        }
        right={
          <IconButton
            label="Add recipe"
            variant="default"
            onClick={() => console.log('open import dialog')}
          >
            <PlusIcon />
          </IconButton>
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {recipes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="recipe-grid gap-5">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.title}
                recipe={recipe}
                onSelect={handleCardSelect}
              />
            ))}
          </div>
        )}
      </main>
    </Shell>
  )
}
