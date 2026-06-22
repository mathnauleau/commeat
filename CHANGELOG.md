# Changelog

## [v1.3] — Filter bar, prep time & CSS cleanup · 2026-06-12

### Added

- **Filter + sort bar** — Appears between the header and the recipe grid when recipes are loaded. Left side: horizontally scrollable chip group showing all unique tags from the loaded recipes; chips are multi-select with OR logic; an "All" chip is active by default and deselects when any tag is picked. Right side: sort dropdown with Default, Prep time: low to high, Prep time: high to low. Filtering and sorting are applied simultaneously via a single `useMemo` derivation (`filteredCards`) that replaces the previous `visibleCards`.
- **Prep time on recipe cards** — `extractPrepTime()` parses `**Prep time:**` (AI extractor format) or `**PrepTime:**` from recipe markdown. Displayed as a `⏱ {time}` tag at the end of the card's tag row. Only rendered when present, so existing cards without prep time are unaffected.
- **Prep time sort parser** — `parsePrepMinutes()` converts common time strings (`"30 min"`, `"1 hr"`, `"1h 30m"`, `"2 hours"`) to minutes. Recipes with no prep time sort to the end.
- **Filter empty state** — When active filters produce zero results, shows "No recipes match your filters." with a "Clear filters" button that resets both tag selection and search query.

### Changed

- **Color palette** — All primitive tokens updated: surfaces moved warmer (parchment/linen/taupe), green primitives shifted to sage/moss, orange primitives to terracotta/rust. Semantic tokens unchanged.
- **Body font** — `--font-body` changed from Spectral to Fraunces. Mono stack added as `--font-mono` (Martian Mono with JetBrains Mono fallback). Google Fonts import updated accordingly.

### Removed (CSS cleanup)

- Dead layout utilities `.row`, `.col`, `.wrap` from `commeat.css` — never used in any component; all flex layouts use Tailwind equivalents.
- Three unused semantic tokens from `tokens.css`: `--bg-sunken`, `--bg-subtle` (both equal to `--neutral-100`, zero references in source), `--border-emphasis` (equal to `--neutral-200`, zero references).

### Fixed

- `.prose h1`, `.prose h2`, `.prose h3` `padding-bottom` values replaced with spacing tokens (`var(--sp-5)`, `var(--sp-6)`, `var(--sp-5)`) — were hardcoded `px`.
- `.prose a` and `.prose a:hover` rules removed from `style.css` — were byte-for-byte duplicates of the global `a` and `a:hover` rules already in `commeat.css`.
- `.diff-add` and `.diff-del` in `commeat.css` now reference their own semantic tokens (`--diff-add-bg`, `--diff-add-bar`, `--diff-add-text`, `--diff-del-bg`, `--diff-del-bar`) instead of the raw primitive `var(--neutral-100)`.

---

## [v1.2] — UI polish · 2026-06-11

### Added

- **Parallax background** — Floating food illustrations (onion, tomato, broccoli, cheese, fish, jambon, pasta, radis, garlic, shrimp) drift at varying speeds on the Shelf page. Scoped to the homepage only to preserve readability on recipe pages.
- **Shelf search** — Search bar in the header filters recipes by title, tag, or origin in real time. Empty results use the standard `.empty` state pattern with a "Clear search" action.
- **Floating pill header** — Header styled as a floating pill with 16px margin, full border, and pill border-radius. On mobile, the search bar drops to a second row below the logo and buttons.

### Changed

- Rate limit error on the Shelf now uses the full `.empty` state (icon, heading, description, "Go to Settings" action) instead of a plain text message.
- Food illustration SVGs updated to use `currentColor` so stroke and fill inherit from CSS.

---

## [v1.1.1] — 2026-06-10

### Fixed

- GitHub read operations now also retry without auth on 403, so public repos load even when the stored token is expired or revoked.
- GitHub's unauthenticated rate limit (60 req/hour per IP) returns 403, not 429. The app now reads the response body to distinguish rate limiting from access errors, and shows "Connect a GitHub account in Settings to continue" instead of the misleading "cookbook may be private" message.

---

## [v1.1.0] — File-first architecture & UI polish · 2026-06-09

### Changed

- **Architecture** — Replaced Zustand recipe store and typed parser with a file-first model. GitHub-hosted `.md` files are now the source of truth via a new `useGitHubFiles` hook.
- **Markdown rendering** — Recipe view and editor now operate on raw Markdown (via `marked`), removing the intermediate typed-recipe layer.
- **Design tokens** — Extracted to `public/tokens.css` as a single source of truth. Removed `@theme` color entries; all components reference semantic tokens only.

### Added

- **Read-only mode** — Shelf and recipes are browsable without a GitHub account; a sign-in prompt appears on write actions.
- **Recipe images** — Images in recipe Markdown are resolved from the repo and shown in the recipe view and as shelf card thumbnails.
- **Commeat logo** — SVG logo replaces the plain text title in the shelf header.
- **Tags on cards** — Recipe tags from frontmatter now appear on shelf cards.

### Fixed

- GitHub read operations retry without auth on 401, so public repos load even with an expired token.
- Write errors are now distinguished from read errors with clearer user-facing messages.
- New repos are created public by default.

---

## [v1.0.0] — SVG icon files · 2026-06-05

Extracted all inline SVG icon functions to standalone files in `src/assets/icons/`. No visual changes.

### Added

- `src/assets/icons/` — 7 SVG files: `back.svg`, `book.svg`, `close.svg`, `edit.svg`, `github.svg`, `plus.svg`, `settings.svg`
- `vite-plugin-svgr` dev dependency — enables `import Icon from './icon.svg?react'` syntax
- `src/vite-env.d.ts` — type reference for `vite-plugin-svgr/client`

### Changed

- `Dialog`, `SyncErrorBanner`, `Shelf`, `Settings`, `Recipe` — inline `function *Icon()` components replaced with SVG imports. `CloseIcon` and `XIcon` consolidated into a single `close.svg` (size passed as prop where needed).

---

## [v1.4] — Design system migration · 2026-06-21

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
