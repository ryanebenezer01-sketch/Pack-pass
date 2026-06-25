import Link from "next/link";
import { AgentCard } from "@/components/dashboard/agent-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AGENTS } from "@/lib/agents";
import { hasApiKey } from "@/lib/ai";
import {
  DEMO_USER_ID,
  getLatestBrand,
  listDrafts,
  listRuns,
} from "@/lib/store";
import type { AgentKey } from "@/lib/types";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const brand = getLatestBrand(DEMO_USER_ID);
  const drafts = listDrafts(DEMO_USER_ID);
  const runs = listRuns(DEMO_USER_ID);

  const pendingTotal = drafts.filter((d) => d.status === "pending").length;

  const countsByAgent = (agent: AgentKey) => {
    const forAgent = drafts.filter((d) => d.agent === agent);
    const lastRun = runs.find((r) => r.agent === agent)?.startedAt;
    return {
      pending: forAgent.filter((d) => d.status === "pending").length,
      total: forAgent.length,
      lastRun,
    };
  };

  if (!brand) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">No brand profile yet</h1>
        <p className="mt-2 text-muted">
          Run onboarding to analyze your site and unlock your agents.
        </p>
        <Link href="/onboarding" className="mt-6 inline-block">
          <Button size="lg">Start onboarding →</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-muted">
            <span>Brand</span>
            <Link href="/dashboard/brand" className="text-accent hover:underline">
              {brand.name}
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="mt-1 text-muted">
            {AGENTS.filter((a) => a.implemented).length} agent live ·{" "}
            {pendingTotal} draft{pendingTotal === 1 ? "" : "s"} awaiting approval
          </p>
        </div>
        <Link href="/dashboard/drafts">
          <Button variant="secondary">
            Approval queue
            {pendingTotal > 0 && (
              <Badge tone="accent" className="ml-1">
                {pendingTotal}
              </Badge>
            )}
          </Button>
        </Link>
      </div>

      {!hasApiKey() && (
        <div className="mb-6 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <strong>Demo mode:</strong> <code>ANTHROPIC_API_KEY</code> is not set —
          agents generate placeholder drafts. Add the key to generate real,
          brand-voiced content.
        </div>
      )}

      {/* Agent grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {AGENTS.map((agent) => {
          const c = countsByAgent(agent.key);
          return (
            <AgentCard
              key={agent.key}
              agent={agent}
              pending={c.pending}
              total={c.total}
              lastRun={c.lastRun}
            />
          );
        })}
      </div>
    </div>
  );
}
