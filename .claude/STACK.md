# Tech Stack & Environment
> Reference for all projects. Build to these standards by default unless explicitly told otherwise.

---

## DATA PLATFORM

| Layer | Technology |
|-------|-----------|
| Cloud Data Warehouse | Snowflake |
| Transformation | dbt |
| BI / Reporting | PowerBI |
| Orchestration | (document per project) |

**Snowflake conventions:**
- Database: `CDP_DW_MAIN_DBT` (primary production environment)
- Schema naming follows dbt layer conventions (staging, intermediate, mart)
- 18.5M+ venue/menu records — query efficiency matters, always consider cost
- Use `LIMIT` during development; never run unbounded queries on full tables without intent

---

## APPLICATION STACK

| Layer | Technology |
|-------|-----------|
| Backend / APIs | Python |
| Hosting / Deployment | Railway |
| AI/LLM | Anthropic Claude (primary), OpenAI (secondary) |
| Auth | Google OAuth |
| Automation / Queues | Inngest |

---

## ENVIRONMENT VARIABLES (always present)

```
ANTHROPIC_API_KEY
AI_INTEGRATIONS_OPENAI_API_KEY   # Note: NOT "OPENAI_API_KEY"
RAILWAY_TOKEN
GAMMA_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
INNGEST_SIGNING_KEY
INNGEST_EVENT_KEY
FIREFLIES_API_KEY
BRIEFING_API_KEY
OneDrive                          # Path: C:\Users\eddob\OneDrive
```
Do not ask me to set these up. They exist. Reference them directly.
Access via `os.environ["VAR_NAME"]` in Python or `$env:VAR_NAME` in PowerShell.
Never hardcode values. Never print or log actual key values.

---

## DEVELOPMENT PHILOSOPHY

- **Build on Railway first.** It's fast, it's cheap, it's already configured.
- **Python for backend.** No Node unless there's a compelling reason.
- **AI-first architecture.** Assume Claude or OpenAI is available for any intelligent processing layer.
- **Iterate, don't architect.** Get a working version shipped, then refine.
- **No over-engineering.** If a script solves it, write a script. Don't build a platform.

---

## AI PROJECTS IN FLIGHT

### Intelligence Briefings
AI-powered executive audio briefing platform. Converts data/intelligence into podcast-style executive audio. Built on Railway.

### Job Hunt Application
Resume generation, scoring, and Gmail integration for C-suite job search. Built on Railway.

---

## DEPLOYMENT RULES

- All apps deploy to Railway
- Use environment variables — never hardcode keys
- Document the Railway service name in each project README
- Default to Python + FastAPI or Flask for web services
