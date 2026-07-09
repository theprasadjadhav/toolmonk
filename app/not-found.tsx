import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/lib/tools/registry";

export const metadata: Metadata = {
  title: "404 — Page Not Found | ToolMonk",
  description: "The page you're looking for doesn't exist. Browse 180+ free online tools at ToolMonk.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
      {/* 404 number */}
      <p className="font-mono text-[120px] sm:text-[160px] leading-none font-bold text-border select-none">
        404
      </p>

      {/* Message */}
      <div className="mt-6 text-center max-w-md">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-3">
          — page not found
        </p>
        <h1 className="font-mono text-2xl md:text-3xl text-foreground mb-4 leading-tight">
          This page doesn&apos;t exist.
        </h1>
        <p className="font-mono text-sm text-foreground-muted leading-relaxed">
          The URL may be mistyped, or the page may have been moved or removed.
          All{" "}
          <Link href="/all-tools" className="text-primary hover:underline">
            180+ tools
          </Link>{" "}
          are still available.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="font-mono text-sm bg-primary text-white px-5 py-2.5 hover:bg-primary-hover transition-colors"
        >
          ← Go home
        </Link>
        <Link
          href="/all-tools"
          className="font-mono text-sm border border-border text-foreground-muted px-5 py-2.5 hover:border-primary/40 hover:text-primary transition-colors"
        >
          Browse all tools
        </Link>
      </div>

      {/* Quick category links */}
      <div className="mt-12 border-t border-border pt-10 w-full max-w-lg">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground-muted mb-5 text-center">
          — or jump to a category
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.path}
              className="font-mono text-[11px] border border-border text-foreground-muted px-3 py-1.5 hover:border-primary/40 hover:text-primary transition-colors"
            >
              {cat.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
