import { describe, expect, it } from 'vitest'
import { layoutRecipe } from './recipeLayout'

const SCONES = `# Classic Scones
**Tags:** Brunch, Baking
**PrepTime:** 30min

<img alt="Classic Scones" src="https://example.com/scones.jpg" />

> Light, fluffy, and golden.

## Ingredients of the Scone Dough
* 500 g plain flour
* 1 tsp **salt**

## Steps
1. Preheat the oven.
2. Bake.

## Notes
Avoid overworking the dough.

**Serving suggestions:**
* Clotted cream

[CupcakeJemma](https://example.com/video)

## Version History
| version | date | message |
| ------- | ---- | ------- |
| v1 | 2026-06-08 | First commit |
`

describe('layoutRecipe', () => {
  it('lifts the frontmatter-style lines into the hero', () => {
    const layout = layoutRecipe(SCONES)
    expect(layout.title).toBe('Classic Scones')
    expect(layout.tags).toEqual(['Brunch', 'Baking'])
    expect(layout.prepTime).toBe('30min')
    expect(layout.image).toEqual({ src: 'https://example.com/scones.jpg', alt: 'Classic Scones' })
    expect(layout.intro).toContain('Light, fluffy, and golden.')
    expect(layout.intro).not.toContain('Tags')
    expect(layout.intro).not.toContain('blockquote')
  })

  it('reads a markdown image the same as an img tag', () => {
    expect(layoutRecipe('# T\n\n![Sauce](images/sauce.jpg)\n').image).toEqual({ src: 'images/sauce.jpg', alt: 'Sauce' })
  })

  it('leaves the image empty when the recipe has none', () => {
    expect(layoutRecipe('# T\n\n## Steps\n1. Stir\n').image).toBeNull()
  })

  it('renders ingredient items with their inline markdown', () => {
    const [section] = layoutRecipe(SCONES).ingredients
    expect(section.heading).toBe('Ingredients of the Scone Dough')
    expect(section.blocks[0]).toEqual({ kind: 'list', items: ['500 g plain flour', '1 tsp <strong>salt</strong>'] })
  })

  it('splits by structure, whatever language the headings are in', () => {
    const layout = layoutRecipe(`# Lasagnes
## Ingrédients de la Pâte
* Farine

## Ingrédients de la Béchamel
* Lait

## Étapes
1. Mélanger

## Historique des versions
| version | date | message |
| --- | --- | --- |
| v1 | 2026-06-08 | Premier commit |
`)
    expect(layout.ingredients.map((s) => s.heading)).toEqual(['Ingrédients de la Pâte', 'Ingrédients de la Béchamel'])
    expect(layout.steps).toContain('<ol>')
    expect(layout.sections).toHaveLength(1)
    expect(layout.sections[0].isHistory).toBe(true)
  })

  it('keeps bulleted sections after the steps with the notes', () => {
    const layout = layoutRecipe('# T\n## Base\n* Eggs\n\n## Steps\n1. Whisk\n\n## Garnitures\n* Sirop\n')
    expect(layout.ingredients).toHaveLength(1)
    expect(layout.sections[0].html).toContain('Garnitures')
  })

  it('keeps a free-form section out of the ingredients even before the steps', () => {
    const layout = layoutRecipe('# T\n## Story\nFrom my grandmother.\n\n## Base\n* Eggs\n\n## Steps\n1. Whisk\n')
    expect(layout.ingredients.map((s) => s.heading)).toEqual(['Base'])
    expect(layout.sections[0].html).toContain('From my grandmother.')
  })

  it('still finds ingredients when a recipe has no numbered steps', () => {
    const layout = layoutRecipe('# T\n## Base\n* Eggs\n\n## Notes\nSimple.\n')
    expect(layout.ingredients).toHaveLength(1)
    expect(layout.steps).toBe('')
    expect(layout.sections[0].html).toContain('Simple.')
  })

  it('marks lone labels and links so the notes can style them', () => {
    const notes = layoutRecipe(SCONES).sections[0].html
    expect(notes).toContain('<p class="prose-label"><strong>Serving suggestions:</strong></p>')
    expect(notes).toContain('<p class="prose-link"><a href="https://example.com/video">')
    expect(notes).toContain('<p>Avoid overworking the dough.</p>')
  })

  it('does not treat a sentence containing a link as a source button', () => {
    expect(layoutRecipe('# T\n## Notes\nSee [this](https://example.com) first.\n').sections[0].html).not.toContain('prose-link')
  })

  it('keeps a metadata-looking line it does not know in the intro', () => {
    expect(layoutRecipe('# T\n**Serves:** 4\n').intro).toContain('Serves')
  })
})
