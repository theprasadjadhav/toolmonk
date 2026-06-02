# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**ToolMonk** (`toolmonk.net`) — a scalable multi-tool web platform hosting 185 fully-implemented online utilities (calculators, converters, dev tools, generators, compilers, etc.) under a single domain. The registry contains 216 entries total — 31 are intentional cross-category aliases (`aliasOf` field) that point to existing tools for discoverability. Think Calculator.net or RapidTables, built with modern Next.js.

---

## Commands

```bash
# Install dependencies
bun install

# Development server
bun dev

# Production build
bun run build

# Start production server
bun start

# Lint
bun run lint

# Type check
bunx tsc --noEmit

# Run tests (must use bun run test, NOT bun test — the latter uses Bun's runner without jsdom)
bun run test

# Run a single test file
bun run test -- "FileName"
```

Docker (main app):
```bash
docker build -t toolmonk .
docker run -p 3000:3000 toolmonk
```

Docker (code runner — ARM64 only):
```bash
docker buildx build --platform linux/arm64 -t toolmonk-code-runner docker/runner/
docker run -p 2000:2000 toolmonk-code-runner
```

Makefile shortcuts:
```bash
make build          # build main app image
make push           # build + push main app image
make deploy         # kubectl apply all main app manifests
make runner-build   # build ARM64 runner image
make runner-push    # build + push runner image
make runner-deploy  # kubectl apply all runner manifests
make runner-logs    # tail runner pod logs
```

---

## Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4 (CSS-first config, no `tailwind.config.ts`)
- **UI utilities**: `clsx`, `tailwind-merge` via `lib/utils/cn.ts`
- **Package manager**: Bun
- **Testing**: Vitest 4 + jsdom + React Testing Library + userEvent v14 (132 test files)
- **Deployment**: Self-hosted / Docker (`output: "standalone"`)
- **Code execution**: Custom isolate-based runner (`docker/runner/`) deployed on k8s

---

## Repository Structure

