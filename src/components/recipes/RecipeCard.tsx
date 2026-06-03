import { Link } from 'react-router-dom'
import { Tag } from '../ui/Tag'
import type { Recipe } from '../../types'

interface RecipeCardProps {
  recipe: Recipe
  to: string
}

export function RecipeCard({ recipe, to }: RecipeCardProps) {
  return (
    <Link
      to={to}
      className="block bg-surface-raised border border-border rounded-lg overflow-hidden transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {/* Illustration placeholder */}
      <div className="h-36 bg-accent-soft flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path
            d="M20 6 C14 6 8 8 8 12 L8 32 C8 34 10 35 12 35 L20 35 L28 35 C30 35 32 34 32 32 L32 12 C32 8 26 6 20 6 Z"
            fill="var(--color-surface-sunken)"
            stroke="var(--color-border-strong)"
            strokeWidth="1"
          />
          <line x1="20" y1="6" x2="20" y2="35" stroke="var(--color-border-strong)" strokeWidth="1" />
          <line x1="11" y1="17" x2="18" y2="17" stroke="var(--color-content-muted)" strokeWidth="1" strokeLinecap="round" />
          <line x1="11" y1="21" x2="18" y2="21" stroke="var(--color-content-muted)" strokeWidth="1" strokeLinecap="round" />
          <line x1="11" y1="25" x2="16" y2="25" stroke="var(--color-content-muted)" strokeWidth="1" strokeLinecap="round" />
          <line x1="22" y1="17" x2="29" y2="17" stroke="var(--color-content-muted)" strokeWidth="1" strokeLinecap="round" />
          <line x1="22" y1="21" x2="29" y2="21" stroke="var(--color-content-muted)" strokeWidth="1" strokeLinecap="round" />
          <line x1="22" y1="25" x2="27" y2="25" stroke="var(--color-content-muted)" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-display text-base font-medium text-content-primary leading-snug line-clamp-2">
          {recipe.title}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <Tag className="text-xs py-0.5 px-2">{recipe.origin}</Tag>
          <span className="text-xs text-content-muted font-body shrink-0">{recipe.prepTime}</span>
        </div>
      </div>
    </Link>
  )
}
