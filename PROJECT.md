# Dobbles.AI — Personal Site & Morning Hub

## What It Does
Public portfolio site showcasing 4 production AI projects (Chat-to-Snowflake, AI Content Engine, ML Demand Forecasting, Distribution Intelligence), plus a protected morning productivity dashboard with quick-launch buttons, Spanish vocabulary, recipes, headlines, and random facts.

## Stack
React 18 + TypeScript + Vite, styled with Tailwind CSS and shadcn/ui. Backend is Supabase (PostgreSQL, Auth via magic link, Edge Functions for news). Originally scaffolded through Lovable.

**Note:** This stack diverges from the doctrine's default (Python + Railway). The frontend-only nature of the site makes React/Supabase the right call here. If server-side logic is added later, evaluate whether to extend Supabase Edge Functions or migrate backend concerns to Railway + FastAPI.

## Current State
- Public site fully implemented: Home, About, Projects (4 detail pages), Contact
- Protected `/hub` dashboard with Supabase auth (magic link)
- Hub widgets: LaunchButtons (21 services), VocabBox (364 Spanish words from Supabase), RecipeCard (TheMealDB API), FactBox (uselessfacts API), HeadlinesBox (Hacker News via edge function)
- Dark mode toggle implemented via next-themes (defaults to dark per doctrine)
- No TODO/FIXME markers in codebase

## Supabase Resources
- **Project ID:** `xwguviuinmafenlqwtka`
- **Tables:** `contacts` (form submissions), `vocabulary` (364 Spanish word pairs)
- **Edge Functions:** `fetch-news` (Hacker News)
- **Auth:** Magic link email, RLS policies on both tables

## Next Milestone
Decide the future of this site: keep it as a Lovable/Supabase app for the portfolio use case, or begin migrating backend pieces to Railway if features like Intelligence Briefings integration or job search tools get added here.

## Project-Specific Constraints
- Lovable may push commits to this repo — watch for merge conflicts on shared branches
- Supabase environment variables are in `.env` (not committed) — `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
- Dev server runs on port 8080 (`npm run dev`)
- 60+ shadcn/ui component files in `src/components/ui/` — most are stock, don't modify unless necessary
