import Link from "next/link";
import { DraftCard } from "@/components/dashboard/draft-card";
import { Badge } from "@/components/ui/badge";
import { DEMO_USER_ID, listDrafts } from "@/lib/store";
import type { Draft } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TABS: { key: Draft["status"] | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "scheduled", label: "Scheduled" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

export default async function DraftsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = (status as Draft["status"] | "all") ?? "pending";

  const all = listDrafts(DEMO_USER_ID);
  const drafts = active === "all" ? all : all.filter((d) => d.status === active);

  const count = (k: Draft["status"] | "all") =>
    k === "all" ? all.length : all.filter((d) => d.status === k).length;

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-3xl font-bold">Approval Queue</h1>
      <p className="mt-1 text-muted">
        Every agent-generated draft lands here. Approve, edit, schedule, or
        reject — nothing ships until you say so.
      </p>

      {/* Filter tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/dashboard/drafts?status=${tab.key}`}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
              active === tab.key
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border text-muted hover:text-foreground",
            )}
          >
            {tab.label}
            <Badge tone="muted">{count(tab.key)}</Badge>
          </Link>
        ))}
      </div>

      {/* List */}
      <div className="mt-6 grid gap-4">
        {drafts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted">
            No {active === "all" ? "" : active} drafts yet. Run an agent from the{" "}
            <Link href="/dashboard" className="text-accent hover:underline">
              dashboard
            </Link>
            .
          </div>
        ) : (
          drafts.map((draft) => <DraftCard key={draft.id} draft={draft} />)
        )}
      </div>
    </div>
  );
}
