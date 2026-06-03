import { Tag } from '../ui/Tag'
import { Badge } from '../ui/Badge'
import { CommitHistory } from './CommitHistory'
import type { Recipe } from '../../types'

interface RecipeViewProps {
  recipe: Recipe
}

export function RecipeView({ recipe }: RecipeViewProps) {
  return (
    <div className="flex flex-col gap-8">

      <section className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-semibold text-content-primary leading-tight">
          {recipe.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Tag>{recipe.origin}</Tag>
          {recipe.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Prep {recipe.prepTime}</Badge>
          <Badge>Cook {recipe.cookTime}</Badge>
          <Badge>{recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}</Badge>
          <Badge>v{recipe.version}</Badge>
        </div>
      </section>

      {recipe.quote && (
        <blockquote className="border-l-4 border-accent pl-5 py-1">
          <p className="font-display text-xl italic text-content-secondary leading-relaxed">
            "{recipe.quote}"
          </p>
        </blockquote>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-medium text-content-primary">Ingredients</h2>
        <ul className="flex flex-col gap-2">
          {recipe.ingredients.map((ingredient, i) => (
            <li key={i} className="flex items-start gap-3 text-sm font-body text-content-primary leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
              {ingredient}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-medium text-content-primary">Steps</h2>
        <ol className="flex flex-col gap-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="font-display text-lg font-medium text-content-muted shrink-0 w-6 text-right leading-relaxed">
                {i + 1}
              </span>
              <p className="text-sm font-body text-content-primary leading-loose">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {recipe.notes && (
        <section className="flex flex-col gap-3 bg-surface-sunken rounded-lg p-5">
          <h2 className="font-display text-base font-medium text-content-primary">Notes</h2>
          <p className="text-sm font-body text-content-secondary leading-relaxed">{recipe.notes}</p>
        </section>
      )}

      <CommitHistory commits={recipe.commits} />

    </div>
  )
}
