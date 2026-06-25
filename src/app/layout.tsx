import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI CMO — Your 24/7 AI Marketing Team",
  description:
    "Enter your URL and deploy specialized AI agents that draft content for every channel — SEO, Reddit, LinkedIn, X, and more. You approve everything before it ships.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
