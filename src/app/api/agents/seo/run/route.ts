import { NextResponse } from "next/server";
import { runSeoAgent } from "@/lib/seo-agent";
import { DEMO_USER_ID, getLatestBrand } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * POST /api/agents/seo/run
 * Body: { count?: number }
 *
 * Runs the SEO agent for the tenant's current brand and queues blog-post
 * drafts. Returns the created (pending) drafts. In production this is what the
 * BullMQ/Celery cron job calls on the agent's configured cadence.
 */
export async function POST(req: Request) {
  const brand = getLatestBrand(DEMO_USER_ID);
  if (!brand) {
    return NextResponse.json(
      { error: "No brand profile yet — complete onboarding first." },
      { status: 409 },
    );
  }

  let count = 2;
  try {
    const body = await req.json().catch(() => ({}));
    if (body && typeof body.count === "number") {
      count = Math.min(Math.max(1, body.count), 5);
    }
  } catch {
    /* default count */
  }

  try {
    const drafts = await runSeoAgent(brand, { count });
    return NextResponse.json({ drafts, count: drafts.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Agent run failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
