# ── Stage 1: Dependencies ──────────────────────────────────────────────────────
FROM oven/bun:1.3.11 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Stage 2: Build ─────────────────────────────────────────────────────────────
FROM oven/bun:1.3.11 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* vars are inlined at build time by the Next.js compiler.
ARG NEXT_PUBLIC_SITE_URL=https://toolmonk.net
ARG NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=""
ARG NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER=""
ARG NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=""
ARG NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT=""
ARG NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=""
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=""
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=$NEXT_PUBLIC_ADSENSE_PUBLISHER_ID \
    NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER=$NEXT_PUBLIC_ADSENSE_SLOT_TOP_BANNER \
    NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=$NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR \
    NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT=$NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT \
    NEXT_PUBLIC_ADSENSE_SLOT_FOOTER=$NEXT_PUBLIC_ADSENSE_SLOT_FOOTER \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
RUN bun run build

# ── Stage 3: Production runtime ────────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

# Document conversion stack.
# default-jre-headless     — satisfies libjvmfwk3 JVM scan (absent JRE → exit(1))
# libgl1                   — OpenGL backend loaded by LO even in headless mode
# fonts-liberation         — metric-compatible Arial/Times/Courier (critical for .docx)
# fonts-dejavu-core        — broad Unicode glyph coverage
# fonts-crosextra-carlito  — metric-compatible Calibri replacement
# fonts-crosextra-caladea  — metric-compatible Cambria replacement
RUN apt-get update && apt-get install -y --no-install-recommends \
      libreoffice-writer libreoffice-impress libreoffice-calc \
      default-jre-headless \
      poppler-utils qpdf \
      libgl1 \
      fonts-liberation \
      fonts-dejavu-core \
      fonts-crosextra-carlito \
      fonts-crosextra-caladea \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs -m nextjs

# LibreOffice profile template (Java disabled via registrymodifications.xcu).
# Cloned per-request by the API route to give each conversion an isolated profile
# and prevent lock-file conflicts under concurrent load.
COPY --chown=nextjs:nodejs docker/lo-profile /opt/lo-profile

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0" HOME=/home/nextjs DCONF_PROFILE=/dev/null
CMD ["node", "server.js"]
