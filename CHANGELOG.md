# Changelog

## [Unreleased] — Design system migration · 2026-06-05

Adopted `commeat.css` as the canonical design source. Full visual and token refactor across every component and page. No logic or routing changes.

### Added
- `src/styles/commeat.css` — design system with CSS custom properties (color, type, spacing, radius, elevation, motion) and semantic component classes (`.btn`, `.card`, `.field`, `.chip`, `.hash`, `.timeline`, `.commit`, `.empty`, `.diff`, `.overline`, etc.)
- `--c-error: #A0522D` — warm sienna error token added to the system (gap in the original spec)
- `public/commeat.css` — static copy served at root for the Styleguide HTML
- `public/Commeat Styleguide.html` — full design system reference, accessible at `/Commeat Styleguide.html`
- `public/Sample Screen.html` — assembled recipe-detail screen showing all tokens in context
- `public/assets/favicon.svg` — asset copy for Styleguide HTML references
- `card-hover` Tailwind utility using `--e-2` elevation on hover

### Changed
- **Fonts**: Fraunces + DM Sans → **Newsreader** (display/headings) + **Spectral** (body). Fontsource npm imports removed; Google Fonts loaded via `commeat.css`.
- **Color palette**: all surface, border, content, accent, and error tokens remapped to commeat.css hex values in `globals.css @theme`. Propagates automatically to every Tailwind utility class in the codebase.
- **Button** — pill shape (`.btn`), adopts `.btn-primary / .btn-secondary / .btn-ghost / .btn-sm`
- **IconButton** — `.btn .btn-icon`, circular 44px minimum touch target
- **Card** — `.card`, gains `--e-1` box-shadow
- **Badge** — `.chip` base with inline style overrides for accent/muted variants
- **Tag** — `.chip .tag`
- **Input / Textarea** — `.field .label .input / .textarea`; dirty and error border states via inline `borderColor`
- **Dialog** — `.card` panel surface, `--e-3` overlay shadow, `--c-ink` backdrop
- **CommitHistory** — full semantic rewrite using `.timeline .commit .commit-msg .commit-meta .hash`; version numbers rendered as `.hash` chips; single-commit state shows "First version" label
- **RecipeView** — `.t-h1 / .t-h3` headings, `.hash` version chip, all colors reference `var(--c-*)` directly
- **RecipeCard** — `.card .card-hover`, illustration placeholder uses `var(--c-forest-tint)` and `var(--c-line-sage)` fills
- **RecipeEditor / CommitBar / ImportDialog** — `.field .input .textarea .btn` throughout; error surfaces use `rgba(160,82,45,…)` from `--c-error`
- **SyncErrorBanner** — error palette derived from `--c-error`
- **Shelf** — empty state uses `.empty .empty-mark` pattern; skeleton cards use `var(--c-cream)`; settings link styled as `.btn .btn-ghost .btn-icon`
- **Recipe / Settings pages** — back links, headings, and surfaces reference commeat.css vars throughout

---

## Sessions 1–11 — MVP build · 2026-05-XX – 2026-06-04

### Session 1 — Scaffold & design foundation
Vite + React + TypeScript project, Tailwind CSS configured, Fraunces + DM Sans fonts via Fontsource, full design token palette in `globals.css`, folder structure established.

### Session 2 — Types & data model
`Recipe`, `CommitEntry`, `ShelfConfig` TypeScript interfaces. Three mock recipes in `lib/mockData.ts`.

### Session 3 — Markdown parser
`lib/parser.ts` — `parseRecipe`, `serializeRecipe`, `appendCommit`. Gray-matter for YAML frontmatter. 16 unit tests for round-trip fidelity, edge cases, and commit versioning.

### Session 4 — UI primitives
`Button`, `Card`, `Input`, `Textarea`, `Badge`, `Tag`, `IconButton`, `Dialog` — all using design tokens, 44px touch targets, focus rings, consistent variants.

### Session 5 — Shelf page
Responsive recipe grid (`auto-fill, minmax(220px, 1fr)`), `RecipeCard`, Zustand store seeded with mock data, `useRecipes` hook, empty state with CTA.

### Session 6 — Recipe view page
Full reading layout: title, origin tag, meta badges, optional quote block, ingredients list, numbered steps, optional notes, `CommitHistory` table. Back navigation and 404 state.

### Session 7 — Inline editor & commit flow
Edit mode toggle, dirty-field highlighting, `CommitBar` for commit message input, `appendCommit` wired to bump version and append history, `useRecipeEditor` hook. Cancel reverts all changes.

### Session 8 — Import dialog & AI extraction
Three-step `ImportDialog`: URL/text/image input → AI extraction via `lib/extractor.ts` (Claude API) → editable review → commit. Extraction skeleton, error state with manual-entry fallback.

### Session 9 — GitHub sync
`lib/github.ts` — `initRepo`, `commitFile`, `deleteFile`, `readFile`, `listRecipes`. `useGitHub` hook with fire-and-forget `syncRecipe` and `hydrate`. Auth persisted in localStorage.

### Session 10 — README auto-generation
`lib/readme.ts` — `generateReadme(recipes, username)`: title, tagline, markdown table sorted by `committedAt` descending, empty state, footer. Called after every `syncRecipe`, committed to repo root as `README.md`. 8 unit tests.

### Session 11 — Settings page & polish
Settings page with GitHub connect/disconnect (avatar, repo link, PAT input with error handling) and Botanical theme selector. Hydration skeleton on the Shelf. `SyncErrorBanner` app-wide. `CommitHistory` single-commit "First version" label. Token audit clean. 24 tests passing.
