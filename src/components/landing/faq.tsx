"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Does AI CMO post anything automatically?",
    a: "No. Every agent drafts content and drops it into your approval queue. Nothing publishes until you approve it — that human-in-the-loop model is the whole point.",
  },
  {
    q: "How does brand analysis work?",
    a: "You enter your URL, we scrape your site, and an LLM extracts your brand voice, industry, target audience, and the keywords you should rank for — stored as a reusable Brand Profile that every agent shares.",
  },
  {
    q: "Which channels do the agents cover?",
    a: "SEO, Reddit, LinkedIn, X, long-form writing, GEO (AI search), UGC video, influencer discovery, technical SEO fixes, and Hacker News — each as its own configurable agent.",
  },
  {
    q: "Do I need API keys for every integration?",
    a: "No. Agents always draft. Platform integrations (Search Console, Reddit, LinkedIn, X, etc.) only enable one-click publishing and live data — without them, agents still generate drafts for you to copy out.",
  },
  {
    q: "How often do agents run?",
    a: "Each agent runs on its own configurable cadence (hourly, daily, or weekly) as a background job, and your brand profile is periodically re-analyzed to stay current.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-2xl divide-y divide-border rounded-xl border border-border bg-card">
      {FAQS.map((item, i) => (
        <div key={item.q}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="font-medium text-foreground">{item.q}</span>
            <span
              className={cn(
                "shrink-0 text-muted transition-transform",
                open === i && "rotate-45",
              )}
            >
              +
            </span>
          </button>
          {open === i && (
            <p className="px-5 pb-5 text-sm leading-relaxed text-muted">
              {item.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
