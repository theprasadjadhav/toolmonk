"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { CATEGORIES, SUBCATEGORIES, TOOLS } from "@/lib/tools/registry";
import { ToolCard } from "@/components/tool/ToolCard";
import { getCategoryIcon } from "@/components/icons";
import type { CategoryMeta, SubcategoryMeta, ToolMeta } from "@/lib/tools/types";

// ── Constants ────────────────────────────────────────────────────────────────

const HEADER_OFFSET = 48;

// ── Data ─────────────────────────────────────────────────────────────────────

interface Section {
  category: CategoryMeta;
  subcategories: { sub: SubcategoryMeta; tools: ToolMeta[] }[];
  flatTools: ToolMeta[];
}

const SECTIONS: Section[] = CATEGORIES.map((cat) => ({
  category: cat,
  subcategories: SUBCATEGORIES.filter((s) => s.category === cat.slug).map((sub) => ({
    sub,
    tools: TOOLS.filter((t) => t.category === cat.slug && t.subcategory === sub.slug),
  })),
  flatTools: TOOLS.filter((t) => t.category === cat.slug && !t.subcategory),
}));

// ── ID helpers ───────────────────────────────────────────────────────────────

const catId = (slug: string) => `cat-${slug}`;
const subId = (slug: string) => `sub-${slug}`;
const toolId = (slug: string) => `tool-${slug}`;

// ── Sidebar flat item list (category + subcategories only) ───────────────────

type SidebarItem =
  | { kind: "category"; id: string; label: string; catSlug: string }
  | { kind: "subcategory"; id: string; label: string; catSlug: string };

const SIDEBAR_ITEMS: SidebarItem[] = SECTIONS.flatMap(
  ({ category, subcategories }) => [
    { kind: "category", id: catId(category.slug), label: category.title, catSlug: category.slug },
    ...subcategories.map(({ sub }) => ({
      kind: "subcategory" as const,
      id: `sub-${sub.slug}`,
      label: sub.title,
      catSlug: category.slug,
    })),
  ]
);

// Ordered list of IDs matching document order — used to find topmost active
const SPY_IDS = SIDEBAR_ITEMS.map((i) => i.id);

// ── Component ─────────────────────────────────────────────────────────────────

