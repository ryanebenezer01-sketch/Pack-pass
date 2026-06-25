"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { timeAgo } from "@/lib/utils";
import type { Draft } from "@/lib/types";

const STATUS_TONE = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  scheduled: "accent",
} as const;

export function DraftCard({ draft }: { draft: Draft }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(draft.title);
  const [body, setBody] = useState(draft.body);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function patch(payload: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch(`/api/drafts/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function saveEdits() {
    await patch({ title, body });
    setEditing(false);
  }

  const keyword = draft.meta.keyword as string | undefined;

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {editing ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-2 py-1 text-base font-semibold"
              />
            ) : (
              <h3 className="font-semibold">{draft.title}</h3>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <Badge tone="muted">{labelFor(draft.kind)}</Badge>
              {keyword && <span>kw: “{keyword}”</span>}
              <span>· {timeAgo(draft.createdAt)}</span>
            </div>
          </div>
          <Badge tone={STATUS_TONE[draft.status]}>{draft.status}</Badge>
        </div>

        {editing ? (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            className="w-full rounded-md border border-border bg-surface p-3 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
          />
        ) : (
          <div className="relative">
            <div className={expanded ? "" : "max-h-48 overflow-hidden"}>
              <Markdown content={draft.body} />
            </div>
            {!expanded && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
            )}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="relative mt-1 text-xs text-accent hover:underline"
            >
              {expanded ? "Show less" : "Show full draft"}
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {editing ? (
            <>
              <Button size="sm" onClick={saveEdits} disabled={busy}>
                Save edits
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setTitle(draft.title);
                  setBody(draft.body);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => patch({ action: "approve" })}
                disabled={busy || draft.status === "approved"}
              >
                ✓ Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditing(true)}
                disabled={busy}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => patch({ action: "schedule" })}
                disabled={busy}
              >
                Schedule
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => patch({ action: "reject" })}
                disabled={busy || draft.status === "rejected"}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function labelFor(kind: Draft["kind"]): string {
  return {
    blog_post: "Blog post",
    reddit_reply: "Reddit reply",
    social_post: "Social post",
    long_form: "Long-form",
    geo_content: "GEO content",
    video_brief: "Video brief",
    code_fix: "Code fix",
  }[kind];
}
