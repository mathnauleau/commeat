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

The color system is two-layered. **Always use semantic tokens in components — never primitives directly.**

### Layer 1 — Primitives (in globals.css, never used in components)

```css
/* Sage */
--c-sage: #d7dec9;
--c-sage-deep: #c5ceb2;
--c-paper: #fbf8f1;
--c-cream: #f3ecdd;
--c-cream-deep: #eadfcb;

/* Ink */
--c-ink: #232c24;
--c-ink-soft: #4c564b;
--c-ink-faint: #828b79;

/* Forest green — brand + primary actions */
--c-forest: #3a6b4a;
--c-forest-deep: #2c5239;
--c-forest-tint: #e3eadb;

/* Clay — secondary accent, forks, highlights */
--c-clay: #bc6b47;
--c-clay-deep: #9f562f;
--c-clay-tint: #f2e1d5;

/* Lines */
--c-line: #ded6c4;
--c-line-strong: #cdc4ae;
--c-line-sage: #b7c0a2;

/* Error */
--c-error: #a0522d;

/* Diff */
--c-add-bg: #e4ecdc;
--c-add-ink: #355b3f;
--c-add-bar: #6e9a6e;
--c-del-bg: #f3e2d6;
--c-del-ink: #9f562f;
--c-del-bar: #c99172;

/* Focus */
--c-focus: #3a6b4a;
--ring: 0 0 0 3px rgba(58, 107, 74, 0.28);
```

### Layer 2 — Semantic tokens (use these in all components)

```css
/* Backgrounds */
--background-base: var(--c-paper);
--background-surface: var(--c-cream);
--background-surface-raised: #ffffff;
--background-sunken: var(--c-cream-deep);
--background-subtle: var(--c-forest-tint);

/* Content */
--text-primary: var(--c-ink);
--text-secondary: var(--c-ink-soft);
--text-muted: var(--c-ink-faint);
--text-inverse: var(--c-paper);
--text-link: var(--c-forest);

/* Borders */
--border-default: var(--c-line);
--border-strong: var(--c-line-strong);
--border-emphasis: var(--c-line-sage);

/* Primary action — CTA, commit button */
--action-primary-bg: var(--c-forest);
--action-primary-bg-hover: var(--c-forest-deep);
--action-primary-text: var(--c-paper);

/* Secondary action — ghost, cancel */
--action-secondary-bg: transparent;
--action-secondary-border: var(--c-line-strong);
--action-secondary-text: var(--c-ink-soft);

/* Accent primary — forest (nav, active, tags) */
--accent-primary: var(--c-forest);
--accent-primary-bg: var(--c-forest-tint);
--accent-primary-text: var(--c-forest-deep);

/* Accent secondary — clay (forks, new, highlights) */
--accent-secondary: var(--c-clay);
--accent-secondary-bg: var(--c-clay-tint);
--accent-secondary-text: var(--c-clay-deep);

/* Feedback — error */
--feedback-error-bg: var(--c-clay-tint);
--feedback-error-text: var(--c-error);
--feedback-error-border: var(--c-clay);

/* Feedback — success */
--feedback-success-bg: var(--c-forest-tint);
--feedback-success-text: var(--c-forest-deep);
--feedback-success-border: var(--c-forest);

/* Feedback — warning */
--feedback-warning-bg: #f5edd6;
--feedback-warning-text: #8a5c1a;
--feedback-warning-border: #c9973a;

/* Diff */
--diff-add-bg: var(--c-add-bg);
--diff-add-text: var(--c-add-ink);
--diff-add-bar: var(--c-add-bar);
--diff-del-bg: var(--c-del-bg);
--diff-del-text: var(--c-del-ink);
--diff-del-bar: var(--c-del-bar);

/* Focus */
--focus-ring: var(--ring);
--focus-color: var(--c-focus);
```

### Rule

- **Primitives** live in `globals.css` only — never referenced in components
- **Semantic tokens** are the only tokens used in components and Tailwind classes
- Adding a new color = add a primitive first, then a semantic token that references it

### Tailwind v4 constraint — do not try to fix this

JSX rarely uses Tailwind color utilities directly. Most colors are applied through CSS classes like `.btn-primary`, `.card`, `.prose` — all driven by `:root` semantic tokens.

`@theme` is intentionally mostly unused. Tailwind v4's `@theme` requires static values and cannot resolve `var()` references, which means it cannot point at `:root` variables. The duplication between `@theme` and `:root` is the known, accepted cost of having both systems.

**Never attempt to unify `@theme` and `:root` by inlining hex values into `@theme` — that defeats the purpose of the semantic layer. Leave the duplication as-is.**

Typography: `font-display` → Fraunces, `font-body` → DM Sans. Never use system-ui as a primary font.

---

## Data model

### Recipe type

```ts
interface Recipe {
  title: string;
  origin: string;
  importedFrom: string;
  committedAt: string; // ISO date
  version: number;
  forkOf: string | null;
  tags: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  quote?: string; // optional — "Grandma always said..."
  ingredients: string[];
  steps: string[];
  notes?: string;
  commits: CommitEntry[];
}

interface CommitEntry {
  version: number;
  date: string; // ISO date
  message: string;
}

interface ShelfConfig {
  theme: string; // e.g. "botanical"
  cardLayout: "portrait";
  printFormat: "A5";
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
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
// "Grandma Marie's Tomato Sauce" → "recipes/grandmas-maries-tomato-sauce.md"
```

- Always call `recipeSlug(recipe.title)` in `lib/github.ts` to compute the file path
- Never hardcode file paths
- Never store the slug in the recipe frontmatter

---

## Key interactions & copy

| Action             | UI label                             |
| ------------------ | ------------------------------------ |
| Save a new recipe  | "Commit recipe"                      |
| Save an edit       | "Commit changes"                     |
| Version note       | "Commit message"                     |
| Duplicate a recipe | "Fork recipe" _(MLP — do not build)_ |

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
