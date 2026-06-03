import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { parseRecipe, serializeRecipe, appendCommit } from './parser'
import { mockRecipes } from './mockData'

// ── Round-trip fidelity ────────────────────────────────────────────────────

describe('round-trip fidelity', () => {
  it('parse → serialize → parse yields an identical object for each mock recipe', () => {
    for (const recipe of mockRecipes) {
      const serialized = serializeRecipe(recipe)
      const reparsed = parseRecipe(serialized)
      expect(reparsed).toEqual(recipe)
    }
  })

  it('preserves optional quote field through round-trip', () => {
    const withQuote = mockRecipes.find(r => r.quote !== undefined)
    expect(withQuote).toBeDefined()
    const serialized = serializeRecipe(withQuote!)
    expect(serialized).toContain(`> ${withQuote!.quote}`)
    const reparsed = parseRecipe(serialized)
    expect(reparsed.quote).toBe(withQuote!.quote)
  })

  it('preserves undefined quote when recipe has no quote', () => {
    const noQuote = mockRecipes.find(r => r.quote === undefined)
    expect(noQuote).toBeDefined()
    const reparsed = parseRecipe(serializeRecipe(noQuote!))
    expect(reparsed.quote).toBeUndefined()
  })

  it('preserves undefined notes when recipe has no notes', () => {
    const noNotes = mockRecipes.find(r => r.notes === undefined)
    expect(noNotes).toBeDefined()
    const reparsed = parseRecipe(serializeRecipe(noNotes!))
    expect(reparsed.notes).toBeUndefined()
  })

  it('preserves null forkOf through round-trip', () => {
    const recipe = mockRecipes[0]
    expect(recipe.forkOf).toBeNull()
    const reparsed = parseRecipe(serializeRecipe(recipe))
    expect(reparsed.forkOf).toBeNull()
  })
})

// ── parseRecipe from a raw .md string ─────────────────────────────────────

const SAMPLE_MD = `---
title: 'Grandma Marie''s Tomato Sauce'
origin: 'Grandma Marie'
imported_from: 'handwritten card'
committed_at: '2024-12-24'
version: 3
fork_of: null
tags: [italian, sauce, family]
prep_time: '15 min'
cook_time: '45 min'
servings: 4
---

# Grandma Marie's Tomato Sauce

> Always use San Marzano, never anything else.

## Ingredients

- 800g San Marzano tomatoes, crushed by hand
- 3 garlic cloves, sliced thin
- 1 handful fresh basil
- 4 tbsp olive oil
- 1 tsp salt
- pinch of sugar

## Steps

1. Warm olive oil in a wide pan over medium heat.
2. Add garlic, cook until just golden — don't rush it.
3. Add tomatoes, stir to combine.
4. Simmer uncovered for 40 minutes, stirring occasionally.
5. Tear in basil at the last minute, adjust salt.

## Notes

The secret is patience on step 4. A wide pan matters — too deep and it steams instead of reducing.

## Commit History

| version | date | message |
| --- | --- | --- |
| v1 | 2024-03-12 | Exactly as found on the card |
| v2 | 2024-08-01 | Added pinch of sugar — mellows the acidity |
| v3 | 2024-12-24 | Christmas batch — doubled it, still perfect |
`

describe('parseRecipe from raw markdown', () => {
  it('parses frontmatter fields correctly', () => {
    const recipe = parseRecipe(SAMPLE_MD)
    expect(recipe.title).toBe("Grandma Marie's Tomato Sauce")
    expect(recipe.origin).toBe('Grandma Marie')
    expect(recipe.importedFrom).toBe('handwritten card')
    expect(recipe.committedAt).toBe('2024-12-24')
    expect(recipe.version).toBe(3)
    expect(recipe.forkOf).toBeNull()
    expect(recipe.tags).toEqual(['italian', 'sauce', 'family'])
    expect(recipe.prepTime).toBe('15 min')
    expect(recipe.cookTime).toBe('45 min')
    expect(recipe.servings).toBe(4)
  })

  it('parses the quote field', () => {
    const recipe = parseRecipe(SAMPLE_MD)
    expect(recipe.quote).toBe('Always use San Marzano, never anything else.')
  })

  it('parses ingredients as an array', () => {
    const recipe = parseRecipe(SAMPLE_MD)
    expect(recipe.ingredients).toHaveLength(6)
    expect(recipe.ingredients[0]).toBe('800g San Marzano tomatoes, crushed by hand')
  })

  it('parses steps as an array', () => {
    const recipe = parseRecipe(SAMPLE_MD)
    expect(recipe.steps).toHaveLength(5)
    expect(recipe.steps[0]).toBe('Warm olive oil in a wide pan over medium heat.')
  })

  it('parses notes', () => {
    const recipe = parseRecipe(SAMPLE_MD)
    expect(recipe.notes).toBe(
      'The secret is patience on step 4. A wide pan matters — too deep and it steams instead of reducing.',
    )
  })

  it('parses commit history', () => {
    const recipe = parseRecipe(SAMPLE_MD)
    expect(recipe.commits).toHaveLength(3)
    expect(recipe.commits[0]).toEqual({ version: 1, date: '2024-03-12', message: 'Exactly as found on the card' })
    expect(recipe.commits[2]).toEqual({ version: 3, date: '2024-12-24', message: 'Christmas batch — doubled it, still perfect' })
  })
})

// ── appendCommit ───────────────────────────────────────────────────────────

describe('appendCommit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-03'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('bumps version by 1', () => {
    const recipe = mockRecipes[0] // version 3
    const updated = appendCommit(recipe, 'Made it spicier')
    expect(updated.version).toBe(4)
  })

  it('sets committedAt to today', () => {
    const updated = appendCommit(mockRecipes[0], 'Test commit')
    expect(updated.committedAt).toBe('2025-06-03')
  })

  it('appends a new CommitEntry with the correct version, date, and message', () => {
    const recipe = mockRecipes[0]
    const updated = appendCommit(recipe, 'Added more garlic')
    const newEntry = updated.commits.at(-1)!
    expect(newEntry.version).toBe(4)
    expect(newEntry.date).toBe('2025-06-03')
    expect(newEntry.message).toBe('Added more garlic')
  })

  it('preserves existing commit history', () => {
    const recipe = mockRecipes[0]
    const updated = appendCommit(recipe, 'New commit')
    expect(updated.commits).toHaveLength(recipe.commits.length + 1)
    expect(updated.commits.slice(0, -1)).toEqual(recipe.commits)
  })

  it('does not mutate the original recipe', () => {
    const recipe = mockRecipes[0]
    const originalVersion = recipe.version
    appendCommit(recipe, 'Mutation test')
    expect(recipe.version).toBe(originalVersion)
  })
})
