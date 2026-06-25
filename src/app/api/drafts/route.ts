import { NextResponse } from "next/server";
import { DEMO_USER_ID, listDrafts } from "@/lib/store";
import type { Draft } from "@/lib/types";

export const runtime = "nodejs";

/**
 * GET /api/drafts?agent=seo&status=pending
 * The central approval-queue feed.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agent = searchParams.get("agent") ?? undefined;
  const status = (searchParams.get("status") as Draft["status"] | null) ?? undefined;
  const drafts = listDrafts(DEMO_USER_ID, { agent, status });
  return NextResponse.json({ drafts });
}
