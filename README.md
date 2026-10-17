# WriteFlow AI — Executive AI Email & Content Workspace

> An editorial writing workspace designed for high-stakes workplace emails, multi-channel content generation, and precision text rewrites — powered by NVIDIA NIM hosted LLMs.

---

## 1. Overview & Core Promise

**Turn rough ideas into writing that is clear, useful, appropriately toned, and ready to edit or use.**

WriteFlow AI eliminates prompt-engineering friction by offering dedicated workflows with explicit controls over **purpose, use cases, audience relationships, tone, length, constraints, and personal writing profiles**.

---

## 2. Key Capabilities

### P0 — AI Email Generation (`/email`)
- **Rich Contextual Inputs:** Purpose, use cases (request, follow-up, meeting scheduling, thank you, apology, polite decline, reminder), recipient relationship, key points, desired outcome.
- **Audience & Style:** 8 distinct tones (Professional, Friendly, Concise, Persuasive, Empathetic, Confident, Formal, Conversational) and 3 length tiers (Short, Balanced, Detailed).
- **Variations Without Data Loss:** Flip between Draft 1, Variation 2, and Variation 3 seamlessly in the editor.
- **Anti-Hallucination Directives:** Clear placeholders (e.g. `[Date]`, `[Link]`) for unstated facts; zero fabricated promises or dates.

### P0 — Multi-Format Content Generation (`/content`)
- **Single Unified Brief:** Input one source brief or meeting transcript and generate tailored outputs concurrently across:
  - **Professional Email** (Subject, greeting, CTA, sign-off)
  - **Social Media Post** (Hook, spacing, takeaways, hashtags)
  - **Blog Article Outline** (Thesis, headings, detailed bullet points)
  - **Formal Announcement** (Executive summary, what's new, next steps)
  - **Short Direct Message** (Slack/Teams/SMS compact update)

### P0 — Precision Rewrite & Improve (`/rewrite`)
- **Directives:** Improve clarity, fix grammar, shorten, expand, simplify, make professional, make friendly, make persuasive, change tone.
- **Meaning Preservation:** Strict invariant that original facts, proper nouns, and core intent remain intact.
- **Side-by-Side Review:** Compare original vs. revised text, view a concise summary of changes, and explicitly **Accept Revision** or **Revert**.

### P1 — Prompt Enhancement (`/api/v1/generate/enhance-prompt`)
- Automatically decomposes raw instructions into a structured specification (Objective, Audience, Format, Context, Tone, Length, Required Points, Restrictions).

### P1 — Personal Writing Profile (`/profile`)
- Configure baseline tone, 5-level formality slider, vocabulary preferences, formatting preferences, words/clichés to avoid, and sample writing excerpts.
- Easily toggle personalization on or off at will.

### P1 — Draft History & Export (`/drafts`)
- Persistent SQLite storage (with Supabase PostgreSQL schema parity).
- Revisit, edit, rename, delete, copy, and export drafts as **Markdown (`.md`)** or **Plain Text (`.txt`)**.

---

## 3. Technology Stack & Architecture

```
┌─────────────────────────────────┐
│       Next.js 14 App Router     │
│   (TypeScript, Tailwind CSS,    │
│    Lucide Icons, Editorial UI)  │
└────────────────┬────────────────┘
                 │ HTTP API
┌────────────────▼────────────────┐
│         FastAPI Backend         │
│   (Python 3.14, Pydantic v2,    │
│    Async HTTPX, SQLAlchemy)     │
└───────┬──────────────────┬──────┘
        │                  │
┌───────▼──────┐    ┌──────▼──────────────┐
│  NVIDIA NIM  │    │ Persistent Storage  │
│  Hosted API  │    │  (SQLite Local &    │
│ (Llama-3.3)  │    │  Supabase Postgres) │
└──────────────┘    └─────────────────────┘
```

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS with custom editorial design tokens, Lucide React.
- **Backend:** Python 3.14 with FastAPI, Pydantic v2 data validation, Async HTTPX for LLM calls, SQLAlchemy for persistence.
- **AI Provider:** NVIDIA hosted LLM API at `https://integrate.api.nvidia.com/v1/chat/completions` using `meta/llama-3.3-70b-instruct` (with seamless local preview mock fallback when key is pending).
- **Database:** Local SQLite database (`writeflow.db`) with full schema parity and migration files for Supabase PostgreSQL with Row Level Security (RLS).

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js 18+ (tested on Node v26)
- Python 3.10+ (tested on Python 3.14)

### Step 1: Clone & Configure Environment

```bash
# Copy root environment template
cp .env.example .env.local

# Copy backend environment template
cp backend/.env.example backend/.env
```

To configure your NVIDIA API key:
1. Obtain an API key from [build.nvidia.com](https://build.nvidia.com).
2. Set `NVIDIA_API_KEY=nvapi-...` in `backend/.env`.
3. If no key is configured, WriteFlow automatically runs in **Preview Mock Mode**, enabling complete offline testing of all UI workflows.

### Step 2: Start the Python Backend

```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```
Backend runs at `http://localhost:8000`. Interactive OpenAPI documentation is available at `http://localhost:8000/docs`.

### Step 3: Start the Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`.

---

## 5. Running Automated Tests

### Backend Unit & Integration Tests (pytest)
```bash
cd backend
python -m pytest -v
```
Verifies health check, email generation, variations, multi-format content, prompt enhancement, rewrite actions, drafts CRUD isolation, and profile lifecycle.

### Frontend Production Build
```bash
cd frontend
npm run build
```
Validates strict TypeScript checking, component compilation, and Next.js page generation.

---

## 6. Supabase Database Migration

If deploying to Supabase PostgreSQL, execute the migration script in your Supabase SQL editor:
```sql
-- Located at: supabase/migrations/001_initial_schema.sql
```
This provisions:
- `profiles`
- `writing_profiles`
- `drafts` (with user isolation RLS)
- `generation_logs`

---

## 7. Security & Privacy Guarantees
- **No Secret Exposure:** API keys are restricted strictly to backend environment variables. Never sent to the client browser.
- **Isolated User Storage:** Drafts and profiles are scoped by `user_id`. One user cannot read or delete another user's drafts.
- **Private Writing Invariant:** User writing samples and drafts are stored locally or in your private database. Never submitted for public model training.
