# ToolMonk

**180+ free online utility tools — no signup, no installs, runs in your browser.**

Calculators, converters, developer tools, PDF tools, image tools, generators, compilers, and more — all at [toolmonk.net](https://toolmonk.net).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Local Setup](#local-setup)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Environment Variables](#environment-variables)
  - [Run](#run)
- [With Code Runner (Docker)](#with-code-runner-docker)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Adding a New Tool](#adding-a-new-tool)
- [Contributing](#contributing)
- [License](#license)

---

## Tech Stack

| | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Package Manager | Bun |
| Testing | Vitest 4 + jsdom + React Testing Library |
| Code Editor | Monaco Editor |
| Sandbox | isolate (IOI/ICPC sandbox) |

---

## Local Setup

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- Node.js >= 20.0.0

### Install

```bash
git clone https://github.com/theprasadjadhav/toolmonk.git
cd toolmonk
bun install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
# Required
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional — omit to disable analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Optional — omit to disable ads
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=
NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER=
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=
NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT=
NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=

# Optional — code runner (see below)
RUNNER_URL=http://localhost:2000
```

### Run

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000). All tools work except the compiler tools, which require the code runner (see below).

---

## With Code Runner (Docker)

The compiler tools (`/compilers/*`) need the self-hosted code runner — an isolate-based sandbox that executes Python, JS, TypeScript, Java, C, C++, Go, Bash, Ruby, PHP, and SQLite.

> **Note:** The runner uses Linux kernel features (namespaces, cgroups, seccomp) and is built for ARM64. It requires Docker with `buildx` support.

**Build both images:**

```bash
make local-build
```

**Start the runner + app together:**

```bash
make local-up
```

This starts:
- App at [http://localhost:3000](http://localhost:3000)
- Runner at [http://localhost:2000/health](http://localhost:2000/health)

**Tail logs:**

```bash
make local-logs         # both containers
make local-logs-app     # app only
make local-logs-runner  # runner only
```

**Stop everything:**

```bash
make local-down
```

---

## Running Tests

```bash
# Run all tests
bun run test

# Watch mode
bun run test:watch

# Single file
bun run test -- "JsonFormatter"

# Runner integration tests (requires runner running at localhost:2000)
make test-runner
make test-runner-security
```

> Use `bun run test`, not `bun test`. The latter skips the jsdom environment configured in `vitest.config.ts`.

There are 132 test files — one per tool component. All must pass before submitting a PR.

---

## Project Structure

```
app/                         # Next.js App Router pages
  [category]/                # Category listing (SSG)
  [category]/[segment]/      # Subcategory or flat tool page
  [category]/[segment]/[tool]/  # Nested tool page
  api/execute/               # SSE code execution endpoint
  compilers/                 # 12 compiler pages
  blog/                      # 22 blog articles

components/
  layout/                    # Header, Footer, Breadcrumbs
  ui/                        # Shared UI primitives
  tool/                      # ToolContainer, FAQ, RelatedTools
  tools/                     # All 180+ interactive tool components

lib/
  tools/registry.ts          # Single source of truth — all tools & categories
  seo/metadata.ts            # generateToolMetadata()
  utils/formStyles.ts        # Shared Tailwind class constants
  utils/rateLimiter.ts       # Sliding-window rate limiter
  utils/runnerClient.ts      # HTTP client for the code runner

docker/runner/               # isolate-based code execution service
k8s/                         # Kubernetes manifests
__tests__/                   # 132 test files
```

---

## Adding a New Tool

1. **Add an entry** in `lib/tools/registry.ts`:

```ts
{
  slug: "my-tool",
  path: "/dev-tools/my-tool",
  title: "My Tool",
  description: "One-line description used in SEO and search.",
  category: "dev-tools",
  keywords: ["keyword one", "keyword two"],
  relatedSlugs: ["json-formatter"],
  icon: "🔧",
}
```

2. **Create the component** at `components/tools/dev-tools/MyTool.tsx`.

3. **Render it** inside `<ToolContainer>` in the relevant `page.tsx`. No new page file needed — `generateStaticParams` picks it up automatically from the registry.

4. **Write a test** at `__tests__/components/tools/dev-tools/MyTool.test.tsx`.

> Adding one registry entry automatically updates category pages, the sitemap, search, related tools, breadcrumbs, and OG images.

---

## Contributing

### Workflow

1. Fork and create a branch from `main`:
   ```bash
   git checkout -b feat/my-new-tool
   ```

2. Make your changes following the [Adding a New Tool](#adding-a-new-tool) guide.

3. Make sure everything passes:
   ```bash
   bun run test
   bunx tsc --noEmit
   bun run lint
   ```

4. Open a PR against `main` with a short description and a screenshot for UI changes.

### Guidelines

- **One tool per PR**
- **No hardcoded colours** — use semantic tokens (`text-primary`, `bg-surface`, `border-border`)
- **Use `formStyles.ts` constants** for action buttons and inputs
- **Client-side first** — process data in the browser where possible
- **Tests required** for every new tool component
- **Registry is the source of truth** — never maintain separate tool lists elsewhere

---

## License

MIT — see [LICENSE](LICENSE) for details.
