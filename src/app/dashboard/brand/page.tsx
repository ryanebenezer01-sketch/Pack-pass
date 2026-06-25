import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DEMO_USER_ID, getLatestBrand } from "@/lib/store";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function BrandPage() {
  const brand = getLatestBrand(DEMO_USER_ID);

  if (!brand) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">No brand profile yet</h1>
        <Link href="/onboarding" className="mt-6 inline-block">
          <Button size="lg">Run onboarding →</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-3xl font-bold">Brand Profile</h1>
      <p className="mt-1 text-sm text-muted">
        {brand.url} · updated {timeAgo(brand.updatedAt)}. Every agent works from
        this profile; it&apos;s re-analyzed periodically to stay current.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Field label="Name">{brand.name}</Field>
        <Field label="Industry">{brand.industry}</Field>
        <Field label="Brand voice" full>
          {brand.voice}
        </Field>
        <Field label="Target audience" full>
          {brand.targetAudience}
        </Field>
        <Field label="Value proposition" full>
          {brand.valueProposition}
        </Field>
        <Field label="Tone">
          <div className="flex flex-wrap gap-2">
            {brand.toneWords.map((w) => (
              <Badge key={w} tone="accent">
                {w}
              </Badge>
            ))}
          </div>
        </Field>
        <Field label="Competitors">
          <div className="flex flex-wrap gap-2">
            {brand.competitors.map((c) => (
              <Badge key={c} tone="muted">
                {c}
              </Badge>
            ))}
          </div>
        </Field>
        <Field label="Keywords" full>
          <div className="flex flex-wrap gap-2">
            {brand.keywords.map((k) => (
              <Badge key={k} tone="muted">
                {k}
              </Badge>
            ))}
          </div>
        </Field>
      </div>

      <div className="mt-8">
        <Link href="/onboarding">
          <Button variant="secondary">Re-analyze brand</Button>
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <Card className={full ? "md:col-span-2" : ""}>
      <CardContent className="pt-4">
        <div className="mb-1 text-xs uppercase tracking-wide text-muted">
          {label}
        </div>
        <div className="text-sm text-foreground">{children}</div>
      </CardContent>
    </Card>
  );
}
