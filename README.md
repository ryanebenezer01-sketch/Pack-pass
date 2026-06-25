# AI CMO — Multi-Agent AI Marketing Automation

A reference implementation of an "AI CMO" SaaS: enter your website URL, the
system analyzes your brand, then specialized AI agents draft content for every
marketing channel — **24/7, but nothing publishes without your approval.**

> **Human-in-the-loop by design.** Every agent _drafts_. All output lands in a
> central approval queue where you approve, edit, schedule, or reject it.

## What's built

This scaffold delivers the two pieces the spec calls out first, end-to-end:

1. **Onboarding flow** — `URL → scrape → LLM brand analysis → Brand Profile → dashboard`
2. **SEO Agent** — the full template every other agent is modeled on:
   `identify keyword gaps → prioritize → draft blog posts in brand voice → approval queue`

Around them:

- **Landing page** — dark theme, pixel-robot mascot, URL hero, logo marquee,
  testimonials, "Without vs. With" pricing comparison, FAQ accordion.
- **Agent dashboard** — card-based grid of all 10 agents (SEO, Reddit, LinkedIn,
  X, Writer, GEO, UGC, Influencer, Coding, Hacker News) with status indicators,
  pending/total draft counts, and run controls.
- **Approval queue** — central inbox; approve / edit / schedule / reject, with
  status filters.
- **Agent detail pages** — per-agent stats, run history, and draft queue.

The other nine agents are scaffolded with the same `AgentDefinition` shape and a
"Coming soon" state, so each can be implemented against the SEO template.

## Tech stack

| Layer     | Choice                                                              |
| --------- | ------------------------------------------------------------------ |
| Frontend  | Next.js 15 (App Router) · Tailwind CSS · shadcn-style components    |
| Backend   | Next.js Route Handlers (REST) · Node runtime                       |
| AI        | Anthropic Claude (`claude-opus-4-8`, adaptive thinking, streaming) |
| Data      | In-memory store (ships) → Prisma + Postgres (`prisma/schema.prisma`) |
| Auth      | Stubbed single demo tenant → Clerk / NextAuth (see notes)          |
| Payments  | Free vs. Max plan modeled in schema → Stripe (see notes)           |

## Quick start

```bash
npm install
cp .env.example .env          # optional: add ANTHROPIC_API_KEY for real output
npm run dev                   # http://localhost:3000
```

**No API key?** The app still runs — brand analysis and content generation fall
back to deterministic placeholder output, and the dashboard shows a "Demo mode"
banner. Add `ANTHROPIC_API_KEY` to generate real, brand-voiced content.

Try it: enter any URL on the landing page → watch the brand analysis → land on
the dashboard → click **Run now** on the SEO agent → review drafts in the
**Approval Queue**.

## Architecture

```
src/
  app/
    page.tsx                       Landing page
    onboarding/                    URL → brand analysis → dashboard
    dashboard/
      page.tsx                     Agent grid
      drafts/                      Central approval queue
      agents/[key]/                Per-agent detail + draft queue
      brand/                       Brand Profile viewer
    api/
      brand/analyze/               POST: scrape + LLM brand extraction
      agents/seo/run/              POST: run the SEO agent
      drafts/                      GET: queue feed
      drafts/[id]/                 PATCH: approve / edit / reject / schedule
  lib/
    ai.ts                          Anthropic client wrapper (text + JSON)
    brand-analysis.ts              Scraper + LLM Brand Profile extraction
    seo-agent.ts                   SEO agent (the end-to-end template)
    agents.ts                      The 10-agent registry
    store.ts                       In-memory, multi-tenant store
    types.ts                       Shared domain types (mirror Prisma models)
prisma/schema.prisma               Durable multi-tenant schema (migration path)
```

### Key design decisions

- **Human-in-the-loop:** agents only ever create `pending` drafts. Approval is an
  explicit `PATCH /api/drafts/:id` — the single point where a real deployment
  hands off to platform publishing APIs (LinkedIn, X, …).
- **Multi-tenant isolation:** everything is keyed by `userId` in both the store
  and the Prisma schema. The scaffold uses one demo tenant; wire `DEMO_USER_ID`
  to your auth session to go live.
- **Agent template:** `src/lib/seo-agent.ts` shows the canonical shape — scrape/
  fetch signals → LLM draft → `createDraft(... status: "pending")` → record an
  `AgentRun`. Copy it per agent.
- **Graceful degradation:** missing API keys (Anthropic or per-integration) never
  break the flow — agents drop to drafting-only / mock output.

## Going to production

The scaffold is intentionally infra-free. To productionize:

1. **Database** — implement `src/lib/store.ts` against Prisma + Postgres using
   `prisma/schema.prisma` (same method signatures), and run `prisma migrate`.
2. **Auth** — replace `DEMO_USER_ID` with the Clerk/NextAuth session user id in
   the API routes; gate `/dashboard`.
3. **Job queue** — move agent runs into BullMQ/Celery workers on per-agent cron
   cadences (`AgentDefinition.cadence`); the `/api/agents/*/run` handlers become
   the enqueue + manual-trigger path. Add Redis for the queue + caching.
4. **Integrations** — wire each agent's `integrations` to real APIs (Search
   Console, SerpAPI, Reddit, Twitter/X, LinkedIn, GA4, video AI, Modash, …).
   Brand-voice matching can be upgraded from prompt-context to embeddings.
5. **Billing** — connect Stripe to the `Plan` enum; meter per-agent runs for
   free-tier limits.

## Implementing the next agent

1. Add it to `src/lib/agents.ts` (set `implemented: true`).
2. Create `src/lib/<agent>-agent.ts` following `seo-agent.ts`: gather signals →
   draft via `lib/ai.ts` → `createDraft({ status: "pending", ... })`.
3. Add `src/app/api/agents/<key>/run/route.ts` mirroring the SEO route.
4. The dashboard card, detail page, and approval queue already work generically.
