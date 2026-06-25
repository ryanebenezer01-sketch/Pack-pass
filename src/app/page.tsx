import Link from "next/link";
import { Faq } from "@/components/landing/faq";
import { UrlHero } from "@/components/landing/url-hero";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AGENTS } from "@/lib/agents";

const LOGOS = [
  "Northwind",
  "Acme",
  "Lumen",
  "Vertex",
  "Quanta",
  "Hatch",
  "Beacon",
  "Cobalt",
];

const TESTIMONIALS = [
  {
    quote:
      "We replaced three contractors with AI CMO. The SEO agent alone drafts a month of blog posts in our voice in an afternoon.",
    name: "Maya R.",
    role: "Founder, SaaS startup",
  },
  {
    quote:
      "The approval queue is the killer feature. Nothing goes out without me — but I'm reviewing, not writing from scratch.",
    name: "Devin K.",
    role: "Head of Growth",
  },
  {
    quote:
      "It found Reddit threads I'd never have spotted and drafted replies that actually sounded human. Wild.",
    name: "Priya S.",
    role: "Solo marketer",
  },
];

export default function HomePage() {
  return (
    <main className="bg-grid">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Mascot />
          <span>AI CMO</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <a href="#agents" className="hover:text-foreground">
            Agents
          </a>
          <a href="#pricing" className="hover:text-foreground">
            Pricing
          </a>
          <a href="#faq" className="hover:text-foreground">
            FAQ
          </a>
          <Link
            href="/dashboard"
            className="rounded-lg border border-border px-3 py-1.5 text-foreground hover:bg-card"
          >
            Dashboard
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-16 text-center sm:pt-24">
        <Badge tone="accent" className="mb-6">
          Human-in-the-loop · nothing posts without you
        </Badge>
        <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Your entire marketing team,
          <br />
          <span className="text-accent">running 24/7.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted">
          Enter your URL. We analyze your brand, then deploy specialized AI
          agents that draft content for every channel — and queue it for your
          approval.
        </p>
        <div className="mt-10">
          <UrlHero />
          <p className="mt-3 text-xs text-muted">
            No credit card required · Free tier includes the SEO agent
          </p>
        </div>
      </section>

      {/* Logo marquee */}
      <section className="border-y border-border py-8">
        <p className="mb-6 text-center text-xs uppercase tracking-widest text-muted">
          Trusted by lean teams everywhere
        </p>
        <div className="relative overflow-hidden">
          <div className="flex w-max animate-marquee gap-12 px-6">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <span
                key={i}
                className="text-xl font-semibold text-border"
                style={{ color: "#3a3a42" }}
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Agents grid */}
      <section id="agents" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Ten agents. One brand voice.</h2>
          <p className="mt-3 text-muted">
            Each agent owns a channel, runs on a schedule, and reports into a
            single approval queue.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((agent) => (
            <Card key={agent.key}>
              <CardContent className="pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-2xl">{agent.glyph}</span>
                  {agent.implemented ? (
                    <Badge tone="success">Live</Badge>
                  ) : (
                    <Badge tone="muted">Soon</Badge>
                  )}
                </div>
                <h3 className="font-semibold">{agent.name}</h3>
                <p className="mt-1 text-sm text-muted">{agent.tagline}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name}>
              <CardContent className="pt-6">
                <p className="text-sm leading-relaxed text-foreground">
                  “{t.quote}”
                </p>
                <div className="mt-4 text-sm">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-muted">{t.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison / pricing */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Without AI CMO vs. with it</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-danger/30">
            <CardContent className="pt-6">
              <h3 className="mb-4 font-semibold text-muted">Without AI CMO</h3>
              <ul className="space-y-3 text-sm text-muted">
                {[
                  "Juggling freelancers across every channel",
                  "Blank-page paralysis every week",
                  "Missing relevant threads and trends",
                  "Inconsistent brand voice",
                  "$5k+/mo and still behind",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-danger">✕</span> {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-accent/40">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">With AI CMO — Max</h3>
                <Badge tone="accent">$99/mo</Badge>
              </div>
              <ul className="space-y-3 text-sm text-foreground">
                {[
                  "All 10 agents drafting around the clock",
                  "Drafts ready the moment you sit down",
                  "Threads & trends surfaced automatically",
                  "One brand voice across every channel",
                  "Approve, edit, ship — in minutes",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-success">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/onboarding"
                className="mt-6 block rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-medium text-accent-foreground hover:bg-accent/90"
              >
                Start free
              </Link>
            </CardContent>
          </Card>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Free tier: the SEO agent + 5 drafts/month. Upgrade to Max for all
          agents and unlimited drafts.
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Frequently asked questions
        </h2>
        <Faq />
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <Mascot />
            <span>AI CMO</span>
          </div>
          <p>Built as a reference architecture · Human-in-the-loop by design</p>
        </div>
      </footer>
    </main>
  );
}

/** Pixel/retro-style robot mascot (inline SVG, no asset needed). */
function Mascot() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      shapeRendering="crispEdges"
    >
      <rect x="3" y="2" width="10" height="2" fill="#6d5efc" />
      <rect x="2" y="4" width="12" height="8" fill="#6d5efc" />
      <rect x="4" y="6" width="2" height="2" fill="#0a0a0a" />
      <rect x="10" y="6" width="2" height="2" fill="#0a0a0a" />
      <rect x="5" y="9" width="6" height="1" fill="#0a0a0a" />
      <rect x="6" y="12" width="4" height="2" fill="#6d5efc" />
      <rect x="7" y="0" width="2" height="2" fill="#3ecf8e" />
    </svg>
  );
}
