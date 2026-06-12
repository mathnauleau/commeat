# Commeat — MVP Brief
*"Your recipes, committed."*

---

## Concept

Commeat is a personal recipe book app where recipes are Markdown files versioned like code. The git metaphor is the soul of the product — every recipe edit is a commit, every adaptation is a fork — but the experience is warm, tactile, and personal. Not a tool for developers. A cookbook for people who care about their recipes.

---

## MVP Scope

The MVP delivers the core loop only: **capture → read → commit.**

No bookshelf animation, no watercolor generation, no printing. Just: get recipes in, keep them versioned, own your data via GitHub sync.

---

## Platform

- **Primary**: Tablet (landscape-first, iPad)
- **Secondary**: Mobile

Stack: **Vite + React + Tailwind CSS + TypeScript**

---

## Data Model

### `recipe.md` — one file per recipe

```markdown
---
title: Grandma Marie's Tomato Sauce
origin: Grandma Marie
imported_from: handwritten card
committed_at: 2024-03-12
version: 3
fork_of: null
tags: [italian, sauce, family]
prep_time: 15min
cook_time: 45min
servings: 4
---

# Grandma Marie's Tomato Sauce

> "Always use San Marzano, never anything else." — Grandma Marie

## Ingredients

- 800g San Marzano tomatoes, crushed by hand
- 3 garlic cloves, sliced thin
- 1 handful fresh basil
- 4 tbsp olive oil
- 1 tsp salt
- pinch of sugar

## Steps

1. Warm olive oil in a wide pan over medium heat
2. Add garlic, cook until just golden — don't rush it
3. Add tomatoes, stir to combine
4. Simmer uncovered for 40 minutes, stirring occasionally
5. Tear in basil at the last minute, adjust salt

## Notes

Grandma always said the secret is patience on step 4.

## Commit History

| version | date       | message                        |
|---------|------------|--------------------------------|
| v1      | 2024-03-12 | Exactly as found               |
| v2      | 2024-08-01 | Added pinch of sugar           |
| v3      | 2024-12-24 | Christmas batch — doubled it   |
```

### `shelf.json` — global style config (decoupled from recipe content)

```json
{
  "theme": "loose-watercolor",
  "card_layout": "portrait",
  "print_format": "A5"
}
```

`shelf.json` holds a **theme key**, not raw CSS. The app holds a dictionary of pre-built themes that each key maps to. The user picks a theme; the app handles all visual rendering.

```js
// lib/themes.ts
const themes = {
  "loose-watercolor": {
    font: "Fraunces",
    background: "#FAF7F2",
    accent: "#C84B31",
    illustrationStyle: "watercolor",
    cardBorder: "soft-parchment",
  },
  "clean-minimal": {
    font: "DM Sans",
    background: "#FFFFFF",
    accent: "#3B5BDB",
    illustrationStyle: "none",
    cardBorder: "sharp",
  }
}
```

Recipe `.md` files never contain style information — they are pure content. `shelf.json` is the equivalent of a CSS stylesheet: it defines how the app renders every recipe, globally. Swapping the theme key re-renders the entire Commeat in a new visual style without touching any recipe file.

### Repo structure (GitHub)

```
commeat-[username]/
  recipes/
    grandmas-maries-tomato-sauce.md
    pasta-carbonara.md
  shelf.json
  README.md        ← auto-generated index of all recipes
```

Each recipe maps to `recipes/[slug].md` where the slug is derived from the recipe title via `recipeSlug()` in `lib/parser.ts`:

```ts
export function recipeSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
// "Grandma Marie's Tomato Sauce" → "recipes/grandmas-maries-tomato-sauce.md"
```

The slug is computed at commit time in `lib/github.ts` and used as the file path. It is never stored in the recipe frontmatter.

---

## Key Screens (MVP)

### 1. Shelf (Home)
- Grid of recipe cards — watercolor thumbnail placeholder, title, origin tag
- "+" IconButton in the header/corner triggers the ImportDialog
- Filter/search bar at top

### 2. ImportDialog (modal on Shelf)
- Single input field: accepts URL, photo, or text paste — Commeat detects the type
- AI parses and extracts: title, ingredients, steps, origin
- Review screen: editable inline before committing
- Origin field: pre-filled but renameable (e.g. "From Instagram · @x" → "Grandma Marie")
- CTA: **"Commit recipe"** with optional commit message field

