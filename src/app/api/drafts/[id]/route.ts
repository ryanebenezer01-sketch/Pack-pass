import { NextResponse } from "next/server";
import { DEMO_USER_ID, getDraft, updateDraft } from "@/lib/store";
import type { Draft } from "@/lib/types";

export const runtime = "nodejs";

const ACTIONS = ["approve", "reject", "schedule"] as const;
type Action = (typeof ACTIONS)[number];

const STATUS_FOR: Record<Action, Draft["status"]> = {
  approve: "approved",
  reject: "rejected",
  schedule: "scheduled",
};

/**
 * PATCH /api/drafts/:id
 * Body: { action?: "approve"|"reject"|"schedule", title?, body? }
 *
 * The human-in-the-loop control point. Editing updates title/body; an action
 * transitions status. "approve"/"schedule" is where a real deployment would
 * hand off to the platform publishing API (LinkedIn, X, etc.).
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const draft = getDraft(id, DEMO_USER_ID);
  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const patch: Partial<Pick<Draft, "title" | "body" | "status">> = {};

  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.body === "string") patch.body = body.body;

  if (typeof body.action === "string") {
    if (!ACTIONS.includes(body.action as Action)) {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    patch.status = STATUS_FOR[body.action as Action];
  }

  const updated = updateDraft(id, DEMO_USER_ID, patch);
  return NextResponse.json({ draft: updated });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const draft = getDraft(id, DEMO_USER_ID);
  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }
  return NextResponse.json({ draft });
}
