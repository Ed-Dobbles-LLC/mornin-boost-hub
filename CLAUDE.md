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
- Widgets: LaunchButtons (21 services), VocabBox (Supabase-backed, 364 words), RecipeCard (TheMealDB API), FactBox (uselessfacts API), HeadlinesBox (Hacker News via edge function)
- CalendarBox exists but is **not wired into Hub.tsx** — only works with public Google Calendars; private calendar requires OAuth 2.0
- Hub page (`src/pages/Hub.tsx`) uses semantic tokens; widget components still use hardcoded `dobbles-*` utility classes

**Dead code / unused files:**
- `src/pages/Index.tsx` — orphaned, never routed in App.tsx. Delete it.
- `src/components/RecipeCarousel.tsx` — imports `mockData.ts`, not used anywhere in the app.
- `src/data/mockData.ts` — mock recipes, vocab, facts. Only consumed by RecipeCarousel (dead). Hub uses live APIs and Supabase instead. Safe to delete with RecipeCarousel.

## Current Deployment

- **Hosting:** Railway (static SPA via `npx serve dist -s`)
- **Domain:** `dobbles.ai` (custom domain on Railway — must be added manually in Railway dashboard if redeployed)
- **Build:** `npm ci && npm run build` (see `railway.toml`)
- **Supabase:** Handles auth, contacts table, vocabulary table, edge functions

## Auth — Known Issue

Magic link auth works, but **the Supabase Site URL must be set to `https://dobbles.ai`** in Supabase Dashboard → Authentication → URL Configuration. If it's set to `localhost:3000`, magic link emails redirect to localhost after clicking. The `Login.tsx` component correctly uses `window.location.origin` for `emailRedirectTo`, so once the Site URL is correct in Supabase, auth works end-to-end.

## Known Deviations from Doctrine

### Colors
The CSS HSL values don't match the doctrine hex palette. Current values are approximations, not exact conversions. If brand precision matters, update `src/index.css` `:root` variables to match:
- Coral Red: doctrine `#DB5461` → needs `hsl(354 64% 59%)`, currently `hsl(0 65% 55%)`
- Navy: doctrine `#060A57` → needs `hsl(237 90% 18%)`, currently `hsl(213 100% 12%)`
- Steel Blue: doctrine `#225A8E` → needs `hsl(209 63% 35%)`, currently `hsl(213 50% 28%)`

### Fonts
Doctrine specifies Montserrat. This site uses Instrument Serif (headings) + DM Sans (body). This is a deliberate aesthetic choice for the portfolio — document as intentional exception or migrate.

### Dark Mode
Doctrine says dark mode default. Site runs light mode. `darkMode: ["class"]` is configured in Tailwind but the `dark` class is never applied. No toggle exists.

### Stack
React + Supabase instead of doctrine's default Python + Railway. Justified: this is a frontend-only site. See PROJECT.md for details.

## Widget Class Pattern
Hub widget components (LaunchButtons, FactBox, RecipeCard, HeadlinesBox, VocabBox, CalendarBox) use hardcoded `dobbles-red`, `dobbles-navy`, `dobbles-blue` classes. The Hub page itself and all public pages use semantic tokens (`bg-primary`, `text-primary-foreground`). Migrate widgets to semantic tokens when touching them.

## Supabase
- **Project ID:** `xyulaaievgvkfrwwhgrw`
- **Client:** `src/integrations/supabase/client.ts` (URL and anon key are hardcoded, not from env vars — Lovable-generated pattern)
- **Tables:** `contacts` (form submissions), `vocabulary` (364 Spanish word pairs)
- **Edge Functions:** `fetch-news` (Hacker News), `google-calendar` (public calendars only)
- **Auth:** Magic link email, RLS on both tables
- **Env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (referenced in `.env` but the client.ts file doesn't actually read them — it uses hardcoded values)

## Contact Form
`Contact.tsx` has a silent error swallow — if the Supabase insert fails, it still shows "Message received!" This was intentional as a graceful fallback but means you won't know if messages are actually being stored.

## Dev
```
npm run dev        # port 8080
npm run build      # production build → dist/
```
60+ shadcn/ui files in `src/components/ui/` — stock components, don't modify unless necessary.
Lovable may push commits to this repo — watch for merge conflicts.

## Next Steps (prioritized)

1. **Fix Supabase Site URL** — Set to `https://dobbles.ai` in Supabase dashboard so magic link auth works in production. This is a manual step, not a code change.
2. **Delete dead code** — Remove `src/pages/Index.tsx`, `src/components/RecipeCarousel.tsx`, and `src/data/mockData.ts`.
3. **Fix brand colors** — Update HSL values in `src/index.css` to match doctrine hex palette exactly.
4. **Migrate widget classes** — Replace `dobbles-red/navy/blue` with semantic tokens (`bg-primary`, `bg-secondary`, `bg-accent`) in all widget components.
5. **Dark mode** — Decide: implement dark mode toggle (doctrine says dark default) or document light mode as intentional exception.
6. **CalendarBox** — Either implement OAuth 2.0 for private Google Calendar access, or remove the widget. Currently dead functionality.
7. **Contact form error handling** — Surface actual errors instead of silently succeeding on failure.
8. **Supabase client cleanup** — Consider reading URL/key from env vars instead of hardcoded values (low priority, Lovable pattern).
