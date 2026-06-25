import type { AgentDefinition, AgentKey } from "./types";

/**
 * The full agent roster shown on the dashboard. Only `seo` is wired end-to-end
 * (scrape → analyze → draft → approve); the rest are scaffolded with the same
 * shape so they can be implemented against this template one at a time.
 */
export const AGENTS: AgentDefinition[] = [
  {
    key: "seo",
    name: "SEO Agent",
    tagline: "Finds keyword gaps and drafts ranking blog posts.",
    description:
      "Connects to Google Search Console + SerpAPI to surface keyword gaps, then drafts full blog posts in your brand voice and queues them for approval.",
    glyph: "🔍",
    integrations: ["Google Search Console", "SerpAPI", "DataForSEO"],
    implemented: true,
    cadence: "weekly",
  },
  {
    key: "reddit",
    name: "Reddit Agent",
    tagline: "Monitors threads and drafts non-spammy replies.",
    description:
      "Watches relevant subreddits for keyword matches and drafts contextual, genuinely helpful replies for you to approve before anything posts.",
    glyph: "👽",
    integrations: ["Reddit API"],
    implemented: false,
    cadence: "hourly",
  },
  {
    key: "linkedin",
    name: "LinkedIn Agent",
    tagline: "Turns trends into thought-leadership posts.",
    description:
      "Generates LinkedIn post ideas from trending topics in your niche and queues drafts for one-click publishing via the LinkedIn API.",
    glyph: "💼",
    integrations: ["LinkedIn API"],
    implemented: false,
    cadence: "daily",
  },
  {
    key: "x",
    name: "X Agent",
    tagline: "Drafts threads and replies tuned to your voice.",
    description:
      "Spots trending conversations and drafts posts + threads for review, ready to publish through the Twitter/X API v2.",
    glyph: "🐦",
    integrations: ["Twitter API v2"],
    implemented: false,
    cadence: "daily",
  },
  {
    key: "writer",
    name: "Writer Agent",
    tagline: "Long-form content with brand-voice fine-tuning.",
    description:
      "Produces blog posts, case studies, and landing-page copy in a rich text editor, fine-tuned to your brand voice.",
    glyph: "✍️",
    integrations: ["TipTap"],
    implemented: false,
    cadence: "weekly",
  },
  {
    key: "geo",
    name: "GEO Agent",
    tagline: "Optimizes for ChatGPT, Perplexity & AI Overviews.",
    description:
      "Monitors AI search engines for brand mentions and drafts structured, citation-friendly content (FAQ schema, authoritative long-form).",
    glyph: "🤖",
    integrations: ["Perplexity", "ChatGPT", "AI Overviews"],
    implemented: false,
    cadence: "weekly",
  },
  {
    key: "ugc",
    name: "UGC Video Agent",
    tagline: "Generates short-form video briefs & clips.",
    description:
      "Creates video briefs and produces short-form clips in 9:16, 1:1, and 16:9 via a video AI API for download.",
    glyph: "🎬",
    integrations: ["HeyGen", "Runway", "ElevenLabs"],
    implemented: false,
    cadence: "weekly",
  },
  {
    key: "influencer",
    name: "Influencer Agent",
    tagline: "Surfaces relevant micro-influencers.",
    description:
      "Finds micro-influencers matched to your niche and audience using an influencer database API.",
    glyph: "⭐",
    integrations: ["Modash", "HypeAuditor"],
    implemented: false,
    cadence: "weekly",
  },
  {
    key: "coding",
    name: "Coding Agent",
    tagline: "Audits technical SEO and writes the fixes.",
    description:
      "Audits your site for technical SEO issues (missing meta tags, slow pages, broken links) and generates code patches or step-by-step fixes.",
    glyph: "🛠️",
    integrations: ["Lighthouse", "Site crawler"],
    implemented: false,
    cadence: "weekly",
  },
  {
    key: "hackernews",
    name: "Hacker News Agent",
    tagline: "Spots launch & discussion opportunities.",
    description:
      "Tracks Hacker News for relevant threads and Show HN opportunities, drafting comments and posts for review.",
    glyph: "🟠",
    integrations: ["HN API"],
    implemented: false,
    cadence: "daily",
  },
];

export const AGENT_MAP: Record<AgentKey, AgentDefinition> = Object.fromEntries(
  AGENTS.map((a) => [a.key, a]),
) as Record<AgentKey, AgentDefinition>;

export function getAgent(key: string): AgentDefinition | undefined {
  return AGENT_MAP[key as AgentKey];
}
