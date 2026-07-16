# ToolMonk

**180+ free online utility tools — no signup, no installs, runs in your browser.**

Calculators, converters, developer tools, PDF tools, image tools, generators, compilers, and more — all under one domain at [toolmonk.net](https://toolmonk.net).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Code Runner Setup](#code-runner-setup)
- [Running Tests](#running-tests)
- [Docker](#docker)
- [Project Structure](#project-structure)
- [Adding a New Tool](#adding-a-new-tool)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **180+ tools** across 13 categories — all fully implemented, not stubs
- **Client-side first** — most tools run entirely in the browser; no data sent to servers
- **Code execution** — run Python, JavaScript, TypeScript, Java, C, C++, Go, Bash, Ruby, PHP, and SQLite in a sandboxed environment
- **PDF tools** — merge, split, compress, rotate, watermark, convert — all via pdf-lib in the browser
- **File converter** — DOC/DOCX/ODT/PPT/XLS to PDF and more via LibreOffice
- **No signup required** — open any tool and use it instantly
- **SEO-ready** — static generation for every page, JSON-LD structured data, dynamic OG images

---

## Tech Stack

| | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (CSS-first, no config file) |
| Package Manager | Bun |
| Testing | Vitest 4 + jsdom + React Testing Library |
| Code Editor | Monaco Editor (lazy-loaded) |
| Sandbox | isolate (IOI/ICPC competitive programming sandbox) |
| Deployment | Docker + Kubernetes (self-hosted) |

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **Bun** >= 1.0 — [install](https://bun.sh)
- **Git**

### Installation

```bash
git clone https://github.com/your-username/toolmonk.git
cd toolmonk
bun install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Required — canonical URL baked into the build
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional — omit to disable Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Optional — omit to disable AdSense ads
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=
NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER=
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=
NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT=
NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=

# Optional — code runner URL (defaults to localhost:2000 for local dev)
# Only needed if you set up the code runner locally
RUNNER_URL=http://localhost:2000
```

> All `NEXT_PUBLIC_*` variables are baked into the bundle at build time. The code compiler tools will show a "runner unavailable" state if `RUNNER_URL` is not reachable — all other tools work without it.

### Running Locally

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
# Production build
bun run build
bun start

# Type check
bunx tsc --noEmit

# Lint
bun run lint
```

---

## Code Runner Setup

The compiler tools (`/compilers/*`) require the self-hosted code runner — a sandboxed execution service built on [isolate](https://github.com/ioi/isolate).

> **Note:** The code runner uses Linux kernel features (namespaces, cgroups, seccomp) and must be built for ARM64. It requires a Linux environment. All other tools work without it.

### Running with Docker (ARM64 Linux only)

```bash
# Build the runner image
docker buildx build --platform linux/arm64 \
  -t toolmonk-code-runner \
  docker/runner/

# Run the runner
docker run -p 2000:2000 \
  --privileged \
  toolmonk-code-runner
```

Then set `RUNNER_URL=http://localhost:2000` in your `.env.local` and restart the dev server.

### Makefile Shortcuts

```bash
make runner-build    # build ARM64 runner image
make runner-push     # build + push to registry
make runner-deploy   # kubectl apply runner manifests
make runner-logs     # tail runner pod logs
```

---

## Running Tests

```bash
# Run all tests (must use bun run test, NOT bun test)
bun run test

# Watch mode
bun run test:watch

# Coverage report
bun run test:coverage

# Run a single test file
bun run test -- "JsonFormatter"
```

> **Important:** Use `bun run test`, not `bun test`. The latter uses Bun's native test runner which does not load the jsdom environment configured in `vitest.config.ts`.

There are 132 test files — one per tool component. All tests should pass before submitting a PR.

---

## Docker

### Main App

```bash
# Build
docker build -t toolmonk .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  toolmonk
```

### Kubernetes Deployment

```bash
make build      # build main app image
make push       # build + push to registry
make deploy     # kubectl apply all main app manifests
```

Kubernetes manifests are in `k8s/`. The setup includes:
- 2-replica Deployment with topology spread (one pod per node)
- nginx Ingress with cert-manager TLS (Let's Encrypt)
- PodDisruptionBudget (`minAvailable: 1`)
- Separate namespace + NetworkPolicy for the code runner (`DENY ALL EGRESS`)

---

## Project Structure

```
app/                    # Next.js App Router pages
  [category]/           # Category listing pages (SSG)
  [category]/[segment]/ # Subcategory or flat tool page
  [category]/[segment]/[tool]/  # Nested tool pages
  api/execute/          # SSE code execution endpoint
  compilers/            # 12 compiler pages
  blog/                 # 22 blog articles
  opengraph-image.tsx   # Dynamic OG image (1200×630)

components/
  layout/               # Header, Footer, Breadcrumbs
  ui/                   # Shared UI primitives (Button, Input, CopyButton, …)
  tool/                 # ToolContainer, ToolCard, FAQ, RelatedTools
  tools/                # All 180+ interactive tool components

lib/
  tools/registry.ts     # Single source of truth — all tools & categories
  tools/types.ts        # TypeScript types (ToolMeta, CategoryMeta, …)
  seo/metadata.ts       # generateToolMetadata(), generateCategoryMetadata()
  utils/formStyles.ts   # Shared Tailwind class constants
  utils/rateLimiter.ts  # Sliding-window rate limiter
  utils/runnerClient.ts # HTTP client for the code runner

docker/runner/          # isolate-based code execution service
k8s/                    # Kubernetes manifests
__tests__/              # 132 test files
```

---

## Adding a New Tool

1. **Add a registry entry** in `lib/tools/registry.ts`:

```ts
{
  slug: "my-tool",
  path: "/category/subcategory/my-tool",
  title: "My Tool",
  description: "What it does — used in SEO metadata and search.",
  category: "dev-tools",
  subcategory: "subcategory-slug",   // omit for flat tools
  keywords: ["keyword one", "keyword two"],
  relatedSlugs: ["json-formatter", "base64-converter"],
  icon: "🔧",
}
```

2. **Create the component** at `components/tools/dev-tools/MyTool.tsx`.

3. **Import and render it** inside `<ToolContainer>` in the relevant `page.tsx`. The dynamic route files auto-generate the page via `generateStaticParams` — no new page file needed.

4. **For heavy dependencies** (pdf-lib, Monaco, etc.), use `next/dynamic({ ssr: false })` in the page file to keep the initial bundle lean.

5. **Write a test** at `__tests__/components/tools/dev-tools/MyTool.test.tsx`.

> The registry is the single source of truth. Adding one entry automatically updates category pages, the sitemap, search, related tools, breadcrumbs, and OG images.

---

## Contributing

Contributions are welcome — bug fixes, new tools, UI improvements, and documentation.

### Workflow

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feat/my-new-tool
   ```

2. **Make your changes.** For a new tool, follow the [Adding a New Tool](#adding-a-new-tool) guide above.

3. **Run the test suite** and make sure everything passes:
   ```bash
   bun run test
   bunx tsc --noEmit
   bun run lint
   ```

4. **Commit** with a clear message describing what and why:
   ```bash
   git commit -m "Add Roman numeral converter tool"
   ```

5. **Open a Pull Request** against `main`. Include a short description of what the tool does and a screenshot if it's a UI change.

### Guidelines

- **One tool per PR** — keeps reviews focused and easy to merge.
- **Follow existing patterns** — use `formStyles.ts` constants for buttons/inputs, `CopyButton` for copy actions, `useCopyState` for custom copy states.
- **No hardcoded colours** — use semantic Tailwind tokens (`text-primary`, `bg-surface`, `border-border`, etc.) defined in `globals.css`.
- **Client-side first** — tools should process data in the browser where possible. Avoid adding server-side API routes unless truly necessary.
- **Tests required** — every new tool component needs a test file. Use `bun run test -- "ToolName"` to run just your test while developing.
- **Keep the registry as the source of truth** — do not maintain separate lists of tools anywhere else.

### Code Style

- TypeScript strict mode — no `any` unless unavoidable
- Functional React components only
- No default exports for components (named exports preferred)
- Tailwind for all styling — no inline styles except in OG image files

---

## License

MIT — see [LICENSE](LICENSE) for details.
