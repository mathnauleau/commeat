# Commeat v1.1 — File-first refactor brief

## What changed and why

The v1.0 data layer was over-engineered. Recipes were stored in a Zustand store, parsed through a two-way serializer, and typed as rigid TypeScript interfaces — duplicating what was already in GitHub and adding unnecessary complexity.

v1.1 simplifies to a **file-first architecture**: the `.md` file in the GitHub repo is the single source of truth. The app reads it, renders it with styling, and writes it back on save. No store, no parser, no type juggling.

---

## New architecture

### Data flow

```
GitHub repo (.md files)
        ↓ read
    App renders styled Markdown
        ↓ edit
    App writes .md back to GitHub
```

### What a recipe file looks like

Plain Markdown. No enforced schema, no required frontmatter. The user or the app can write whatever they want:

```markdown
# Grandma Marie's Tomato Sauce

**Origin:** Grandma Marie
**Prep time:** 15min · **Cook time:** 45min · **Serves:** 4

> "Always use San Marzano, never anything else."

## Ingredients

- 800g San Marzano tomatoes, crushed by hand
- 3 garlic cloves, sliced thin
- 1 handful fresh basil

## Steps

1. Warm olive oil in a wide pan over medium heat
2. Add garlic, cook until just golden
3. Add tomatoes, simmer 40 minutes
4. Tear in basil at the last minute

## Notes

Patience on step 3 is the secret.

---
*Last committed: 2024-12-24 · v3*
```

No frontmatter required. No rigid fields. Just Markdown.

### Repo structure

```
commeat-recipes/
  recipes/
    grandmas-marie-tomato-sauce.md
    pancakes.md
  shelf.json
  README.md
```

---

## What gets removed

| Was | Now |
|-----|-----|
| `store/recipes.ts` (Zustand) | Removed — GitHub is the store |
| `lib/parser.ts` | Removed — no serialization needed |
| `types/recipe.ts` | Removed — no rigid type |
| `lib/extractor.ts` structured output | Simplified — AI dumps plain Markdown |
| `hooks/useRecipes.ts` | Replaced by `hooks/useGitHubFiles.ts` |

---

## What gets kept

| Layer | Role |
|-------|------|
| `lib/github.ts` | Read, write, list, delete `.md` files |
| `shelf.json` + `ShelfConfig` | Global theme config |
| `lib/themes.ts` | Theme dictionary |
| `lib/readme.ts` | Auto-generates repo README |
| `components/ui/` | All primitives unchanged |
| `components/recipes/RecipeCard.tsx` | Reads title from first `# heading` in the file |
| `components/recipes/RecipeView.tsx` | Renders raw Markdown as styled HTML |
| `components/recipes/ImportDialog.tsx` | AI extracts recipe → dumps as plain Markdown |
| `pages/Shelf.tsx` | Lists files from GitHub, renders as cards |
| `pages/Recipe.tsx` | Fetches file from GitHub, renders it |
| `pages/Settings.tsx` | GitHub connection + shelf config |

---

## New hooks

### `hooks/useGitHubFiles.ts`
Replaces `useRecipes.ts`. Exposes:
- `files` — list of `.md` file paths in `recipes/`
- `fetchFile(path)` — returns raw Markdown string
- `saveFile(path, content, message)` — writes to GitHub
- `deleteFile(path, message)` — deletes from GitHub
- `loading`, `error` states

---

## Rendering

Use `marked` or `remark` to convert Markdown → HTML, then apply Tailwind typography styles (`prose` class). The theme from `shelf.json` controls fonts, colors, and spacing — not the Markdown content.

---

## Import flow (simplified)

1. User pastes URL, text, or photo
2. AI extracts content and returns **plain Markdown** — no JSON, no structured type
3. User reviews and edits the raw Markdown in a textarea
4. On commit → `saveFile('recipes/[slug].md', content, message)`

Slug is still derived from the first `# heading` in the file.

---

## Commit flow (simplified)

1. User taps Edit on a recipe
2. Raw Markdown renders in a textarea
3. User edits freely
4. On commit → `saveFile()` writes directly to GitHub
5. Optional commit message as before

---

## What stays the same for the user

- Import flow looks identical
- Recipe reading view looks identical
- Commit message prompt looks identical
- GitHub sync behaviour looks identical

The simplification is entirely under the hood.

---

## Out of scope for this refactor

- No UI changes beyond what's required by the new data layer
- No new features
- No MLP work
