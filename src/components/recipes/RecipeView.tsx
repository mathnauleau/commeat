import { useMemo } from 'react'
import { layoutRecipe } from '../../lib/recipeLayout'
import { Tag } from '../ui/Tag'
import { RecipeIngredients } from './RecipeIngredients'
import { RecipePhoto } from './RecipePhoto'
import ClockIcon from '../../assets/icons/clock.svg?react'

interface RecipeViewProps {
  markdown: string
  slug: string
}

export function RecipeView({ markdown, slug }: RecipeViewProps) {
  const layout = useMemo(() => layoutRecipe(markdown), [markdown])
  const hasColumns = layout.ingredients.length > 0 || layout.steps !== ''

  return (
    <article>
      <div className="recipe-hero">
        <RecipePhoto className="recipe-photo" src={layout.image?.src} alt={layout.image?.alt} slug={slug} />
        <div className="recipe-heading">
          <div className="flex flex-wrap gap-2">
            {layout.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
            {layout.origin && <Tag className="tag-neutral">{layout.origin}</Tag>}
            {layout.prepTime && (
              <Tag className="tag-neutral">
                <ClockIcon width={14} height={14} aria-hidden />
                {layout.prepTime}
              </Tag>
            )}
          </div>
          <h1>{layout.title}</h1>
          {layout.intro && <div className="prose recipe-intro" dangerouslySetInnerHTML={{ __html: layout.intro }} />}
        </div>
      </div>

      {hasColumns && (
        <div className="recipe-columns">
          {layout.ingredients.length > 0 && <RecipeIngredients key={slug} sections={layout.ingredients} />}
          {layout.steps && <div className="prose recipe-steps" dangerouslySetInnerHTML={{ __html: layout.steps }} />}
        </div>
      )}

      {layout.sections.map((section, i) => (
        <section
          key={i}
          className={['prose recipe-section', section.isHistory ? 'recipe-history' : ''].filter(Boolean).join(' ')}
          dangerouslySetInnerHTML={{ __html: section.html }}
        />
      ))}
    </article>
  )
}
