"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BrandProfile } from "@/lib/types";

type Phase = "input" | "analyzing" | "done" | "error";

const STEPS = [
  "Fetching your site…",
  "Reading your content…",
  "Extracting your brand voice…",
  "Identifying keywords & audience…",
  "Building your Brand Profile…",
];

export function OnboardingFlow() {
  const params = useSearchParams();
  const initialUrl = params.get("url") ?? "";

  const [url, setUrl] = useState(initialUrl);
  const [phase, setPhase] = useState<Phase>("input");
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [error, setError] = useState("");
  const started = useRef(false);

  async function analyze(target: string) {
    setPhase("analyzing");
    setStep(0);
    setError("");

    // Walk the visible progress steps while the request runs.
    const ticker = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      900,
    );

    try {
      const res = await fetch("/api/brand/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setBrand(data.brand);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPhase("error");
    } finally {
      clearInterval(ticker);
    }
  }

  // Auto-start when arriving from the landing-page hero with ?url=.
  useEffect(() => {
    if (initialUrl && !started.current) {
      started.current = true;
      void analyze(initialUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="mb-10 inline-block text-sm text-muted hover:text-foreground">
        ← Back
      </Link>

      {phase === "input" && (
        <div>
          <h1 className="text-3xl font-bold">Let&apos;s analyze your brand</h1>
          <p className="mt-2 text-muted">
            Enter your website and we&apos;ll build your Brand Profile.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (url.trim()) void analyze(url.trim());
            }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yourcompany.com"
              className="h-12 flex-1 rounded-lg border border-border bg-card px-4 text-base placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <Button type="submit" size="lg">
              Analyze →
            </Button>
          </form>
        </div>
      )}

      {phase === "analyzing" && (
        <div className="py-10">
          <h1 className="text-2xl font-bold">Analyzing {url}</h1>
          <ul className="mt-8 space-y-3">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span
                  className={
                    i < step
                      ? "text-success"
                      : i === step
                        ? "text-accent"
                        : "text-muted"
                  }
                >
                  {i < step ? "✓" : i === step ? "◐" : "○"}
                </span>
                <span className={i <= step ? "text-foreground" : "text-muted"}>
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {phase === "error" && (
        <div className="py-10">
          <h1 className="text-2xl font-bold text-danger">Analysis failed</h1>
          <p className="mt-2 text-muted">{error}</p>
          <Button className="mt-6" onClick={() => setPhase("input")}>
            Try again
          </Button>
        </div>
      )}

      {phase === "done" && brand && (
        <div>
          <Badge tone="success" className="mb-4">
            Brand Profile ready
          </Badge>
          <h1 className="text-3xl font-bold">{brand.name}</h1>
          <p className="mt-1 text-sm text-muted">{brand.url}</p>

          <div className="mt-8 grid gap-4">
            <Field label="Industry">{brand.industry}</Field>
            <Field label="Brand voice">{brand.voice}</Field>
            <Field label="Target audience">{brand.targetAudience}</Field>
            <Field label="Value proposition">{brand.valueProposition}</Field>
            <Field label="Tone">
              <div className="flex flex-wrap gap-2">
                {brand.toneWords.map((w) => (
                  <Badge key={w} tone="accent">
                    {w}
                  </Badge>
                ))}
              </div>
            </Field>
            <Field label="Keywords">
              <div className="flex flex-wrap gap-2">
                {brand.keywords.map((k) => (
                  <Badge key={k} tone="muted">
                    {k}
                  </Badge>
                ))}
              </div>
            </Field>
          </div>

          <div className="mt-10 flex gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button size="lg" className="w-full">
                Go to your dashboard →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="mb-1 text-xs uppercase tracking-wide text-muted">
          {label}
        </div>
        <div className="text-sm text-foreground">{children}</div>
      </CardContent>
    </Card>
  );
}
