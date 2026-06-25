"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Hero URL input → kicks off onboarding with the entered site. */
export function UrlHero() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    router.push(`/onboarding?url=${encodeURIComponent(url.trim())}`);
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex w-full max-w-xl flex-col gap-3 sm:flex-row"
    >
      <input
        type="text"
        inputMode="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="yourcompany.com"
        aria-label="Your website URL"
        className="h-12 flex-1 rounded-lg border border-border bg-card px-4 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <Button type="submit" size="lg" className="shrink-0">
        Analyze my brand →
      </Button>
    </form>
  );
}
