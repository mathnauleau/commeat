# Commeat — Session Log

## Session 1 — Scaffold & design foundation
Vite + React + TypeScript project with Tailwind, Fraunces + DM Sans fonts, and the full design token palette (sage surface, forest green accent, content hierarchy). Folder structure established.

## Session 2 — Types & mock data
`Recipe`, `CommitEntry`, and `ShelfConfig` TypeScript interfaces defined. Three mock recipes written in `lib/mockData.ts` to drive development through the early sessions.

## Session 3 — Markdown parser
`lib/parser.ts` with `parseRecipe`, `serializeRecipe`, and `appendCommit`. Gray-matter for YAML frontmatter. 16 unit tests covering round-trip fidelity, edge cases, and commit versioning.

## Session 4 — UI primitives
`Button`, `Card`, `Input`, `Textarea`, `Badge`, `Tag`, `IconButton`, `Dialog` — all using design tokens, min 44px touch targets, focus rings, and consistent variants.

## Session 5 — Shelf page
Home screen with responsive recipe grid (`auto-fill, minmax(220px, 1fr)`), `RecipeCard` component, Zustand store seeded with mock data, `useRecipes` hook, and a proper empty state with CTA.

## Session 6 — Recipe view page
Full reading layout: title, origin tag, meta badges, optional quote block, ingredients list, numbered steps, optional notes, and `CommitHistory` table. Back navigation and 404 state.

## Session 7 — Inline editor & commit flow
Edit mode toggle on the Recipe page, dirty-field highlighting, `CommitBar` for the commit message, `appendCommit` wired to bump version and append history, `useRecipeEditor` hook. Cancel reverts all changes.

## Session 8 — Import dialog & AI extraction
Three-step `ImportDialog`: URL/text/image input → AI extraction via `lib/extractor.ts` (Claude API) → editable review → commit. Extraction skeleton, error state with manual-entry fallback.

## Session 9 — GitHub sync
`lib/github.ts` with `initRepo`, `commitFile`, `deleteFile`, `readFile`, `listRecipes`. `useGitHub` hook with fire-and-forget `syncRecipe` (called after every commit) and `hydrate` (loads repo into store on app load). Auth stored in localStorage.

## Session 10 — README auto-generation
`lib/readme.ts` with `generateReadme(recipes, username)`: title, tagline, markdown table sorted by `committedAt` descending, empty state, footer. Called automatically after every `syncRecipe` and committed to `README.md` at the repo root. 8 unit tests.

## Session 11 — Settings page & polish
Settings page with GitHub connect/disconnect (avatar, repo link, PAT input with error handling) and Botanical theme selector. Hydration skeleton on the Shelf. `SyncErrorBanner` rendered app-wide for non-blocking sync failure messaging. `CommitHistory` single-commit "First version" label. Design token audit clean. Zero TypeScript errors, 24 tests passing.
