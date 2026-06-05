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
        <h1 className="t-h1">{recipe.title}</h1>
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
          <span className="hash">v{recipe.version}</span>
        </div>
      </section>

      {recipe.quote && (
        <blockquote style={{ borderLeft: '4px solid var(--c-forest)', paddingLeft: 'var(--sp-5)', paddingTop: 'var(--sp-2)', paddingBottom: 'var(--sp-2)', margin: 0 }}>
          <p className="t-serif-italic t-lead">"{recipe.quote}"</p>
        </blockquote>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="t-h3">Ingredients</h2>
        <ul className="flex flex-col gap-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {recipe.ingredients.map((ingredient, i) => (
            <li key={i} className="flex items-start gap-3" style={{ fontSize: 'var(--t-body)', lineHeight: 'var(--lh-body)' }}>
              <span
                style={{ marginTop: '0.55em', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--c-forest)', flexShrink: 0 }}
                aria-hidden="true"
              />
              {ingredient}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="t-h3">Steps</h2>
        <ol className="flex flex-col gap-5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <span
                className="t-h3"
                style={{ flexShrink: 0, width: '2rem', textAlign: 'right', color: 'var(--c-ink-faint)', lineHeight: 'var(--lh-body)', fontSize: 'var(--t-body)', fontWeight: 600 }}
              >
                {i + 1}
              </span>
              <p style={{ fontSize: 'var(--t-body)', lineHeight: 'var(--lh-body)', color: 'var(--c-ink)' }}>{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {recipe.notes && (
        <section
          className="flex flex-col gap-3 p-5"
          style={{ background: 'var(--c-cream)', borderRadius: 'var(--r-lg)' }}
        >
          <h2 className="t-h3" style={{ fontSize: 'var(--t-small)', fontWeight: 600 }}>Notes</h2>
          <p style={{ fontSize: 'var(--t-body)', lineHeight: 'var(--lh-body)', color: 'var(--c-ink-soft)' }}>{recipe.notes}</p>
        </section>
      )}

      <CommitHistory commits={recipe.commits} />

    </div>
  )
}
