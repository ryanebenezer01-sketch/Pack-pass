import Link from "next/link";
import { notFound } from "next/navigation";
import { AgentRunButton } from "@/components/dashboard/agent-run-button";
import { DraftCard } from "@/components/dashboard/draft-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAgent } from "@/lib/agents";
import {
  DEMO_USER_ID,
  getLatestBrand,
  listDrafts,
  listRuns,
} from "@/lib/store";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const agent = getAgent(key);
  if (!agent) notFound();

  const brand = getLatestBrand(DEMO_USER_ID);
  const drafts = listDrafts(DEMO_USER_ID, { agent: agent.key });
  const runs = listRuns(DEMO_USER_ID, agent.key);
  const pending = drafts.filter((d) => d.status === "pending");

  return (
    <div className="px-6 py-8 lg:px-10">
      <Link
        href="/dashboard"
        className="mb-6 inline-block text-sm text-muted hover:text-foreground"
      >
        ← All agents
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{agent.glyph}</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{agent.name}</h1>
              {agent.implemented ? (
                <Badge tone="success">Live</Badge>
              ) : (
                <Badge tone="muted">Coming soon</Badge>
              )}
            </div>
            <p className="mt-2 max-w-xl text-muted">{agent.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {agent.integrations.map((i) => (
                <Badge key={i} tone="muted">
                  {i}
                </Badge>
              ))}
              <Badge tone="accent">{agent.cadence}</Badge>
            </div>
          </div>
        </div>
        {agent.implemented && brand && (
          <AgentRunButton agentKey={agent.key} />
        )}
      </div>

      {!brand && (
        <div className="mt-8 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          Complete onboarding to give this agent a brand profile to work from.
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <StatCard label="Pending" value={pending.length} highlight />
        <StatCard label="Total drafts" value={drafts.length} />
        <StatCard label="Runs" value={runs.length} />
      </div>

      {/* Recent runs */}
      {runs.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
            Recent runs
          </h2>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {runs.slice(0, 5).map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between px-5 py-3 text-sm"
                >
                  <span className="text-muted">{timeAgo(run.startedAt)}</span>
                  <span>{run.draftsCreated} drafts</span>
                  <Badge
                    tone={
                      run.status === "completed"
                        ? "success"
                        : run.status === "failed"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {run.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Drafts */}
      <h2 className="mb-3 mt-8 text-sm font-medium uppercase tracking-wide text-muted">
        Draft queue
      </h2>
      <div className="grid gap-4">
        {drafts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted">
            No drafts yet. {agent.implemented ? 'Hit "Run now" to generate some.' : ""}
          </div>
        ) : (
          drafts.map((draft) => <DraftCard key={draft.id} draft={draft} />)
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div
          className={
            highlight
              ? "text-3xl font-bold text-accent"
              : "text-3xl font-bold text-foreground"
          }
        >
          {value}
        </div>
        <div className="mt-1 text-sm text-muted">{label}</div>
      </CardContent>
    </Card>
  );
}