```
app/
  layout.tsx              # Root layout: AdProvider, AnalyticsProvider, Header, Footer
  page.tsx                # Landing page (WebSite + Organization JSON-LD)
  globals.css             # CSS variables + Tailwind @theme inline tokens
  opengraph-image.tsx     # Dynamic OG image (1200×630) for homepage
  api/
    health/route.ts       # Lightweight health check endpoint (used by k8s probes)
    execute/route.ts      # SSE code execution endpoint (rate limit → runner → stream)
  [category]/
    page.tsx              # Category listing (SSG)
    opengraph-image.tsx   # Dynamic OG image for category pages
    [segment]/page.tsx    # Subcategory listing OR flat tool page (SSG)
    [segment]/[tool]/page.tsx  # Nested tool page (SSG)
  compilers/
    code/page.tsx         # Universal multi-language compiler
    python|javascript|typescript|java|c|cpp|go|bash|ruby|php|sqlite/page.tsx
  blog/
    page.tsx              # Blog hub (22 articles)
    opengraph-image.tsx   # Dynamic OG image for blog
    [slug]/page.tsx       # Individual article page
  compare/[slug]/page.tsx # Tool comparison pages (7 comparisons)
  about/page.tsx          # About page
  privacy/page.tsx        # Privacy policy
  terms/page.tsx          # Terms of service
  all-tools/page.tsx      # Full tool directory
  sitemap.ts / robots.ts  # Generated from registry

components/
  layout/     # Header (client), Footer, Breadcrumbs
  ui/         # Button, Input, Textarea, Select, Card, Container, Section, Badge,
              # SearchBar, CopyButton, Toolbar, CodePanel,
              # ErrorBanner, ValidationStatus, ResultsTable, OutputTextarea, SavingsDisplay
  tool/       # ToolContainer, ToolCard, CategoryCard, SubcategoryCard, RelatedTools, HowToUse, FAQ
  tools/      # All 214 interactive tool components (fully implemented, not stubs)
              # includes components/tools/compilers/ (ExecutorTool, LanguageCompiler, UniversalCompiler)
  ads/        # AdProvider (client), AdSlot (client)
  analytics/  # AnalyticsProvider (client)

lib/
  tools/registry.ts       # All 214 tools + 12 categories + 14 subcategories + helpers
  tools/types.ts          # ToolMeta, CategoryMeta, SubcategoryMeta, FAQItem
  runners/languages.ts    # Language definitions for the code runner (runtime, version, fileExt, labels)
  runners/templates.ts    # Hello world starter code per language
  blog/articles.ts        # ARTICLES array (22 BlogArticle entries) + getArticle()
  comparisons/data.ts     # COMPARISONS array (7 entries) + getComparison()
  hooks/useCopyState.ts   # useCopyState(ms?) hook for copy-confirmed UI state
  seo/metadata.ts         # generateToolMetadata(), generateCategoryMetadata(), generateSubcategoryMetadata()
  seo/structured-data.ts  # buildWebsiteSchema(), buildBreadcrumbSchema(), buildFAQSchema(),
                          # buildSoftwareAppSchema(), buildOrganizationSchema(), buildHowToSchema()
  ads/config.ts           # adsConfig (reads NEXT_PUBLIC_ADSENSE_* env vars)
  analytics/config.ts     # analyticsConfig (reads NEXT_PUBLIC_GA_MEASUREMENT_ID)
  utils/cn.ts             # cn() = twMerge(clsx(...))
  utils/formStyles.ts     # Shared Tailwind class constants (see UI Patterns section)
  utils/rateLimiter.ts    # Sliding-window rate limiter (IP + clientId) for /api/execute
  utils/runnerClient.ts   # HTTP client for the code runner (RUNNER_URL env var)
  utils/color.ts          # Color manipulation helpers
  utils/diff.ts           # Text diff utilities
  utils/file.ts           # File handling helpers
  utils/hash.ts           # Hashing utilities
  utils/image.ts          # Image processing helpers
  utils/json.ts           # JSON utilities
  utils/pdfUtils.ts       # PDF helper functions
  utils/xml.ts            # XML utilities

docker/
  runner/
    Dockerfile            # Multi-stage ARM64 build: isolate from source + all language runtimes
    server.js             # Express server: isolate sandbox, box pool, Piston v2-compatible API
    package.json          # express only

k8s/
  namespace.yaml          # toolmonk namespace
  deployment.yaml         # Main app Deployment (2 replicas, topology spread)
  service.yaml            # ClusterIP :80 → :3000
  ingress.yaml            # nginx ingress + cert-manager TLS for toolmonk.net
  pdb.yaml                # PodDisruptionBudget minAvailable:1
  toolmonk-code-runner/
    namespace.yaml        # toolmonk-code-runner namespace
    deployment.yaml       # StatefulSet (2 replicas, topology spread, SYS_ADMIN for isolate)
    service.yaml          # ClusterIP :2000 + headless service
    networkpolicy.yaml    # DENY ALL EGRESS; ingress only from toolmonk namespace
    pdb.yaml              # PodDisruptionBudget minAvailable:1

__tests__/
  components/tools/       # 132 test files — one file per tool component
  api/                    # API route tests (execute.test.ts)
  helpers/
    render.tsx            # Custom render wrapper
    mocks.ts              # Shared mock helpers (expectCopied, mockFetch, typeValue, etc.)
```

---

## Architecture: Dynamic Routes

Three page files handle all statically-generated tool routes:

| File | Covers | `generateStaticParams` source |
|------|---------|-------------------------------|
| `[category]/page.tsx` | Category listings | `getCategoryStaticParams()` |
| `[category]/[segment]/page.tsx` | Subcategory listings **and** flat tools | `getSegmentStaticParams()` |
| `[category]/[segment]/[tool]/page.tsx` | All 3-level nested tools | `getToolStaticParams()` |

The `[category]/[segment]/page.tsx` component inspects the registry to decide whether `segment` is a subcategory slug (→ renders listing) or a tool slug (→ renders `ToolContainer`).

---

## Tool Registry (Single Source of Truth)

`lib/tools/registry.ts` is the master data file. **Never** maintain separate lists of tools or categories anywhere else. Category pages, sitemaps, search, related tools, and breadcrumbs all derive from it.

Key exports:
- `TOOLS` — 214 `ToolMeta` entries (all fully implemented)
- `CATEGORIES` — 12 `CategoryMeta` entries (includes `compilers`)
- `SUBCATEGORIES` — 14 `SubcategoryMeta` entries
- Helper functions: `getCategoryStaticParams()`, `getSegmentStaticParams()`, `getToolStaticParams()`, `getFeaturedTools()`, `getRelatedTools(slugs)`, `getAllPaths()`

