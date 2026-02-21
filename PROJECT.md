# Dobbles.AI — Website & Morning Hub

## What It Is
Personal website and productivity hub for Ed Dobbles. Two halves:

1. **Public portfolio** (`/`, `/about`, `/projects`, `/contact`) — professional site targeting CAO/CDO/VP Analytics roles and build collaboration.
2. **Private hub** (`/hub`, behind magic-link auth) — morning dashboard with quick-launch grid, Spanish vocab flashcards, healthy recipes, random facts, and news headlines.

## Stack
- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (auth, Postgres, edge functions)
- **Deployment:** Railway (target) / Lovable preview (current)
- **APIs:** TheMealDB (recipes), Useless Facts, Hacker News (via edge function)

## Current State
- Public marketing pages: complete and functional
- Hub dashboard: functional (launch grid, vocab, recipes, facts, headlines)
- Auth: Supabase magic link OTP
- Design system: dark-mode default, Montserrat, Doctrine brand palette
- Mobile nav: implemented

## Known Issues
- **Google Calendar widget** (`CalendarBox.tsx`) is built but not rendered — requires OAuth 2.0 instead of API key to access private calendars.
- `contacts` table not reflected in Supabase generated types (functionally harmless).

## Next Milestone
- Wire up Google Calendar via OAuth 2.0 and render CalendarBox in the Hub
- Deploy to Railway with custom domain
- Add resume/CV download to public site
