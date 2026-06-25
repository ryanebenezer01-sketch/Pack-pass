import { Suspense } from "react";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-grid">
      <Suspense
        fallback={
          <div className="mx-auto max-w-2xl px-6 py-16 text-muted">Loading…</div>
        }
      >
        <OnboardingFlow />
      </Suspense>
    </main>
  );
}
