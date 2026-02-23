# Dobbles.AI — Project Instructions

All standards, behavioral contract, brand, stack, and deployment rules live in DOCTRINE.md.
Read DOCTRINE.md as the single source of truth for this project.
Project-specific context (what we're building, current state, constraints) lives in PROJECT.md.

## Repo Layout

Two apps in one repo, sharing components:

**Public portfolio** — `/`, `/about`, `/projects`, `/projects/:slug`, `/contact`, `/login`
- Components in `src/components/site/` (SiteNav, SiteFooter)
- Pages use semantic Tailwind tokens (`bg-primary`, `text-foreground`) — this is the right pattern

**Private hub** — `/hub` (behind Supabase magic-link auth)
- Widgets: LaunchButtons, VocabBox, RecipeCard, FactBox, HeadlinesBox, CalendarBox
- Hub page (`src/pages/Hub.tsx`) uses semantic tokens; widget components still use hardcoded `dobbles-*` utility classes

**Dead code:** `src/pages/Index.tsx` is orphaned — never routed in App.tsx. Delete it.

## Known Deviations from Doctrine

### Colors
The CSS HSL values don't match the doctrine hex palette. Current values are approximations, not exact conversions. If brand precision matters, update `src/index.css` `:root` variables to match:
- Coral Red: doctrine `#DB5461` → needs `hsl(354 64% 59%)`, currently `hsl(0 65% 55%)`
- Navy: doctrine `#060A57` → needs `hsl(237 90% 18%)`, currently `hsl(213 100% 12%)`
- Steel Blue: doctrine `#225A8E` → needs `hsl(209 63% 35%)`, currently `hsl(213 50% 28%)`

### Fonts
Doctrine specifies Montserrat. This site uses Instrument Serif (headings) + DM Sans (body). This is a deliberate aesthetic choice for the portfolio — document as intentional exception or migrate.

### Dark Mode
Doctrine says dark mode default. Site runs light mode. `darkMode: ["class"]` is configured in Tailwind but the `dark` class is never applied.

### Stack
React + Supabase instead of doctrine's default Python + Railway. Justified: this is a frontend-only site. See PROJECT.md for details.

## Widget Class Pattern
Hub widget components (FactBox, RecipeCard, HeadlinesBox, etc.) use hardcoded `dobbles-red`, `dobbles-navy`, `dobbles-blue` classes. The Hub page itself and all public pages use semantic tokens (`bg-primary`, `text-primary-foreground`). Migrate widgets to semantic tokens when touching them.

## Supabase
- **Project ID:** `xyulaaievgvkfrwwhgrw`
- **Tables:** `contacts`, `vocabulary` (364 Spanish word pairs)
- **Edge Functions:** `fetch-news` (Hacker News), `google-calendar` (public calendars only)
- **Auth:** Magic link, RLS on both tables
- **Env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (in `.env`, not committed)

## Dev
```
npm run dev        # port 8080
```
60+ shadcn/ui files in `src/components/ui/` — stock components, don't modify unless necessary.
Lovable may push commits to this repo — watch for merge conflicts.
