# Token Usage Report — Commeat

Generated: 2026-06-21

Summary

- Scope: `src/` — scanned for `px` occurrences. Tokens are defined in `src/styles/tokens.css` (these are OK).
- Outcome: token definitions use `px` (expected). The scan flagged inline `px` values in components/pages and some CSS files. Below are compact entries with suggested replacements (report-only).

Token reference (selected)

- Spacing tokens: `--sp-1:4px`, `--sp-2:8px`, `--sp-3:12px`, `--sp-4:16px`, `--sp-5:24px`, `--sp-6:32px`, `--sp-7:48px`, `--sp-8:64px`, `--sp-9:96px`.
- Radius tokens: `--r-sm:6px`, `--r-md:10px`, `--r-lg:16px`, `--r-xl:24px`.
- Type tokens: `--t-lead:20px`, `--t-h1:40px`, `--t-display:56px`, etc.

Notes on suggestion rules

- Exact match -> replace with token (e.g. `16px` -> `var(--sp-4)`).
- Radius properties may prefer `--r-*` tokens (e.g. `borderRadius: '6px'` -> `var(--r-sm)`).
- If no close token exists (e.g. `44px`, `40px`, `360px`) the report suggests either: use nearest token (with note) or add a new semantic token (recommended for repeated values).
- All suggestions are report-only; no edits applied.

Findings & suggested replacements (compact)

- src/components/layout/Header.tsx
  - top: '24px' => suggested: `var(--sp-5)` (24px)
  - margin: '24px' => suggested: `var(--sp-5)` (24px)
  - borderRadius uses `clamp(24px, ...)` => radius `24px` => suggest `var(--r-xl)` when used as radius; if used in clamp for responsive radius, keep literal but prefer token where feasible.

- src/components/layout/SyncErrorBanner.tsx
  - style: minWidth: '32px' => `var(--sp-6)` (32px)
  - style: minHeight: '32px' => `var(--sp-6)` (32px)

- src/components/layout/SyncToast.tsx
  - maxWidth: '360px' => no matching token; suggested: add a semantic token `--content-max-w` (e.g. `--content-max-w:360px`) or use responsive CSS (e.g. `max-width: min(36rem, 100%)`).

- src/components/recipes/CommitBar.tsx
  - backdropFilter: 'blur(8px)' => `8px` ~ `var(--sp-2)` (8px) if you want a tokenized blur value; otherwise keep but consider a token for repeated blur radii.

- src/components/recipes/ImportDialog.tsx
  - height: `i === 0 ? '20px' : '16px'` => `20px` matches `--t-lead` (typography) but for height prefer spacing tokens: `16px` -> `var(--sp-4)`; `20px` -> consider `var(--t-lead)` only if the value is typographic; else add `--sp-?` (e.g. `--sp-4-5`) or use `var(--sp-5)` (24px) if acceptable.
  - border: '1px solid var(--feedback-error-border-subtle)' — contains `1px` border width; consider adding `--border-width` token if you want to standardize (e.g. `--border-width: 1px`).

- src/components/recipes/RecipeCard.tsx
  - paddingBottom: '16px' => `var(--sp-4)` (16px)
  - ClockIcon style: width: '12px', height: '12px', marginRight: '2px' => `12px` -> `var(--sp-3)`; `2px` -> no spacing token (suggest keep or add `--sp-tiny:2px` if repeated).

- src/components/ui/Dialog.tsx
  - borderBottom: '1px solid var(--border-default)' — `1px` border width: consider `--border-width` token.

- src/components/ui/Input.tsx
  - borderWidth: '2px' => no existing token; suggest adding `--border-width-strong:2px` or use `1px` token when appropriate.

- src/components/ui/Textarea.tsx
  - borderWidth: '2px' => same as Input.

- src/pages/Recipe.tsx
  - gap: '6px' => no exact spacing token (6px exists as `--r-sm` radius). Suggestions: use nearest spacing `var(--sp-2)` (8px) or add a small spacing token (e.g. `--sp-1-5:6px`).
  - minHeight: '44px' => no token; recommend adding `--touch-min:44px` or use nearest `var(--sp-7)` (48px) if acceptable.
  - padding: '0 4px' => `4px` -> `var(--sp-1)` (4px)
  - inline gap: '8px' => `var(--sp-2)` (8px)
  - icon sizes: '24px' => no exact token but `24px` == `--sp-5` (24px) -> `var(--sp-5)`.

- src/pages/Settings.tsx
  - style: width: '48px', height: '48px' => `var(--sp-7)` (48px)
  - inline padding: '1px 5px' => `1px` no token; `5px` no token (suggest add small tokens or use nearest `--sp-1`/`--sp-2`)
  - gap: '6px' => see above (suggest `var(--sp-2)` or add token)
  - minHeight: '44px' => see Recipe (suggest add `--touch-min`)

- src/pages/Shelf.tsx
  - Logo height: '44px' => no token; suggest `--logo-height` or use nearest `var(--sp-7)` (48px) if acceptable.
  - height: '40px' => no token; suggest adding `--card-header-height:40px` or nearest `var(--sp-6)` (32px) / `var(--sp-7)` (48px) depending on design choice.
  - padding: '0 12px' => `12px` -> `var(--sp-3)`
  - borderRadius: '9999px' => pill — keep as-is or use `var(--r-pill)` (999px) if preferred.
  - padding: '8px' => `var(--sp-2)`
  - padding: '6px 10px' => `6px` -> close to `--r-sm` (radius) but for spacing suggest `var(--sp-2)` (8px) or add `6px` token; `10px` -> `var(--r-md)` exists (10px) but it's a radius token; consider adding `--sp-?` if used as spacing.

- Common CSS files (noted for awareness)
  - `src/styles/components.css` and `src/styles/style.css` contain many `px` values — these are component styles and may be acceptable; consider normalizing by replacing repeated values with tokens where meaningful.
  - `src/styles/tokens.css` contains the token definitions (expected `px` usage).

Recommendations

- Replace exact matches with tokens where available (many `4/8/12/16/24/32/48px` cases).
- For small/one-off numbers (1px, 2px, 5px, 40px, 44px, 360px), either create semantic tokens (preferred for repeated use) or leave if genuinely one-off (but document rationale).
- Add a lightweight script/CI job (suggested next step) to auto-report new `px` occurrences in changed files (report-only, `warning`) per the agent policy.

---

This report is generated automatically. If you want, I can:

- Create the `reports/token-usage-report.json` with machine-readable entries.
- Propose a codemod PR that replaces exact matches with tokens (report-only suggestions in a patch file).
- Run the scan restricted to only changed files in the current branch/PR.

Which next step would you like?