When adding a new tool: add one entry to `TOOLS` (and `SUBCATEGORIES` if it's a new subcategory). All other pages update automatically.

---

## Adding a New Tool

1. Add a `ToolMeta` entry in `lib/tools/registry.ts` — set `slug`, `path`, `title`, `description`, `category`, `subcategory` (if nested), `keywords`, `relatedSlugs`, `icon`.
2. The dynamic route files auto-generate the page via `generateStaticParams`.
3. Create the interactive component in `components/tools/<category>/ComponentName.tsx`.
4. Import and render the component inside `<ToolContainer>` children in the relevant `page.tsx`.
5. For components with heavy dependencies (pdf-lib, pdfjs-dist, jsbarcode, qr-code-styling), use `next/dynamic({ ssr: false })` in the page file to defer the bundle to client-side only.
6. The `ToolContainer` handles breadcrumbs, SEO, ads slots, HowToUse, FAQ, RelatedTools, and HowTo JSON-LD automatically.

---

## Code Execution (Compilers Category)

12 compiler tools under `/compilers/` execute user code via the self-hosted code runner.

**Architecture:**
```
Browser (Monaco editor)
  │ POST /api/execute  (SSE stream)
  ▼
Next.js API route (app/api/execute/route.ts)
  │ Rate limit (10 req/min per IP + clientId) → runnerClient.ts
  ▼
toolmonk-code-runner pod (k8s namespace: toolmonk-code-runner)
  └─ isolate sandbox: namespaces + cgroup + seccomp + process limits
```

**SSE event flow:** `queued → executing → success | runtime_error | compile_error | timeout | oom_killed | rate_limited | server_busy`

**Supported languages:** Python 3, JavaScript (Node 20), TypeScript 5, Java 21, C (GCC 13), C++ (GCC 13), Go 1.22, Bash 5, Ruby 3, PHP 8, SQLite 3

**Key files:**
- `lib/runners/languages.ts` — language definitions (runtime id, version, Monaco id, file extension)
- `lib/runners/templates.ts` — hello world starter code per language
- `lib/utils/runnerClient.ts` — HTTP client (`RUNNER_URL` env var, falls back to `localhost:2000` for local dev)
- `lib/utils/rateLimiter.ts` — sliding-window rate limiter (in-memory, Map-based)
- `app/api/execute/route.ts` — SSE handler: validates → rate limits → calls runner → streams events
- `docker/runner/server.js` — isolate-based runner with box pool, adaptive cgroup detection, graceful shutdown
- `docker/runner/Dockerfile` — multi-stage ARM64 build (Ubuntu 24.04, all runtimes via apt)

**Runner API endpoints:**
- `GET /health` — `{ok, cgMode, poolSize, queued, uptime}` — used by k8s probes
- `GET /api/v2/runtimes` — language list
- `POST /api/v2/execute` — execute code, returns Piston v2-compatible JSON

---

## Theme System (Tailwind v4)

Tailwind v4 uses CSS-first config — **no `tailwind.config.ts`**.

`globals.css` defines raw CSS variables in `:root` (overridden in `@media (prefers-color-scheme: dark)`), then maps them to Tailwind color utilities via `@theme inline`.

| Tailwind class | Usage |
|---|---|
| `text-primary` / `bg-primary` | Brand accent (red) |
| `bg-secondary` / `text-secondary` | Secondary accent |
| `text-accent` / `bg-accent` | Tertiary accent |
| `bg-surface` | Page background |
| `bg-surface-muted` | Subtle panel/card background |
| `text-foreground` | Primary text |
| `text-foreground-muted` | Secondary/muted text |
| `border-border` | Default border color |

**Never hardcode hex values in components. Always use these semantic classes.**

---

## UI Patterns (Shared Class Constants)

`lib/utils/formStyles.ts` exports reusable Tailwind class strings for consistent interactive elements across all tools:

```ts
labelCls        // Form field label
inputBaseCls    // Base input/select styling
textareaCls     // Textarea styling
inputErrCls     // Error state border override
errCls          // Inline error message text

// Toggle/segmented buttons
toggleBtnBase   // Base for all toggle buttons
toggleActiveCls   // "border-primary/40 bg-primary/10 text-primary"
toggleInactiveCls // "border-border text-foreground-muted hover:text-foreground"

// Primary action CTA (Convert, Download, Export, Generate)
actionBtnBase        // Full-width, uppercase, mono
actionBtnEnabledCls  // Enabled state with hover
actionBtnDisabledCls // Disabled/cursor-not-allowed state

// Secondary/ghost button (Clear, Reset, Swap)
secondaryBtnCls
```

**Always use these constants** when building toggle buttons or action buttons. Do not inline equivalent class strings.

---

## Copy Button Pattern

Use `components/ui/CopyButton.tsx` for any copy-to-clipboard action. It handles the confirmed state (`border-primary/40 bg-primary/10 text-primary` + "copied!" label) automatically.

For custom copy state in tool components, use the `useCopyState` hook from `lib/hooks/useCopyState.ts`.

---

## SEO Pattern

Every tool/category page uses the shared metadata helpers — no inline metadata duplication.

```ts
// In any page.tsx:
export async function generateMetadata({ params }) {
  return generateToolMetadata(toolSlug); // from lib/seo/metadata.ts
}
```

JSON-LD schema is injected via `<script type="application/ld+json">` in:
- `app/page.tsx` → `WebSite` + `SearchAction` + `Organization`
- `Breadcrumbs` component → `BreadcrumbList`
- `FAQ` component → `FAQPage`
- `ToolContainer` → `SoftwareApplication` + `HowTo` (when `howToSteps` prop is passed)

Dynamic OG images (`opengraph-image.tsx`) exist at:
- `app/opengraph-image.tsx` — homepage
- `app/[category]/opengraph-image.tsx` — category pages
- `app/blog/opengraph-image.tsx` — blog hub

---

## Security Headers

`next.config.ts` adds these headers to all routes:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (HSTS)
- `Permissions-Policy` (camera, mic, geolocation, payment all blocked)
- `Content-Security-Policy` (allowlist for AdSense, GA, fonts)

---

## Performance: Heavy Component Lazy Loading

Components using large client-only libraries are wrapped with `next/dynamic({ ssr: false })` in their `page.tsx` files to defer the bundle to client-side only:

| Pages | Library |
|-------|---------|
| All 7 `pdf-tools/` pages | `pdf-lib`, `pdfjs-dist` |
| `image-tools/background-remover` | `@imgly/background-removal` |
| `generators/barcode-generator` | `jsbarcode` |
| `generators/qr-code-generator` | `qr-code-styling` |
| All 12 `compilers/` pages | `@monaco-editor/react` |

Loading fallback: `<div className="h-64 animate-pulse bg-surface-muted rounded-lg" />`

---

## Testing

**Test runner**: Vitest 4 + jsdom. **Must use `bun run test`** (not `bun test`).

- 132 test files — all passing
- Config: `vitest.config.ts`
- Setup: `vitest.setup.ts` (ResizeObserver mock, clipboard mock, matchMedia mock)
- Helpers: `__tests__/helpers/render.tsx`, `__tests__/helpers/mocks.ts`

### Key testing patterns

```ts
// Use delay:null to avoid 5s timeouts from real-delay typing
const user = userEvent.setup({ delay: null });

// For strings containing { or } (JSON), use fireEvent.change not userEvent.type
fireEvent.change(input, { target: { value: '{"key": "val"}' } });

// For clipboard assertions with userEvent (it owns navigator.clipboard)
const text = await navigator.clipboard.readText();
expect(text).toBe("expected");

// For animation timers (CoinFlip, DiceRoller)
vi.useFakeTimers({ shouldAdvanceTime: true });
const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });

// For date strings used in fireEvent.change — use LOCAL date components, not toISOString()
const d = new Date();
const str = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
```

---

## Ads & Analytics

Both are **disabled** when env vars are absent (no env vars = no ads, no analytics scripts).

- **Ads**: Set `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` + slot IDs in `.env.local`. `AdSlot` renders nothing when absent.
- **Analytics**: Set `NEXT_PUBLIC_GA_MEASUREMENT_ID`. `AnalyticsProvider` only activates in `NODE_ENV=production`.

### Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical URL, baked at build time |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Omit to disable analytics |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | No | Omit to disable ads |
| `NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER` | No | Individual slot IDs |
| `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR` | No | |
| `NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT` | No | |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | No | |
| `RUNNER_URL` | Yes (prod) | Set in `k8s/deployment.yaml`; defaults to `localhost:2000` for local dev |

> **Note**: All `NEXT_PUBLIC_*` vars are baked into the bundle at Docker build time. Pass them as `--build-arg` (see `Makefile`). `RUNNER_URL` is a server-side runtime var — never exposed to the browser.

---

## Blog & Comparisons

**Blog** (`/blog`): 22 articles in `lib/blog/articles.ts`. Each `BlogArticle` has `slug`, `title`, `description`, `category`, `publishedAt`, `readingTime`, `content` (HTML string), and optional `toolSlug` (links to a related tool's CTA). Add new articles by appending to the `ARTICLES` array.

**Comparisons** (`/compare/[slug]`): 7 comparison pages in `lib/comparisons/data.ts`. Each `ComparisonPage` has a vs-card layout, pros/cons, feature table, and verdict. Add new comparisons by appending to the `COMPARISONS` array.
