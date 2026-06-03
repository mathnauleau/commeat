# Commeat
### *Your recipes, committed.*

Commeat is a personal cookbook app where recipes are Markdown files and every change is a commit. The git metaphor is the soul of the product — not a tool for developers, but a cookbook for people who care about their recipes and want to own them forever.

Fork. Cook. Commit.

---

## What it does

- **Capture** recipes from anywhere — paste a URL, photograph a handwritten card, or import from Instagram
- **Read** them in a warm, typeset layout designed for the kitchen
- **Edit** and commit changes over time — every tweak is a named version with a message
- **Sync** your entire cookbook to a real GitHub repo you own

Your recipes live as plain `.md` files in a GitHub repository. No lock-in. No proprietary format. Open them in any text editor, fork them, share them.

---

## Structure

```
commeat/
├── src/
│   ├── components/
│   │   ├── ui/              # Primitives: Button, Card, Input, Badge, Tag, Dialog
│   │   ├── layout/          # Shell, Header, PageWrapper
│   │   └── recipes/         # RecipeCard, RecipeView, CommitHistory, ImportDialog
│   ├── pages/
│   │   ├── Shelf.tsx         # Home — recipe grid
│   │   ├── Recipe.tsx        # Recipe reading + editing
│   │   └── Settings.tsx      # GitHub connection + preferences
│   ├── hooks/
│   │   ├── useRecipes.ts
│   │   ├── useImport.ts
│   │   └── useGitHub.ts
│   ├── lib/
│   │   ├── parser.ts         # Markdown ↔ Recipe object
│   │   ├── extractor.ts      # AI extraction (URL, OCR, text)
│   │   ├── github.ts         # GitHub API client
│   │   └── readme.ts         # Auto-generates repo README
│   ├── store/
│   │   └── recipes.ts        # Zustand global store
│   ├── types/
│   │   └── recipe.ts         # Recipe, CommitEntry, ShelfConfig
│   └── styles/
│       └── globals.css
├── commeat-brief.md           # Full product brief
├── commeat-dev-plan.md        # Claude Code session plan
└── README.md
```

---

## Recipe format

Each recipe is a plain Markdown file with YAML frontmatter:

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
## Steps
## Notes
## Commit History
```

Human-readable, portable, editable without the app.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Fonts | Fraunces (display) + DM Sans (body) |
| Sync | GitHub API (OAuth) |
| Extraction | Anthropic API (Claude) |

---

## Roadmap

**MVP** — capture, read, commit, sync to GitHub

**MLP** — bookshelf UI, watercolor illustrations, recipe forking, print to PDF

**Later** — book aging system, public cookbook sharing, print-on-demand

---

## License

MIT
