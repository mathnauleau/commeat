# CLAUDE.md — Commeat

You are building **Commeat**, a personal cookbook app where recipes are Markdown files and every change is a commit. The git metaphor is the soul of the product — not a tool for developers, but a cookbook for people who care about their recipes.

Refer to `commeat-brief.md` for full product context and `commeat-dev-plan.md` for the session-by-session build order.

---

## Stack

- **Framework**: React + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS (design tokens only — no hardcoded hex or px values)
- **State**: Zustand
- **Fonts**: Fraunces (display) + DM Sans (body) via Fontsource
- **Sync**: GitHub API (OAuth)
- **Extraction**: Anthropic API (Claude) — `claude-sonnet-4-20250514`

---

## Absolute rules

- **Never hardcode colors or spacing** — always use Tailwind design tokens
- **Never build MLP or Iteration features** — MVP only, always check the Out of Scope list
- **Never skip empty states** — every screen must handle the empty condition gracefully
- **Never use `any` in TypeScript** — define proper types in `types/`
- **Never put logic in pages** — pages are thin, logic lives in hooks and lib
- **Never skip error handling** — failed API calls and GitHub sync failures must surface clearly to the user

---

## Folder structure

```
src/
├── components/
│   ├── ui/              # Primitives only: Button, Card, Input, Textarea, Badge, Tag, IconButton, Dialog
│   ├── layout/          # Shell, Header, PageWrapper
│   └── recipes/         # RecipeCard, RecipeView, CommitHistory, ImportDialog
├── pages/               # Shelf.tsx, Recipe.tsx, Settings.tsx — thin, no logic
├── hooks/               # useRecipes.ts, useImport.ts, useGitHub.ts
├── lib/                 # parser.ts, extractor.ts, github.ts, readme.ts, mockData.ts
├── store/               # recipes.ts (Zustand)
├── types/               # recipe.ts — Recipe, CommitEntry, ShelfConfig
└── styles/              # globals.css
```

One concern per file. No component over 200 lines. Co-locate feature components, hooks, and types.

---

## Design tokens

```js
// tailwind.config.ts
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

Typography: `font-display` → Fraunces, `font-body` → DM Sans. Never use system-ui as a primary font.

---

## Data model

### Recipe type

```ts
interface Recipe {
  title: string
  origin: string
  importedFrom: string
  committedAt: string        // ISO date
  version: number
  forkOf: string | null
  tags: string[]
  prepTime: string
  cookTime: string
  servings: number
  quote?: string             // optional — "Grandma always said..."
  ingredients: string[]
  steps: string[]
  notes?: string
  commits: CommitEntry[]
}

interface CommitEntry {
  version: number
  date: string               // ISO date
  message: string
}

interface ShelfConfig {
  theme: string              // e.g. "botanical"
  cardLayout: 'portrait'
  printFormat: 'A5'
}
```

### Recipe file format

Recipes are stored as `.md` files with YAML frontmatter. Use `gray-matter` to parse. `lib/parser.ts` handles all serialization — never parse markdown outside of that file.

### File naming — recipeSlug()

Every recipe maps to `recipes/[slug].md` in the GitHub repo. The slug is always derived from the title at commit time:

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

- Always call `recipeSlug(recipe.title)` in `lib/github.ts` to compute the file path
- Never hardcode file paths
- Never store the slug in the recipe frontmatter

---

## Key interactions & copy

| Action | UI label |
|--------|----------|
| Save a new recipe | "Commit recipe" |
| Save an edit | "Commit changes" |
| Version note | "Commit message" |
| Duplicate a recipe | "Fork recipe" *(MLP — do not build)* |

Tone: warm, personal, quietly nerdy. Never clinical, never cutesy. Placeholder copy should feel like a real cookbook, not generic app copy.

---

## Component conventions

```tsx
// Button — always use variants, never custom styles
<Button variant="primary" size="md">Commit recipe</Button>
<Button variant="ghost" size="sm">Cancel</Button>

// Card — always surface-raised bg + border + radius-lg
<Card className="p-6">...</Card>

// Tag — origin and category labels
<Tag>Grandma Marie</Tag>
<Tag>Italian</Tag>
```

Touch targets: minimum 44px height on all interactive elements.

---

## Session checkpoints

Complete each session fully before starting the next. Each session ends in a clean, committable state. Current session order:

1. Scaffold + design tokens
2. Types + mock data
3. Markdown parser (`lib/parser.ts`)
4. UI primitives
5. Shelf page
6. Recipe view page
7. Inline editor + commit flow
8. ImportDialog + AI extraction
9. GitHub sync
10. README auto-generation
11. Settings page + polish

---

## Out of scope — never build these

- Bookshelf / spine UI
- Watercolor illustration generation
- Recipe forking
- Print / PDF export
- Book aging or wear system
- Public cookbook sharing
- Multiple themes
- Any print-on-demand integration

If a feature isn't in the session plan, don't build it.