### 3. Recipe View
- Clean reading layout: title, origin tag, prep/cook time, servings
- Ingredients + steps in readable typography
- Commit history at the bottom (version list, messages, dates)
- Edit button → inline editing mode
- "Commit changes" saves a new version

### 4. Settings
- GitHub auth + repo connection
- `shelf.json` theme selector (MVP: just a placeholder, one theme only)

---

## Core Interactions

| Action | In-app language |
|--------|----------------|
| Save a recipe | "Commit recipe" |
| Save an edit | "Commit changes" |
| Duplicate & adapt | "Fork recipe" *(MLP)* |
| Version note | "Commit message" |

---

## Import Methods (MVP)

| Source | Method |
|--------|--------|
| Website / blog | URL paste → web scraper + AI extraction |
| Instagram post | URL paste → screenshot OCR fallback if blocked |
| Handwritten card | Photo → OCR + AI structuring |
| Manual | Free-text entry |

---

## GitHub Sync

- OAuth login on first launch (GitHub)
- Creates a `commeat-[username]` repo automatically
- Every in-app commit → real `git commit` to the repo
- Recipes are real `.md` files the user owns
- Auto-generates/updates `README.md` as a recipe index on every commit

---

## Design Direction

- **Mood**: warm, handmade, personal — like a well-loved cookbook, not a productivity app
- **Typography**: Fraunces (display/headings) + DM Sans (body)
- **Palette**: sage green backgrounds, forest ink text, deep green accent
- **Accent**: `#3A6B4A` (forest green)
- **Motion**: subtle, purposeful — no flashy transitions in MVP
- **Empty states**: always designed — never a blank screen

### Design tokens

```js
colors: {
  surface: {
    DEFAULT: '#F2F5F0',   // sage parchment
    raised: '#FFFFFF',
    sunken: '#E4EBE1',
  },
  border: {
    DEFAULT: '#C8D8C4',
    strong: '#A8C0A2',
  },
  content: {
    primary: '#1A2E22',   // forest ink
    secondary: '#4A6B54',
    muted: '#7A9E84',
  },
  accent: {
    DEFAULT: '#3A6B4A',   // forest green
    soft: '#E4EBE1',
  },
}
```

---

## Folder Structure

```
src/
├── components/
│   ├── ui/              # Button, Card, Input, Badge, Tag
│   ├── layout/          # Shell, Header, PageWrapper
│   └── recipes/         # RecipeCard, RecipeView, CommitHistory, ImportDialog
├── pages/
│   ├── Shelf.tsx        # Home / recipe grid — includes "+" IconButton triggering ImportDialog
│   ├── Recipe.tsx       # Recipe reading + editing view
│   └── Settings.tsx     # GitHub auth + shelf config
├── hooks/
│   ├── useRecipes.ts
│   ├── useImport.ts
│   └── useGitHub.ts
├── lib/
│   ├── parser.ts        # Markdown parse/serialize
│   ├── extractor.ts     # AI extraction logic (URL, OCR, text)
│   └── github.ts        # GitHub API client
├── store/
│   └── recipes.ts       # Zustand store
├── types/
│   └── recipe.ts        # Recipe, CommitEntry, ShelfConfig types
└── styles/
    └── globals.css
```

---

## Build Order

1. Scaffold project + design tokens + Tailwind config
2. `types/recipe.ts` — define Recipe, CommitEntry, ShelfConfig
3. `lib/parser.ts` — Markdown ↔ Recipe object (parse + serialize)
4. UI primitives: Button, Card, Input, Badge, Tag
5. Shelf page — recipe grid + empty state + "+" card
6. Recipe view page — reading layout + commit history
7. Inline editor — edit mode + "Commit changes" flow
8. ImportDialog — "+" IconButton on Shelf → dialog → parse → review → commit
9. `lib/extractor.ts` — AI extraction (URL scrape, OCR, text)
10. `lib/github.ts` + `useGitHub.ts` — GitHub OAuth + repo sync
11. Settings page — GitHub connection + shelf config
12. README auto-generation on commit
13. Polish: empty states, loading states, error handling

---

## Out of Scope (MVP)

- Bookshelf / spine UI — MLP
- Watercolor illustration generation — MLP
- Recipe forking — MLP
- Print / PDF export — MLP
- Book aging / wear system — Iteration
- Public repo sharing — Iteration
- Print-on-demand — Iteration

---

## Tagline & Voice

- **Tagline**: *"Your recipes, committed."*
- **In-app language**: Fork. Cook. Commit.
- **Tone**: warm, personal, quietly nerdy — never clinical, never cutesy