"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { ToolMeta } from "@/lib/tools/types";
import { getToolIcon } from "@/components/icons";

interface SearchBarProps {
  tools: ToolMeta[];
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  tools,
  placeholder = "Search tools...",
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results =
    query.length >= 2
      ? (() => {
          const q = query.toLowerCase();
          const filtered = tools.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.keywords.some((k) => k.toLowerCase().includes(q))
          );
          // Deduplicate by slug: skip aliasOf entries when the canonical exists
          const seen = new Set<string>();
          return filtered
            .filter((t) => {
              if (t.aliasOf && filtered.some((c) => c.slug === t.slug && !c.aliasOf)) {
                return false; // canonical present — skip alias
              }
              if (seen.has(t.slug)) return false;
              seen.add(t.slug);
              return true;
            })
            .slice(0, 8);
        })()
      : [];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative z-10 w-full max-w-xl", className)}
    >
      <div className="relative">
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs text-primary pointer-events-none select-none"
          aria-hidden="true"
        >
          &gt;
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-20 py-3.5 text-sm bg-surface-muted border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none font-mono"
          aria-label="Search tools"
          aria-expanded={open && results.length > 0}
          aria-controls={open ? "search-results" : undefined}
          role="combobox"
          aria-autocomplete="list"
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query.length > 0 && (
            <button
              onClick={() => { setQuery(""); setOpen(false); }}
              aria-label="Clear search"
              className="p-0.5 text-foreground-muted hover:text-foreground transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
        </div>
      </div>

      {open && results.length > 0 && (
        <ul
          id="search-results"
          role="listbox"
          style={{ backgroundColor: "var(--surface)" }}
          className="absolute top-full left-0 right-0 mt-2 border border-border rounded-xl shadow-2xl overflow-hidden z-50"
        >
          {results.map((tool) => {
            const Icon = getToolIcon(tool);
            return (
              <li key={tool.path} role="option" aria-selected={false}>
                <Link
                  href={tool.path}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  style={{ backgroundColor: "var(--surface)" }}
                  className="group flex items-center gap-3 px-4 py-3 hover:bg-surface-muted transition-colors border-b border-border/30 last:border-0"
                >
                  <span className="w-7 h-7 shrink-0 flex items-center justify-center text-foreground-muted group-hover:text-primary transition-colors">
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {tool.title}
                    </p>
                    <p className="font-mono text-[10px] tracking-wider text-foreground-muted mt-0.5 capitalize">
                      {tool.category.replace(/-/g, " ")}
                      {tool.subcategory &&
                        ` / ${tool.subcategory.replace(/-/g, " ")}`}
                    </p>
                  </div>
                  <svg
                    className="w-3 h-3 text-foreground-muted shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {open && query.length >= 2 && results.length === 0 && (
        <div style={{ backgroundColor: "var(--surface)" }} className="absolute top-full left-0 right-0 mt-1 border border-border rounded-xl shadow-2xl p-5 z-50">
          <p className="font-mono text-xs text-foreground-muted text-center">
            no results for &#x201C;{query}&#x201D;
          </p>
        </div>
      )}
    </div>
  );
}
