"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AgentKey } from "@/lib/types";

/** Triggers an on-demand agent run, then refreshes server data. */
export function AgentRunButton({
  agentKey,
  count = 2,
}: {
  agentKey: AgentKey;
  count?: number;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setRunning(true);
    setError("");
    try {
      const res = await fetch(`/api/agents/${agentKey}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
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
    <div className="text-right">
      <Button size="lg" onClick={run} disabled={running}>
        {running ? "Running agent…" : "Run now"}
      </Button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
