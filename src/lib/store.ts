import type { AgentRun, BrandProfile, Draft } from "./types";

/**
 * In-memory, multi-tenant data store.
 *
 * Everything is keyed by `userId` so tenants are fully isolated — the same
 * boundary the Postgres schema enforces with a `userId` column + row-level
 * scoping. Swap this module for a Prisma-backed implementation (same method
 * signatures) to make it durable; see prisma/schema.prisma.
 *
 * State lives on `globalThis` so it survives Next.js hot-reloads in dev.
 */

interface Db {
  brands: Map<string, BrandProfile>; // key: brand id
  drafts: Map<string, Draft>; // key: draft id
  runs: Map<string, AgentRun>; // key: run id
}

const g = globalThis as unknown as { __aicmo_db?: Db };

function db(): Db {
  if (!g.__aicmo_db) {
    g.__aicmo_db = { brands: new Map(), drafts: new Map(), runs: new Map() };
  }
  return g.__aicmo_db;
}

let counter = 0;
export function id(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`;
}

const now = () => new Date().toISOString();

/**
 * In a real deployment this comes from the auth session (Clerk / NextAuth).
 * For the scaffold we use a single demo tenant so the flow is clickable.
 */
export const DEMO_USER_ID = "demo-user";

// ── Brand profiles ──────────────────────────────────────────────────────────

export function saveBrand(
  input: Omit<BrandProfile, "id" | "createdAt" | "updatedAt"> &
    Partial<Pick<BrandProfile, "id">>,
): BrandProfile {
  const existing = input.id ? db().brands.get(input.id) : undefined;
  const brand: BrandProfile = {
    ...input,
    id: existing?.id ?? id("brand"),
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  };
  db().brands.set(brand.id, brand);
  return brand;
}

export function getLatestBrand(userId: string): BrandProfile | undefined {
  return [...db().brands.values()]
    .filter((b) => b.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export function getBrand(brandId: string, userId: string): BrandProfile | undefined {
  const brand = db().brands.get(brandId);
  return brand && brand.userId === userId ? brand : undefined;
}

// ── Drafts (the approval queue) ─────────────────────────────────────────────

export function createDraft(
  input: Omit<Draft, "id" | "createdAt" | "updatedAt" | "status"> &
    Partial<Pick<Draft, "status">>,
): Draft {
  const draft: Draft = {
    ...input,
    id: id("draft"),
    status: input.status ?? "pending",
    createdAt: now(),
    updatedAt: now(),
  };
  db().drafts.set(draft.id, draft);
  return draft;
}

export function listDrafts(
  userId: string,
  filter?: { agent?: string; status?: Draft["status"] },
): Draft[] {
  return [...db().drafts.values()]
    .filter((d) => d.userId === userId)
    .filter((d) => (filter?.agent ? d.agent === filter.agent : true))
    .filter((d) => (filter?.status ? d.status === filter.status : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getDraft(draftId: string, userId: string): Draft | undefined {
  const draft = db().drafts.get(draftId);
  return draft && draft.userId === userId ? draft : undefined;
}

export function updateDraft(
  draftId: string,
  userId: string,
  patch: Partial<Pick<Draft, "title" | "body" | "status">>,
): Draft | undefined {
  const draft = getDraft(draftId, userId);
  if (!draft) return undefined;
  const updated: Draft = { ...draft, ...patch, updatedAt: now() };
  db().drafts.set(draftId, updated);
  return updated;
}

// ── Agent runs ──────────────────────────────────────────────────────────────

export function startRun(userId: string, agent: AgentRun["agent"]): AgentRun {
  const run: AgentRun = {
    id: id("run"),
    userId,
    agent,
    status: "running",
    draftsCreated: 0,
    startedAt: now(),
  };
  db().runs.set(run.id, run);
  return run;
}

export function finishRun(
  runId: string,
  patch: Partial<Pick<AgentRun, "status" | "draftsCreated" | "error">>,
): void {
  const run = db().runs.get(runId);
  if (!run) return;
  db().runs.set(runId, { ...run, ...patch, finishedAt: now() });
}

export function listRuns(userId: string, agent?: string): AgentRun[] {
  return [...db().runs.values()]
    .filter((r) => r.userId === userId)
    .filter((r) => (agent ? r.agent === agent : true))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}
