import { NextResponse } from "next/server";
import {
  analyzeBrand,
  normalizeUrl,
  scrapeSiteOrFallback,
} from "@/lib/brand-analysis";
import { DEMO_USER_ID, saveBrand } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/brand/analyze
 * Body: { url: string }
 *
 * Onboarding step 1: scrape the site, extract a Brand Profile via the LLM, and
 * persist it for the current tenant.
 */
export async function POST(req: Request) {
  let url: string;
  try {
    const body = await req.json();
    url = String(body.url ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!url.trim()) {
    return NextResponse.json({ error: "A website URL is required" }, { status: 400 });
  }

  try {
    const site = await scrapeSiteOrFallback(url);
    const extracted = await analyzeBrand(site);
    const brand = saveBrand({
      userId: DEMO_USER_ID,
      url: normalizeUrl(url),
      ...extracted,
    });
    // `reachable: false` means we built the profile from the URL alone because
    // the site couldn't be fetched — the client can flag this if it wants.
    return NextResponse.json({ brand, reachable: site.reachable });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json(
      { error: `Could not analyze that site: ${message}` },
      { status: 502 },
    );
  }
}
