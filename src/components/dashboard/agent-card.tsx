"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AgentDefinition } from "@/lib/types";

export interface AgentCardData {
  agent: AgentDefinition;
  pending: number;
  total: number;
  /** ISO timestamp of the most recent run, if any. */
  lastRun?: string;
}

export function AgentCard({ agent, pending, total, lastRun }: AgentCardData) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const status: "active" | "idle" = running ? "active" : "idle";

  async function run() {
    if (!agent.implemented) return;
    setRunning(true);
    setError("");
    try {
      const res = await fetch(`/api/agents/${agent.key}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 2 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Run failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col pt-5">
        <div className="mb-3 flex items-start justify-between">
          <span className="text-3xl">{agent.glyph}</span>
          <StatusDot status={running ? "active" : agent.implemented ? "idle" : "idle"} label={running ? "Running" : status} />
        </div>

        <h3 className="font-semibold">{agent.name}</h3>
        <p className="mt-1 flex-1 text-sm text-muted">{agent.tagline}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {agent.integrations.slice(0, 2).map((i) => (
            <Badge key={i} tone="muted" className="text-[10px]">
              {i}
            </Badge>
          ))}
          <Badge tone="muted" className="text-[10px]">
            {agent.cadence}
          </Badge>
        </div>

        <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-sm">
          <Stat value={pending} label="pending" highlight={pending > 0} />
          <Stat value={total} label="total" />
        </div>

        {error && <p className="mt-2 text-xs text-danger">{error}</p>}

        <div className="mt-4 flex gap-2">
          {agent.implemented ? (
            <>
              <Button size="sm" onClick={run} disabled={running} className="flex-1">
                {running ? "Running…" : "Run now"}
              </Button>
              <Link href={`/dashboard/agents/${agent.key}`}>
                <Button size="sm" variant="secondary">
                  Open
                </Button>
              </Link>
            </>
          ) : (
            <Button size="sm" variant="ghost" disabled className="flex-1">
              Coming soon
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusDot({
  status,
  label,
}: {
  status: "active" | "idle";
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted">
      <span
        className={
          status === "active"
            ? "h-2 w-2 rounded-full bg-success animate-pulse-slow"
            : "h-2 w-2 rounded-full bg-muted"
        }
      />
      {label}
    </span>
  );
}

function Stat({
  value,
  label,
  highlight,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <span
        className={highlight ? "font-semibold text-accent" : "font-semibold text-foreground"}
      >
        {value}
      </span>{" "}
      <span className="text-muted">{label}</span>
    </div>
  );
}
