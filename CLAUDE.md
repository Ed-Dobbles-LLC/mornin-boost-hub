# Dobbles.AI — Project Instructions

All standards, behavioral contract, brand, stack, and deployment rules live in DOCTRINE.md.
Read DOCTRINE.md as the single source of truth for this project.
Project-specific context (what we're building, current state, constraints) lives in PROJECT.md.

## Repo Layout

Two apps in one repo, sharing components:

**Public portfolio** — `/`, `/about`, `/projects`, `/projects/:slug`, `/contact`, `/login`
- Components in `src/components/site/` (SiteNav, SiteFooter)
- Pages use semantic Tailwind tokens (`bg-primary`, `text-foreground`)

**Private hub** — `/hub` (behind Supabase magic-link auth)
- Widgets: LaunchButtons (quick-launch grid), MyTools (Railway app links), VocabBox (Supabase-backed, 364 words), RecipeCard (TheMealDB API), FactBox (uselessfacts API), HeadlinesBox (Hacker News via edge function)
- **LaunchButtons** (`src/components/LaunchButtons.tsx`): Grid of icon buttons for Google apps, AI tools, and productivity apps. Each entry has `name`, `url`, `icon`, `color`.
- **MyTools** (`src/components/MyTools.tsx`): Card list of Railway-hosted tools the user has built (Job Hunt, Personal Podcasts, Chess Coach, AR Intel). Each entry has `name`, `description`, `url`, `icon`, `status`. When the user asks to add a new tool/app, add it here.
- All widget components use semantic tokens (`bg-primary`, `bg-accent`, `bg-secondary`, `text-primary`, `text-accent`)

## Current Deployment

- **Hosting:** Railway (static SPA via `npx serve dist -s`)
- **Domain:** `dobbles.ai` (custom domain on Railway — must be added manually in Railway dashboard if redeployed)
- **Build:** `npm ci && npm run build` (see `railway.toml`)
- **Auto-deploy:** Railway watches the branch set in Railway dashboard → Settings → Source → "Branch connected to production". Ensure this is set to `main`. (It was previously misconfigured to an old `claude/*` branch, which caused deploys to silently use stale code.)
- **Supabase:** Handles auth, contacts table, vocabulary table, edge functions

### Deployment Workflow (Claude Code sessions)

Claude Code can only push to `claude/*` branches, not `main` directly. To get changes deployed:

1. Commit and push changes to the `claude/<branch-name>` feature branch
2. The user merges the PR on GitHub (`claude/<branch>` → `main`)
3. Railway auto-deploys from `main`

**Important:** Always ensure the feature branch is rebased on `origin/main` before pushing, so the PR merges cleanly. If the branch has diverged, reset it with `git checkout -B <branch> origin/main` and re-apply changes.

## Auth

Magic link auth works end-to-end. Supabase Site URL is set to `https://dobbles.ai`. The `Login.tsx` component uses `window.location.origin` for `emailRedirectTo`.

## Known Deviations from Doctrine

### Colors — FIXED
CSS HSL values now match the doctrine hex palette exactly:
- Coral Red: `#DB5461` → `hsl(354 64% 59%)`
- Navy: `#060A57` → `hsl(237 90% 18%)`
- Steel Blue: `#225A8E` → `hsl(209 63% 35%)`

### Fonts
Doctrine specifies Montserrat. This site uses Instrument Serif (headings) + DM Sans (body). This is a deliberate aesthetic choice for the portfolio — intentional exception.

### Dark Mode — FIXED
Dark mode toggle implemented via `next-themes`. Light/dark toggle in SiteNav and Hub header. `darkMode: ["class"]` in Tailwind, dark CSS variables in `index.css`.

### Stack
React + Supabase instead of doctrine's default Python + Railway. Justified: this is a frontend-only site. See PROJECT.md for details.

## Supabase
- **Project ID:** `xwguviuinmafenlqwtka`
- **Client:** `src/integrations/supabase/client.ts` (URL and anon key are hardcoded, not from env vars — Lovable-generated pattern)
- **Tables:** `contacts` (form submissions), `vocabulary` (364 Spanish word pairs)
- **Edge Functions:** `fetch-news` (Hacker News)
- **Auth:** Magic link email, RLS on both tables
- **Env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (referenced in `.env` but the client.ts file doesn't actually read them — it uses hardcoded values)

## Dev
```
npm run dev        # port 8080
npm run build      # production build → dist/
```
60+ shadcn/ui files in `src/components/ui/` — stock components, don't modify unless necessary.
This repo is the sole source of truth. No external tools (Lovable, etc.) push to it.

## Remaining lint issues
2 errors in stock shadcn/ui files (`command.tsx`, `textarea.tsx`) — empty interface types. Not worth modifying stock components.
8 warnings — all `react-refresh/only-export-components` in shadcn/ui and AuthProvider. Expected.

## Next Steps (prioritized)

1. **Supabase client cleanup** — Consider reading URL/key from env vars instead of hardcoded values (low priority, Lovable pattern).
