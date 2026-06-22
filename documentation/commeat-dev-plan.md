# Commeat — Claude Code Development Plan
*MVP only. Build the structure before the surface.*

---

## Ground rules

- Complete each session fully before moving to the next
- Every session ends with a working, committable state — no half-built features
- Do not implement anything listed under **Out of Scope** even if it seems easy
- When in doubt, refer to `commeat-brief.md` as the source of truth

---

## Session 1 — Project scaffold & design foundation

**Goal**: a running app with the right bones. Nothing works yet, but everything is in place.

**Tasks**:
- [ ] Init Vite + React + TypeScript project: `commeat`
- [ ] Install and configure Tailwind CSS
- [ ] Add design tokens to `tailwind.config.ts` (colors, typography, spacing, radius)
- [ ] Install fonts: Fraunces + DM Sans via Fontsource
- [ ] Set up `globals.css` with base typography styles
- [ ] Create folder structure: `components/ui`, `components/layout`, `components/recipes`, `pages`, `hooks`, `lib`, `store`, `types`
- [ ] Scaffold empty index files for each folder
- [ ] Verify app runs at localhost with correct font and background color (`#F2F5F0`)

**Done when**: app loads, shows sage green background, Fraunces heading renders correctly.

---

## Session 2 — Types & data model

**Goal**: the entire data model defined in TypeScript before any UI is built.

**Tasks**:
- [ ] `types/recipe.ts` — define:
  - `Recipe` (title, origin, importedFrom, committedAt, version, forkOf, tags, prepTime, cookTime, servings, quote, ingredients, steps, notes)
  - `CommitEntry` (version, date, message)
  - `ShelfConfig` (theme, cardLayout, printFormat)
- [ ] `types/index.ts` — re-export all types
- [ ] Write 2–3 mock recipe objects in `lib/mockData.ts` for use in development

**Done when**: TypeScript compiles cleanly, mock data matches the `Recipe` type exactly.

---

## Session 3 — Markdown parser

**Goal**: reliable two-way conversion between `.md` files and `Recipe` objects.

**Tasks**:
- [ ] Install `gray-matter` (frontmatter parsing) and `marked` or `remark` (body parsing)
- [ ] `lib/parser.ts`:
  - `parseRecipe(markdown: string): Recipe` — frontmatter → metadata, body → fields
  - `serializeRecipe(recipe: Recipe): string` — Recipe → valid `.md` string
  - `appendCommit(recipe: Recipe, message: string): Recipe` — adds a new commit entry, bumps version
- [ ] Write unit tests for round-trip fidelity (parse → serialize → parse = same object)

**Done when**: a sample `.md` file parses to a `Recipe` cleanly, and serializes back to identical markdown.

---

## Session 4 — UI primitives

**Goal**: a small, consistent component library to build all screens from.

**Tasks**:
- [ ] `Button` — variants: `primary`, `secondary`, `ghost`; sizes: `sm`, `md`
- [ ] `Card` — surface-raised, border, radius-lg, padding variants
- [ ] `Input` — text input with label, placeholder, focus state
- [ ] `Textarea` — multiline input, same style as Input
- [ ] `Badge` — small pill label with color variants
- [ ] `Tag` — origin/category tag (e.g. "Grandma Marie", "Italian")
- [ ] `IconButton` — icon-only button (used for "+", edit, etc.)
- [ ] `Dialog` — modal overlay wrapper with backdrop, used for ImportDialog later
- [ ] Verify all components use design tokens — no hardcoded hex values

**Done when**: a primitive gallery page renders all components correctly in all states.

---

## Session 5 — Shelf page

**Goal**: the home screen with a working recipe grid, driven by mock data.

**Tasks**:
- [ ] `pages/Shelf.tsx` — main layout: header + recipe grid
- [ ] `components/recipes/RecipeCard.tsx` — card with placeholder illustration, title, origin tag, prep time
- [ ] Grid layout: `auto-fit, minmax(220px, 1fr)` — responsive columns
- [ ] Empty state: no recipes yet — illustration placeholder + "Commit your first recipe" CTA
- [ ] "+" `IconButton` in header (wired up in Session 8)
- [ ] `store/recipes.ts` — Zustand store, seeded with mock data for now
- [ ] `hooks/useRecipes.ts` — reads from store

**Done when**: shelf renders mock recipes as cards, empty state shows correctly when store is empty.

---

## Session 6 — Recipe view page

**Goal**: a clean, readable recipe page with full commit history.

