# Claude Code prompt — Commeat v1.1 file-first refactor

---

Read CLAUDE.md and commeat-refactor-v1.1.md carefully before touching anything.

We are refactoring the data layer from a Zustand + parser architecture to a file-first architecture. The `.md` file in the GitHub repo becomes the single source of truth. The app reads it, renders it styled, and writes it back on save. No store, no parser, no rigid types.

This is a phased refactor. Complete each phase fully before moving to the next.

---

## Phase 1 — Remove the old data layer

- Delete `store/recipes.ts`
- Delete `lib/parser.ts`
- Delete `types/recipe.ts`
- Delete `hooks/useRecipes.ts`
- Do not fix any broken imports yet — just delete these files and note what breaks

---

## Phase 2 — New GitHub file hook

Create `hooks/useGitHubFiles.ts` to replace `useRecipes.ts`:

```ts
// Exposes:
files: string[]                          // list of .md paths in recipes/
fetchFile(path: string): Promise<string> // returns raw Markdown string
saveFile(path: string, content: string, message: string): Promise<void>
deleteFile(path: string, message: string): Promise<void>
loading: boolean
error: string | null
```

- `files` is populated by calling `lib/github.ts` listRecipes() on mount
- All reads and writes go directly to GitHub — no local cache
- Loading and error states are explicit — never swallowed

---

## Phase 3 — Update lib/github.ts

Ensure these methods exist and work correctly:
- `listRecipes()` — returns array of file paths under `recipes/`
- `readFile(path)` — returns raw Markdown string
- `commitFile(path, content, message)` — creates or updates file
- `deleteFile(path, message)` — deletes file

Remove any code that references the old Recipe type or Zustand store.

---

## Phase 4 — Update pages/Shelf.tsx

- Replace `useRecipes` with `useGitHubFiles`
- `files` is now a list of paths — derive the display title from the filename:
  - `recipes/grandmas-tomato-sauce.md` → `"Grandmas Tomato Sauce"` (de-slug)
  - Or fetch each file and read the first `# heading` for the real title
- Fetch titles lazily — show filename-derived title immediately, replace with `# heading` once fetched
- Empty state, loading state, and error state all handled

---

## Phase 5 — Update pages/Recipe.tsx

- On mount: call `fetchFile(path)` to get raw Markdown
- Render Markdown as styled HTML using `marked` (already installed)
- Apply Tailwind `prose` class for typography
- Edit mode: render raw Markdown in a `<Textarea>` — user edits freely
- On commit: call `saveFile(path, content, message)`
- Slug for new recipes derived from first `# heading`:

```ts
function recipeSlug(markdown: string): string {
  const title = markdown.match(/^#\s+(.+)/m)?.[1] ?? 'untitled'
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
```

---

## Phase 6 — Update components/recipes/ImportDialog.tsx

- AI extraction now returns **plain Markdown**, not a structured JSON object
- Update the extractor prompt to return a well-formatted Markdown recipe
- Review step shows the raw Markdown in a `<Textarea>` — user can edit freely before committing
- On commit: `saveFile('recipes/[slug].md', markdownContent, message)`

---

## Phase 7 — Update lib/extractor.ts

Update all three extraction methods (URL, text, image) to return `Promise<string>` (plain Markdown) instead of `Promise<Partial<Recipe>>`.

Extraction prompt template:

```
Extract this recipe and return it as clean Markdown only.
Use this structure:

# [Recipe title]

**Origin:** [where it came from]
**Prep time:** [time] · **Cook time:** [time] · **Serves:** [number]

## Ingredients
- [ingredient]

## Steps
1. [step]

## Notes
[any notes]

Return only the Markdown. No preamble, no explanation, no code fences.
```

---

## Phase 8 — Update lib/readme.ts

- `generateReadme()` now takes `files: string[]` instead of `recipes: Recipe[]`
- Derive recipe names from filenames (de-slug) for the index table
- Keep the same output format

---

## Phase 9 — Fix all remaining broken imports and verify

- Audit every file for references to the deleted types and hooks
- Replace all `useRecipes` references with `useGitHubFiles`
- Remove all `Recipe`, `CommitEntry` type imports
- TypeScript must compile cleanly with zero errors

---

## Phase 10 — Smoke test

Verify the full user flow end-to-end:
- [ ] Shelf loads and lists recipes from GitHub
- [ ] Clicking a recipe fetches and renders it correctly
- [ ] Editing a recipe and committing writes the updated `.md` to GitHub
- [ ] Importing a new recipe via ImportDialog creates a new `.md` file in GitHub
- [ ] Deleting a recipe removes the file from GitHub
- [ ] README updates after every commit
- [ ] Sync failure banner appears on GitHub errors

---

## Rules

- Do not add any new features
- Do not change any UI layout or styling
- Do not touch shelf.json, lib/github.ts auth flow, or Settings.tsx beyond what phases 2–8 require
- TypeScript must compile cleanly at the end of every phase
- Stop after Phase 10 — do not proceed to any MLP work
