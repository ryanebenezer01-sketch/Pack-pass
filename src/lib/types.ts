/**
 * Core domain types shared by the API routes, the store, and the UI.
 *
 * These intentionally mirror the Prisma models in `prisma/schema.prisma` so
 * that swapping the in-memory store for Postgres is a drop-in change.
 */

export type AgentKey =
  | "seo"
  | "reddit"
  | "linkedin"
  | "x"
  | "writer"
  | "geo"
  | "ugc"
  | "influencer"
  | "coding"
  | "hackernews";

export type AgentStatus = "idle" | "active" | "error";

export interface AgentDefinition {
  key: AgentKey;
  name: string;
  /** One-line description shown on the dashboard card. */
  tagline: string;
  /** Longer description for the agent detail page. */
  description: string;
  /** Emoji/pixel glyph used as the card avatar. */
  glyph: string;
  /** External integrations this agent uses (shown as chips). */
  integrations: string[];
  /** Whether the SEO-style end-to-end flow is wired up for this agent. */
  implemented: boolean;
  /** Default cron cadence for the background job. */
  cadence: "daily" | "weekly" | "hourly";
}

export interface BrandProfile {
  id: string;
  userId: string;
  url: string;
  name: string;
  industry: string;
  /** Short paragraph describing the brand voice. */
  voice: string;
  /** Adjectives that characterise the tone (e.g. "playful", "authoritative"). */
  toneWords: string[];
  targetAudience: string;
  /** Primary value proposition / positioning. */
  valueProposition: string;
  keywords: string[];
  competitors: string[];
  createdAt: string;
  updatedAt: string;
}

export type DraftStatus = "pending" | "approved" | "rejected" | "scheduled";

export type DraftKind =
  | "blog_post"
  | "reddit_reply"
  | "social_post"
  | "long_form"
  | "geo_content"
  | "video_brief"
  | "code_fix";

export interface Draft {
  id: string;
  userId: string;
  brandId: string;
  agent: AgentKey;
  kind: DraftKind;
  title: string;
  /** Markdown / rich-text body awaiting human review. */
  body: string;
  /** Agent-specific structured metadata (keyword, subreddit, target URL, …). */
  meta: Record<string, string | number | string[]>;
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AgentRun {
  id: string;
  userId: string;
  agent: AgentKey;
  status: "running" | "completed" | "failed";
  /** How many drafts this run produced. */
  draftsCreated: number;
  startedAt: string;
  finishedAt?: string;
  error?: string;
}
