import { generateJson, hasApiKey, MissingApiKeyError } from "./ai";
import type { BrandProfile } from "./types";

/**
 * Onboarding brand analysis: scrape a site, then have an LLM extract a
 * structured Brand Profile (voice, industry, audience, keywords, …).
 *
 * The scaffold uses a lightweight `fetch` + regex extractor so it runs with no
 * native deps. In production swap `scrapeSite` for Playwright/Puppeteer to
 * render JS-heavy sites and crawl multiple pages.
 */

export interface ScrapedSite {
  url: string;
  title: string;
  description: string;
  /** Visible text content, truncated to a sane size for the LLM. */
  text: string;
  headings: string[];
}

const MAX_TEXT = 12_000;

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

/**
 * Scrape a site, degrading gracefully: if the site is unreachable (network
 * error, timeout, non-2xx), return a minimal placeholder derived from the URL
 * so onboarding still completes (the LLM/mock analysis then fills in the rest).
 * `reachable` lets callers surface "we couldn't read your site" if they want.
 */
export async function scrapeSiteOrFallback(
  rawUrl: string,
): Promise<ScrapedSite & { reachable: boolean }> {
  try {
    return { ...(await scrapeSite(rawUrl)), reachable: true };
  } catch {
    const url = normalizeUrl(rawUrl);
    const host = new URL(url).hostname.replace(/^www\./, "");
    return {
      url,
      title: host,
      description: "",
      text: "",
      headings: [],
      reachable: false,
    };
  }
}

export async function scrapeSite(rawUrl: string): Promise<ScrapedSite> {
  const url = normalizeUrl(rawUrl);
  const res = await fetch(url, {
    headers: { "User-Agent": "AI-CMO-Bot/1.0 (+brand-analysis)" },
    // Don't hang the onboarding request forever on a slow site.
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();

  const title =
    matchOne(html, /<title[^>]*>([^<]*)<\/title>/i) ||
    matchOne(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    new URL(url).hostname;

  const description =
    matchOne(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    matchOne(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
    "";

  const headings = [...html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi)]
    .map((m) => stripTags(m[1]).trim())
    .filter(Boolean)
    .slice(0, 20);

  const text = stripTags(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " "),
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT);

  return { url, title, description, text, headings };
}

const BRAND_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    industry: { type: "string" },
    voice: { type: "string", description: "2-3 sentences describing the brand voice" },
    toneWords: { type: "array", items: { type: "string" } },
    targetAudience: { type: "string" },
    valueProposition: { type: "string" },
    keywords: { type: "array", items: { type: "string" } },
    competitors: { type: "array", items: { type: "string" } },
  },
  required: [
    "name",
    "industry",
    "voice",
    "toneWords",
    "targetAudience",
    "valueProposition",
    "keywords",
    "competitors",
  ],
} as const;

type ExtractedBrand = Omit<
  BrandProfile,
  "id" | "userId" | "url" | "createdAt" | "updatedAt"
>;

export async function analyzeBrand(site: ScrapedSite): Promise<ExtractedBrand> {
  if (!hasApiKey()) return mockBrand(site);

  try {
    return await generateJson<ExtractedBrand>({
      system:
        "You are a brand strategist. Given a company's website content, extract a precise, structured brand profile. Be specific and concrete — infer the industry, the real target audience, and 8-12 SEO keywords the brand should rank for. Identify 3-5 likely competitors.",
      prompt: buildPrompt(site),
      schema: BRAND_SCHEMA as unknown as Record<string, unknown>,
      maxTokens: 2000,
    });
  } catch (err) {
    if (err instanceof MissingApiKeyError) return mockBrand(site);
    throw err;
  }
}

function buildPrompt(site: ScrapedSite): string {
  return [
    `URL: ${site.url}`,
    `Title: ${site.title}`,
    `Meta description: ${site.description}`,
    site.headings.length ? `Headings:\n- ${site.headings.join("\n- ")}` : "",
    `Page content:\n${site.text}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Deterministic fallback so onboarding works with no API key. */
function mockBrand(site: ScrapedSite): ExtractedBrand {
  const host = new URL(site.url).hostname.replace(/^www\./, "");
  const name = site.title.split(/[|\-–]/)[0].trim() || host;
  return {
    name,
    industry: "General / Technology",
    voice:
      "Clear, friendly, and confident. Speaks directly to the reader, favors concrete benefits over jargon, and keeps a helpful, expert tone.",
    toneWords: ["friendly", "confident", "helpful", "modern"],
    targetAudience:
      "Decision-makers and practitioners looking for a reliable solution in this space.",
    valueProposition:
      site.description ||
      `${name} helps customers solve their problem faster with a simpler, all-in-one approach.`,
    keywords: [
      host.split(".")[0],
      "best tools",
      "how to guide",
      "pricing",
      "alternatives",
      "reviews",
      "for beginners",
      "comparison",
    ],
    competitors: ["Competitor A", "Competitor B", "Competitor C"],
  };
}

function matchOne(html: string, re: RegExp): string {
  const m = html.match(re);
  return m ? decodeEntities(m[1]).trim() : "";
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " "));
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
