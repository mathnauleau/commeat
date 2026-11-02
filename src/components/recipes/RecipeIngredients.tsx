import { useState } from 'react'
import type { IngredientSection } from '../../lib/recipeLayout'

interface RecipeIngredientsProps {
  sections: IngredientSection[]
}

export function RecipeIngredients({ sections }: RecipeIngredientsProps) {
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set())

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })
  }

  return (
    <aside className="recipe-ingredients">
      {sections.map((section, s) => (
        <section key={section.heading} className="flex flex-col gap-3">
          <h2>{section.heading}</h2>
          {section.blocks.map((block, b) => {
            if (block.kind === 'html') {
              return <div key={b} className="prose" dangerouslySetInnerHTML={{ __html: block.html }} />
            }
            return (
              <div key={b} className="flex flex-col">
                {block.items.map((item, i) => {
                  const id = `${s}-${b}-${i}`
                  return (
                    <label key={id} className="ingredient">
                      <input type="checkbox" checked={checked.has(id)} onChange={() => toggle(id)} />
                      <span className="ingredient-box" aria-hidden>
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span className="ingredient-text" dangerouslySetInnerHTML={{ __html: item }} />
                    </label>
                  )
                })}
              </div>
            )
          })}
        </section>
      ))}
    </aside>
  )
}
