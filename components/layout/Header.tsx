"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, TOOLS } from "@/lib/tools/registry";
import { getCategoryIcon, getToolIcon } from "@/components/icons";
import { BRAND_NAME, LOGO_PATH } from "@/lib/brand";
import type { ToolMeta } from "@/lib/tools/types";

const PRIMARY_NAV = [
  "calculators",
  "converters",
  "dev-tools",
  "text-tools",
  "generators",
];

// ── Search dropdown ────────────────────────────────────────────────────────────

function SearchDropdown({
  results,
  query,
  onNavigate,
}: {
  results: ToolMeta[];
  query: string;
  onNavigate: () => void;
}) {
  if (results.length > 0) {
    return (
      <ul className="border border-border bg-surface shadow-2xl overflow-hidden">
        {results.map((tool) => {
          const Icon = getToolIcon(tool);
          return (
            <li key={tool.slug}>
              <Link
                href={tool.path}
                onClick={onNavigate}
                className="group flex items-center gap-3 px-3 py-2.5 hover:bg-surface-muted transition-colors border-b border-border/30 last:border-0"
              >
                <span className="w-6 h-6 shrink-0 flex items-center justify-center text-foreground-muted group-hover:text-primary transition-colors">
                  <Icon size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-foreground group-hover:text-primary transition-colors truncate">
                    {tool.title}
                  </p>
                  <p className="font-mono text-[9px] tracking-wider text-foreground-muted mt-0.5 capitalize">
                    {tool.category.replace(/-/g, " ")}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }
  if (query.length >= 2) {
    return (
      <div className="border border-border bg-surface shadow-2xl p-4">
        <p className="font-mono text-[11px] text-foreground-muted text-center">
          no results for &#x201C;{query}&#x201D;
        </p>
      </div>
    );
  }
  return null;
}

// ── Header ─────────────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("toolkit-theme") as "dark" | "light" | null;
    const system = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    const active = stored ?? system;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(active);
    if (stored) {
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(stored);
    }
  }, []);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Reset search on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");
    setDropdownOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(next);
    try {
      localStorage.setItem("toolkit-theme", next);
    } catch {}
  };

  const primaryCategories = CATEGORIES.filter((c) => PRIMARY_NAV.includes(c.slug));

  const results =
    query.length >= 2
      ? TOOLS.filter(
          (t) =>
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 7)
      : [];

  const clearSearch = () => {
    setQuery("");
    setDropdownOpen(false);
  };

  const handleNavigate = () => {
    setQuery("");
    setDropdownOpen(false);
    setMobileSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-sm border-b border-border">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="ToolMonk home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_PATH}
              alt={BRAND_NAME}
              width={25}
              height={25}
              className="shrink-0"
            />
            <span className="font-mono text-base text-foreground group-hover:text-primary transition-colors leading-none">
              {BRAND_NAME}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-0.5"
            aria-label="Main navigation"
          >
            {isHomePage && primaryCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.path}
                className="px-3 py-2 font-mono text-[11px] tracking-wider text-foreground-muted hover:text-foreground transition-colors rounded-md hover:bg-surface-muted"
              >
                {cat.title.toLowerCase()}
              </Link>
            ))}

            {/* Search bar — hidden on homepage */}
            {!isHomePage && (
              <div ref={desktopSearchRef} className="relative mx-1.5">
                <div className="relative">
                  <span
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted/50 pointer-events-none"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setDropdownOpen(true);
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    onKeyDown={(e) => e.key === "Escape" && setDropdownOpen(false)}
                    placeholder="Search tools..."
                    autoComplete="off"
                    aria-label="Search tools"
                    className="w-72 pl-7 pr-6 py-1.5 font-mono text-[11px] bg-surface-muted border border-border text-foreground placeholder:text-foreground-muted/50 focus:border-foreground-muted/40 transition-colors"
                  />
                  {query.length > 0 && (
                    <button
                      onClick={clearSearch}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-muted/50 hover:text-foreground-muted transition-colors"
                    >
                      <svg
                        className="w-2.5 h-2.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                {dropdownOpen && query.length >= 2 && (
                  <div className="absolute top-full left-0 mt-1 w-72 z-50">
                    <SearchDropdown
                      results={results}
                      query={query}
                      onNavigate={handleNavigate}
                    />
                  </div>
                )}
              </div>
            )}

            <Link
              href="/all-tools"
              className="px-3 py-2 font-mono text-[11px] tracking-wider text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
            >
              all tools
              <svg
                className="w-2.5 h-2.5"
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
            <span className="mx-1 h-3.5 w-px bg-border" aria-hidden="true" />

            <button
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
              className="ml-1 p-2 rounded-md text-foreground-muted hover:text-foreground transition-colors"
            >
              {theme === "dark" ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                  />
                </svg>
              )}
            </button>
          </nav>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-1">
            {/* Search icon — hidden on homepage */}
            {!isHomePage && (
              <button
                onClick={() => setMobileSearchOpen((v) => !v)}
                aria-label={mobileSearchOpen ? "Close search" : "Open search"}
                className="p-2 text-foreground-muted hover:text-foreground transition-colors"
              >
                {mobileSearchOpen ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </button>
            )}
            <button
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
              className="p-2 rounded-md text-foreground-muted hover:text-foreground transition-colors"
            >
              {theme === "dark" ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="p-2 rounded-md text-foreground-muted hover:text-foreground transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile search bar — expands below header row */}
        {!isHomePage && mobileSearchOpen && (
          <div className="border-t border-border py-2.5">
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted/50 pointer-events-none"
                aria-hidden="true"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                onKeyDown={(e) =>
                  e.key === "Escape" && setMobileSearchOpen(false)
                }
                placeholder="Search tools..."
                autoFocus
                autoComplete="off"
                aria-label="Search tools"
                className="w-full pl-9 pr-4 py-2 font-mono text-xs bg-surface-muted border border-border text-foreground placeholder:text-foreground-muted/50 focus:border-foreground-muted/40 transition-colors"
              />
            </div>
            {dropdownOpen && query.length >= 2 && (
              <div className="mt-1">
                <SearchDropdown
                  results={results}
                  query={query}
                  onNavigate={handleNavigate}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          className="md:hidden border-t border-border bg-surface-muted"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-1">
            {CATEGORIES.map((cat) => {
              const Icon = getCategoryIcon(cat.slug);
              return (
                <Link
                  key={cat.slug}
                  href={cat.path}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 font-mono text-xs text-foreground-muted hover:text-foreground hover:bg-surface-elevated rounded-md transition-colors"
                >
                  <span className="shrink-0 text-foreground-muted">
                    <Icon size={14} />
                  </span>
                  <span className="truncate">{cat.title.toLowerCase()}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
