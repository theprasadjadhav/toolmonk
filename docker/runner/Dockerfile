# ── Stage 1: Build isolate from source ───────────────────────────────────────
# isolate 2.x must be compiled from source — the Ubuntu 24.04 apt package is
# version 1.x without cgroup v2 support. Build with libseccomp for syscall
# filtering (the most important security layer after namespaces).
FROM ubuntu:24.04 AS builder

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libcap-dev \
    libseccomp-dev \
    libsystemd-dev \
    pkg-config \
    git \
    ca-certificates \
    file \
    && rm -rf /var/lib/apt/lists/*

# Pin to a specific commit for reproducibility.
# Check https://github.com/ioi/isolate for the latest stable commit.
RUN git clone --depth=1 https://github.com/ioi/isolate /build/isolate

WORKDIR /build/isolate

# Verify seccomp is detected by the build system before compiling.
# If this grep fails, the resulting binary will have NO syscall filtering.
RUN pkg-config --libs libseccomp && echo "seccomp: OK"

RUN make isolate

# Confirm the binary is ARM64 native
RUN file isolate | grep -q aarch64 && echo "arch: aarch64 OK"

# Install binary + config file (make install writes isolate.cf → /usr/local/etc/isolate)
RUN make install

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM ubuntu:24.04

ARG DEBIAN_FRONTEND=noninteractive

# ── isolate runtime dependencies ─────────────────────────────────────────────
# uidmap provides newuidmap/newgidmap (setuid helpers that isolate uses to set
# up UID/GID mappings inside user namespaces). Without these, isolate --init
# fails with "User isolate not found in /etc/subuid".
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcap2 \
    libseccomp2 \
    libsystemd0 \
    uidmap \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled isolate binary (setuid root — required for namespace creation).
COPY --from=builder /usr/local/bin/isolate /usr/local/bin/isolate
RUN chmod 4755 /usr/local/bin/isolate

# Copy isolate config file (required at startup — make install writes it from isolate.cf)
RUN mkdir -p /usr/local/etc
COPY --from=builder /usr/local/etc/isolate /usr/local/etc/isolate

# Create the 'isolate' system user required by isolate 2.x user namespace setup.
# When isolate --init creates a user namespace for a sandbox box, it calls
# newuidmap to map host UIDs into that namespace. newuidmap reads /etc/subuid
# to determine which host UID range the 'isolate' user is allowed to delegate.
# 65536 UIDs starting at 100000 is the conventional range — well above system
# UIDs (0-999) and login UIDs (1000+), providing 65536 mappable sandbox users.
RUN useradd -r -M -s /sbin/nologin isolate \
    && echo "isolate:100000:65536" >> /etc/subuid \
    && echo "isolate:100000:65536" >> /etc/subgid

# ── Language runtimes (ARM64 native from apt) ─────────────────────────────────
# All packages are from Ubuntu 24.04 main/universe — fully ARM64 supported.
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Python 3.12
    python3 \
    # Node.js 20 (Ubuntu 24.04 ships 20.x in main)
    nodejs \
    npm \
    # Java 21 (default-jdk-headless on 24.04 = openjdk-21)
    default-jdk-headless \
    # C / C++ (GCC 13 on 24.04)
    gcc \
    g++ \
    # Go 1.22
    golang-go \
    # Ruby 3.2
    ruby \
    # PHP 8.3
    php-cli \
    # SQLite 3.45
    sqlite3 \
    # Bash (already present, explicit for clarity)
    bash \
    # curl for health checks
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── TypeScript ────────────────────────────────────────────────────────────────
# Pin exact versions — floating 'latest' breaks reproducible builds.
RUN npm install -g typescript@5.4.5 ts-node@10.9.2

# ── isolate state directory ───────────────────────────────────────────────────
# isolate stores box state here. Must exist before any --init call.
RUN mkdir -p /var/local/lib/isolate && chmod 700 /var/local/lib/isolate

# ── Go cache directories (persistent across requests within pod lifetime) ─────
# CGO_ENABLED=0 builds are cached here — speeds up repeated Go compilations.
RUN mkdir -p /var/cache/gopath /var/cache/gocache \
    && chmod 1777 /var/cache/gopath /var/cache/gocache

# ── Node.js runner ────────────────────────────────────────────────────────────
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./

# Run as root — isolate requires root (or SYS_ADMIN + setuid) to create
# namespaces and manipulate cgroups. User code runs as an unprivileged user
# INSIDE the isolate sandbox. Root inside a non-privileged container != root
# on host.
USER root

EXPOSE 2000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -sf http://localhost:2000/health || exit 1

CMD ["node", "server.js"]
