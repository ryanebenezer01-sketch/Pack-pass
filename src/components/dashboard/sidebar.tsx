"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Agents", icon: "▦" },
  { href: "/dashboard/drafts", label: "Approval Queue", icon: "✉" },
  { href: "/dashboard/brand", label: "Brand Profile", icon: "✦" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:block">
      <div className="sticky top-0 flex h-screen flex-col p-4">
        <Link href="/" className="mb-8 flex items-center gap-2 px-2 py-1 font-semibold">
          <Mascot />
          <span>AI CMO</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-card text-foreground"
                    : "text-muted hover:bg-card hover:text-foreground",
                )}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-lg border border-border bg-card p-3 text-xs text-muted">
          <div className="mb-1 font-medium text-foreground">Free tier</div>
          SEO agent · 5 drafts/mo
          <Link
            href="/#pricing"
            className="mt-2 block text-accent hover:underline"
          >
            Upgrade to Max →
          </Link>
        </div>
      </div>
    </aside>
  );
}

function Mascot() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden>
      <rect x="3" y="2" width="10" height="2" fill="#6d5efc" />
      <rect x="2" y="4" width="12" height="8" fill="#6d5efc" />
      <rect x="4" y="6" width="2" height="2" fill="#0a0a0a" />
      <rect x="10" y="6" width="2" height="2" fill="#0a0a0a" />
      <rect x="5" y="9" width="6" height="1" fill="#0a0a0a" />
      <rect x="6" y="12" width="4" height="2" fill="#6d5efc" />
    </svg>
  );
}