export function AllToolsPage() {
  // All IDs currently intersecting the active viewport band
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  // The topmost intersecting ID (gets primary colour)
  const [topId, setTopId] = useState<string | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);
  // Mutable ref so the observer closure never becomes stale
  const intersecting = useRef<Set<string>>(new Set());

  // ── Scroll spy ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const flush = () => {
      const snap = new Set(intersecting.current);
      let top: string | null = null;
      for (const id of SPY_IDS) {
        if (snap.has(id)) { top = id; break; }
      }
      setTopId(top);
      setActiveIds(snap);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) =>
          e.isIntersecting
            ? intersecting.current.add(e.target.id)
            : intersecting.current.delete(e.target.id)
        );
        flush();
      },
      // mirror the reference: trigger when the element enters/leaves the viewport.
      // -80% bottom margin = only items in the top ~20% of the viewport count.
      { rootMargin: "0px 0px -80% 0px", threshold: 0 }
    );

    SPY_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // ── Auto-scroll sidebar so topId stays visible ───────────────────────────────
  useEffect(() => {
    if (!topId || !sidebarRef.current) return;
    const container = sidebarRef.current;
    const el = container.querySelector(`[data-sid="${topId}"]`) as HTMLElement | null;
    if (!el) return;

    const elTop = el.offsetTop;
    const elBottom = elTop + el.offsetHeight;
    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;

    if (elTop < viewTop + 48) {
      container.scrollTo({ top: Math.max(0, elTop - 48), behavior: "smooth" });
    } else if (elBottom > viewBottom - 48) {
      container.scrollTo({ top: elBottom - container.clientHeight + 48, behavior: "smooth" });
    }
  }, [topId]);

  // ── Click: scroll main content to element ───────────────────────────────────
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  return (
    <div>
      {/* ── Breadcrumb ── */}
      <div className="border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <ol className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-foreground-muted">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                home
              </Link>
            </li>
            <li><span className="text-border select-none">/</span></li>
            <li><span className="text-foreground">all tools</span></li>
          </ol>
        </div>
      </div>

      {/* ── Two-column grid ─────────────────────────────────────────────────────
           mirrors the reference: 1fr + fixed-width nav, nav is sticky + self-start
      ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="lg:grid lg:grid-cols-[1fr_14rem] xl:grid-cols-[1fr_16rem] gap-0">

          {/* ── Scrolling main content ── */}
          <main className="min-w-0 py-10 space-y-16 pr-0 lg:pr-10">
            {SECTIONS.map(({ category, subcategories, flatTools }) => {
              const CatIcon = getCategoryIcon(category.slug);
              const totalTools = TOOLS.filter((t) => t.category === category.slug).length;

              return (
                <section key={category.slug}>
                  {/* Category heading */}
                  <div
                    id={catId(category.slug)}
                    style={{ scrollMarginTop: `${HEADER_OFFSET + 20}px` }}
                    className="flex items-start gap-4 mb-8 pb-5 border-b border-border"
                  >
                    <span
                      className="shrink-0 w-10 h-10 flex items-center justify-center border border-border"
                      style={{ backgroundColor: `${category.color}14`, color: category.color }}
                    >
                      <CatIcon size={20} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-mono text-foreground leading-tight">
                        {category.title}
                      </h2>
                      <p className="font-mono text-xs text-foreground-muted mt-1 leading-relaxed max-w-lg">
                        {category.description}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] tracking-wider text-foreground-muted shrink-0 mt-0.5">
                      {totalTools} tools
                    </span>
                  </div>

                  <div className="space-y-10">
                    {/* Subcategory groups */}
                    {subcategories.map(({ sub, tools }) => (
                      <div key={sub.slug}>
                        <div
                          id={subId(sub.slug)}
                          style={{ scrollMarginTop: `${HEADER_OFFSET + 20}px` }}
                          className="mb-4"
                        >
                          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-1">
                            — {category.title}
                          </p>
                          <h3 className="text-base font-mono text-foreground">{sub.title}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {tools.map((tool) => (
                            <div
                              key={tool.slug}
                              id={toolId(tool.slug)}
                              style={{ scrollMarginTop: `${HEADER_OFFSET + 20}px` }}
                            >
                              <ToolCard tool={tool} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Flat tools that live alongside subcategories */}
                    {subcategories.length > 0 && flatTools.length > 0 && (
                      <div>
                        <div className="mb-4">
                          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-foreground-muted mb-1">
                            — Other
                          </p>
                          <h3 className="text-base font-mono text-foreground">
                            Other {category.title}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {flatTools.map((tool) => (
                            <div
                              key={tool.slug}
                              id={toolId(tool.slug)}
                              style={{ scrollMarginTop: `${HEADER_OFFSET + 20}px` }}
                            >
                              <ToolCard tool={tool} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category with only flat tools (no subcategories) */}
                    {subcategories.length === 0 && flatTools.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {flatTools.map((tool) => (
                          <div
                            key={tool.slug}
                            id={toolId(tool.slug)}
                            style={{ scrollMarginTop: `${HEADER_OFFSET + 20}px` }}
                          >
                            <ToolCard tool={tool} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </main>

          {/* ── Sticky TOC (reference pattern: sticky + self-start + own scroll) ── */}
          <aside className="hidden lg:flex border-border self-start sticky top-12">
            <div className="border-l border-border my-4"></div>
            <div
              ref={sidebarRef}
              className="overflow-y-auto w-full py-8 px-5"
              style={{ height: "calc(100vh - 3rem)", scrollbarWidth: "none" }}
            >
              <nav>
                {SIDEBAR_ITEMS.map((item) => {
                  const isTop = item.id === topId;
                  const isActive = activeIds.has(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-sid={item.id}
                      onClick={() => scrollTo(item.id)}
                      className={cn(
                        "w-full text-left block font-mono cursor-pointer",
                        "transition-colors duration-[50ms]",
                        item.kind === "category"
                          ? "pt-4 pb-0.5 text-[9.5px] tracking-[0.2em] uppercase"
                          : "py-[3px] pl-3 text-[10.5px]",
                        isTop
                          ? "text-primary"
                          : isActive
                          ? "text-foreground"
                          : "text-foreground-muted/60 hover:text-foreground-muted"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
