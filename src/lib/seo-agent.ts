import { generateText, hasApiKey, MissingApiKeyError } from "./ai";
import { createDraft, finishRun, startRun } from "./store";
import type { BrandProfile, Draft } from "./types";

/**
 * SEO Agent — the reference end-to-end implementation that every other agent
 * is modeled on:
 *
 *   1. Identify keyword gaps  (real: Google Search Console + SerpAPI/DataForSEO)
 *   2. Pick the highest-opportunity keywords
 *   3. Draft a full blog post in the brand voice for each
 *   4. Land every draft in the approval queue (status: "pending")
 *
 * Nothing publishes automatically — human-in-the-loop is enforced by leaving
 * drafts "pending" until a user approves them.
 */

export interface KeywordGap {
  keyword: string;
  /** Estimated monthly search volume. */
  volume: number;
  /** 0-100 ranking difficulty. */
  difficulty: number;
  /** Current rank, or null if not ranking. */
  currentRank: number | null;
}

/**
 * Identify keyword gaps for a brand.
 *
 * In production this calls Google Search Console (queries you almost rank for)
 * and SerpAPI/DataForSEO (volume + difficulty). The scaffold derives plausible
 * gaps from the brand's keyword list so the flow is demonstrable offline.
 */
export async function identifyKeywordGaps(brand: BrandProfile): Promise<KeywordGap[]> {
  const seeds = brand.keywords.length
    ? brand.keywords
    : ["guide", "best practices", "alternatives", "pricing"];

  // Deterministic pseudo-metrics seeded by the keyword string so the demo is
  // stable across runs without an external API.
  return seeds.slice(0, 8).map((keyword) => {
    const h = hash(keyword);
    return {
      keyword,
      volume: 200 + (h % 9800),
      difficulty: 5 + (h % 70),
      currentRank: h % 3 === 0 ? null : 11 + (h % 40),
    };
  });
}

/** Rank gaps by opportunity: high volume, low difficulty, not yet ranking well. */
export function prioritizeGaps(gaps: KeywordGap[]): KeywordGap[] {
  return [...gaps].sort((a, b) => opportunity(b) - opportunity(a));
}

function opportunity(g: KeywordGap): number {
  const rankPenalty = g.currentRank === null ? 1 : Math.min(g.currentRank / 50, 1);
  return (g.volume / (g.difficulty + 1)) * (0.5 + rankPenalty);
}

export async function draftBlogPost(
  brand: BrandProfile,
  keyword: string,
): Promise<{ title: string; body: string }> {
  if (!hasApiKey()) return mockPost(brand, keyword);
  try {
    const body = await generateText({
      system: buildSystem(brand),
      prompt: `Write a complete, SEO-optimized blog post targeting the keyword "${keyword}". Requirements:
- A compelling H1 title on the first line, prefixed with "# ".
- 800-1200 words, in Markdown.
- Naturally include the target keyword and related terms.
- Use H2/H3 subheadings, short paragraphs, and at least one bulleted list.
- Write entirely in ${brand.name}'s brand voice for its target audience.
- End with a soft call-to-action.`,
      maxTokens: 6000,
    });
    const title = (body.match(/^#\s+(.+)$/m)?.[1] ?? keyword).trim();
    return { title, body };
  } catch (err) {
    if (err instanceof MissingApiKeyError) return mockPost(brand, keyword);
    throw err;
  }
}

function buildSystem(brand: BrandProfile): string {
  return [
    `You are the SEO content writer for ${brand.name}, a brand in ${brand.industry}.`,
    `Brand voice: ${brand.voice}`,
    `Tone: ${brand.toneWords.join(", ")}.`,
    `Target audience: ${brand.targetAudience}.`,
    `Value proposition: ${brand.valueProposition}.`,
    "Write helpful, original content that genuinely serves the reader — never keyword-stuff.",
  ].join("\n");
}

/**
 * Run the full SEO agent for one brand: produce N blog-post drafts and queue
 * them. Returns the created drafts. Records an AgentRun for the dashboard.
 */
export async function runSeoAgent(
  brand: BrandProfile,
  opts: { count?: number } = {},
): Promise<Draft[]> {
  const count = opts.count ?? 2;
  const run = startRun(brand.userId, "seo");
  try {
    const gaps = prioritizeGaps(await identifyKeywordGaps(brand)).slice(0, count);
    const drafts: Draft[] = [];
    for (const gap of gaps) {
      const { title, body } = await draftBlogPost(brand, gap.keyword);
      drafts.push(
        createDraft({
          userId: brand.userId,
          brandId: brand.id,
          agent: "seo",
          kind: "blog_post",
          title,
          body,
          meta: {
            keyword: gap.keyword,
            volume: gap.volume,
            difficulty: gap.difficulty,
          },
        }),
      );
    }
    finishRun(run.id, { status: "completed", draftsCreated: drafts.length });
    return drafts;
  } catch (err) {
    finishRun(run.id, {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

function mockPost(brand: BrandProfile, keyword: string) {
  const title = `${titleCase(keyword)}: A Practical Guide from ${brand.name}`;
  const body = `# ${title}

> _Draft generated without an API key. Set \`ANTHROPIC_API_KEY\` to generate real, brand-voiced content._

If you're exploring **${keyword}**, you're in the right place. ${brand.name} works with ${brand.targetAudience.toLowerCase()} every day, and this guide distills what actually moves the needle.

## Why ${titleCase(keyword)} matters

${brand.valueProposition} Understanding ${keyword} is a big part of getting there.

## Where most people get stuck

- Treating ${keyword} as a one-time task instead of an ongoing practice
- Optimizing for search engines instead of readers
- Ignoring how it ties back to your wider goals

## A simple approach that works

1. Start with the outcome you want.
2. Map ${keyword} to that outcome.
3. Measure, learn, and iterate.

## Bringing it together

Done well, ${keyword} compounds over time. That's exactly the kind of durable advantage ${brand.name} is built to help you create.

_Ready to go further? See how ${brand.name} can help._`;
  return { title, body };
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