**Tasks**:
- [ ] `pages/Recipe.tsx` — full reading layout
- [ ] Header: title (Fraunces), origin tag, prep/cook time, servings
- [ ] Quote block — rendered only when `recipe.quote` is present
- [ ] Ingredients list — clean typeset list
- [ ] Steps list — numbered, readable line-height
- [ ] Notes section — rendered only when present
- [ ] `components/recipes/CommitHistory.tsx` — version table: version number, date, message
- [ ] Edit `IconButton` in header (wired up in Session 7)
- [ ] Back navigation to Shelf

**Done when**: clicking a recipe card on the Shelf navigates to a fully rendered recipe page.

---

## Session 7 — Inline editor & commit flow

**Goal**: edit any recipe field and commit the change as a new version.

**Tasks**:
- [ ] Edit mode toggle on Recipe page — switches all fields to editable inputs/textareas
- [ ] Edited fields highlight subtly (border color change)
- [ ] "Commit changes" button appears when in edit mode
- [ ] Commit message input — optional, placeholder: *"What changed?"*
- [ ] On commit: `appendCommit()` called, version bumped, new entry in commit history
- [ ] Zustand store updates, Recipe page re-renders with new version
- [ ] Cancel edit — reverts all changes, exits edit mode

**Done when**: a recipe can be edited, committed, and the new version appears in commit history without a page reload.

---

## Session 8 — Import dialog & AI extraction

**Goal**: the full import flow, from "+" tap to committed recipe.

**Tasks**:
- [ ] Wire "+" IconButton on Shelf to open `Dialog`
- [ ] `components/recipes/ImportDialog.tsx` — 3 steps:
  - **Step 1 — Input**: single field accepting URL, text, or photo upload; auto-detect type
  - **Step 2 — Review**: parsed recipe fields, all editable inline; origin field prominent and renameable
  - **Step 3 — Commit**: optional commit message, "Commit recipe" CTA
- [ ] `lib/extractor.ts`:
  - `extractFromUrl(url: string): Partial<Recipe>` — fetch + AI parse
  - `extractFromText(text: string): Partial<Recipe>` — AI structuring
  - `extractFromImage(file: File): Partial<Recipe>` — OCR + AI structuring
- [ ] On commit: recipe added to Zustand store, dialog closes, Shelf updates
- [ ] Loading state during extraction — skeleton or animated indicator

**Done when**: a URL can be pasted, parsed, reviewed, and committed — recipe appears on the Shelf.

---

## Session 9 — GitHub sync

**Goal**: every commit syncs to a real GitHub repo. The user owns their data.

**Tasks**:
- [ ] `lib/github.ts`:
  - GitHub OAuth flow (token-based)
  - `initRepo()` — creates `commeat-[username]` repo if it doesn't exist
  - `commitFile(path, content, message)` — creates or updates a file via GitHub API
  - `readFile(path)` — reads a file from the repo
  - `listRecipes()` — lists all `.md` files in `/recipes`
- [ ] `hooks/useGitHub.ts` — wraps lib, exposes auth state + sync methods
- [ ] On every in-app commit → `commitFile()` called in background
- [ ] On app load → `listRecipes()` to hydrate Zustand store from repo
- [ ] `shelf.json` synced on theme change

**Done when**: a recipe committed in the app appears as a real `.md` file in the GitHub repo.

---

## Session 10 — README auto-generation

**Goal**: the repo always has a human-readable index of all recipes.

**Tasks**:
- [ ] `lib/readme.ts` — `generateReadme(recipes: Recipe[]): string`
  - Title: `# Commeat — [username]'s Cookbook`
  - Table: recipe name, origin, tags, last committed
- [ ] Called automatically after every commit or delete
- [ ] Committed to repo root as `README.md`

**Done when**: the GitHub repo README lists all recipes and updates on every commit.

---

## Session 11 — Settings page & polish

**Goal**: GitHub connection UI + final MVP polish pass.

**Tasks**:
- [ ] `pages/Settings.tsx`:
  - GitHub connection status + connect/disconnect button
  - Connected repo link
  - Theme selector (single option for MVP — Botanical)
- [ ] Loading states: skeleton cards on Shelf while loading from GitHub
- [ ] Error states: failed extraction, GitHub sync failure — clear messaging
- [ ] Empty states: double-check all screens have designed empty states
- [ ] Accessibility pass: aria labels, keyboard navigation, 44px touch targets
- [ ] Final token audit: no hardcoded hex or px values anywhere

**Done when**: app is stable end-to-end, all states handled, no raw error messages exposed to the user.

---

## Out of scope — do not build in any session

- Bookshelf / spine UI
- Watercolor illustration generation
- Recipe forking
- Print / PDF export
- Book aging / wear system
- Public repo sharing
- Multiple themes beyond Botanical

---

## Reference

- Full product brief: `commeat-brief.md`
- Data model: `types/recipe.ts` (Session 2)
- Design tokens: `tailwind.config.ts` (Session 1)
