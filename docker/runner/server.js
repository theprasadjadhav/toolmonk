'use strict';

/**
 * ToolMonk Isolate Runner
 *
 * Production-grade code execution using isolate (IOI sandbox).
 * Implements the Piston v2 API format (compatible with runnerClient.ts).
 *
 * Security layers (outermost → innermost):
 *  1. NetworkPolicy DENY ALL EGRESS  — pod cannot reach internet
 *  2. Rate limiting in Next.js route  — 10 req/min per IP, 10 global inflight
 *  3. isolate namespaces              — user, pid, net, ipc, mount
 *  4. isolate process limit           — fork bomb protection
 *  5. isolate time limits             — CPU + wall-clock hard kill
 *  6. isolate memory limit            — RLIMIT_AS (+ cgroup when available)
 *  7. isolate fsize limit             — max output file size
 *  8. isolate seccomp BPF             — syscall whitelist (compiled with libseccomp)
 *  9. Read-only rootfs inside box     — /usr, /bin, /lib mounted read-only
 *
 * API (Piston v2 compatible format):
 *  GET  /api/v2/runtimes   → health check + language list
 *  POST /api/v2/execute    → compile + run, return JSON result
 */

const express  = require('express');
const { spawn } = require('child_process');
const fs       = require('fs');
const fsp      = require('fs/promises');
const path     = require('path');
const os       = require('os');

const app = express();
app.use(express.json({ limit: '2mb' }));

// ── Constants ──────────────────────────────────────────────────────────────────

const ISOLATE_BIN  = '/usr/local/bin/isolate';
const BOX_ROOT     = '/var/local/lib/isolate';
const POOL_SIZE    = 12;   // boxes per pod; 2 runner pods = 24 total capacity
const MAX_QUEUE    = 24;   // worst-case: kube-proxy routes all 2×12 inflight to one pod
                           // → 12 in boxes + 12 queued; above this → server_busy
const MAX_OUTPUT   = 65_536;   // 64 KB — output truncation cap (matches fsize)
const FSIZE_KB     = 64;       // isolate --fsize (KB)

// Per-execution compile timeout (ms) — compilers run outside the sandbox
const COMPILE_TIMEOUT_MS = 20_000;

// ── Async exec helper ──────────────────────────────────────────────────────────

/**
 * Promisified child process wrapper. Non-blocking — never use spawnSync
 * in an Express handler (it blocks the entire event loop).
 */
function exec(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      stdio:  ['pipe', 'pipe', 'pipe'],
      cwd:    opts.cwd,
      env:    opts.env,
    });

    const stdoutBufs = [];
    const stderrBufs = [];
    let stdoutLen    = 0;
    let stderrLen    = 0;
    const maxBuf     = opts.maxBuffer ?? (4 * 1024 * 1024);

    proc.stdout.on('data', d => {
      if (stdoutLen < maxBuf) { stdoutBufs.push(d); stdoutLen += d.length; }
    });
    proc.stderr.on('data', d => {
      if (stderrLen < maxBuf) { stderrBufs.push(d); stderrLen += d.length; }
    });

    const timer = opts.timeout
      ? setTimeout(() => proc.kill('SIGKILL'), opts.timeout)
      : null;

    if (opts.input != null) {
      proc.stdin.end(opts.input, 'utf8');
    } else {
      proc.stdin.end();
    }

    proc.on('close', (code, signal) => {
      if (timer) clearTimeout(timer);
      resolve({
        code,
        signal,
        stdout: Buffer.concat(stdoutBufs).toString('utf8'),
        stderr: Buffer.concat(stderrBufs).toString('utf8'),
      });
    });

    proc.on('error', reject);
  });
}

// ── isolate wrapper ────────────────────────────────────────────────────────────

let USE_CG = false; // set by detectCgroupSupport() at startup

function boxDir(id) {
  return path.join(BOX_ROOT, String(id), 'box');
}

function metaPath(id) {
  return `/tmp/isolate-meta-${id}.txt`;
}

/** Initialize a sandbox box. Must be called before isolateRun(). */
async function isolateInit(id) {
  const flags = USE_CG ? ['--cg'] : [];
  const r = await exec(ISOLATE_BIN, [...flags, `--box-id=${id}`, '--init']);
  if (r.code !== 0) {
    throw new Error(`isolate --init failed for box ${id}: ${r.stderr.trim()}`);
  }
}

/** Clean up a box. Safe to call even if init never succeeded (ignores errors). */
async function isolateCleanup(id) {
  const flags = USE_CG ? ['--cg'] : [];
  await exec(ISOLATE_BIN, [...flags, `--box-id=${id}`, '--cleanup']).catch(() => {});
  // Remove meta file left from this execution
  await fsp.unlink(metaPath(id)).catch(() => {});
}

/**
 * Parse the isolate meta file into a key/value object.
 * Example meta file:
 *   time:0.042
 *   time-wall:0.051
 *   max-rss:3456
 *   exitcode:0
 *   status:OK
 */
function parseMeta(text) {
  const meta = {};
  for (const line of text.trim().split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return meta;
}

/**
 * Run a command inside an initialized isolate box.
 * Writes stdin to box/.stdin, reads stdout/stderr from box/stdout.txt and
 * box/stderr.txt after execution (more reliable than streaming pipes through
 * Node.js for large or binary output).
 */
async function isolateRun(id, config) {
  const {
    cmd,
    args         = [],
    stdin        = '',
    timeSec,
    wallTimeSec,
    memKB,
    rlimitMemKB, // optional: VSZ limit for RLIMIT_AS mode (higher than memKB)
    processes,
    extraEnv     = {},
  } = config;

  const dir = boxDir(id);

  // Write stdin to file inside box — isolate reads it as .stdin
  await fsp.writeFile(path.join(dir, '.stdin'), stdin, 'utf8');

  // In RLIMIT_AS mode, --mem limits virtual address space (VSZ), not physical RAM.
  // Heavy runtimes (V8, JVM) reserve far more VSZ than they use physically.
  // Use rlimitMemKB when provided, otherwise fall back to memKB.
  const effectiveMemKB = (!USE_CG && config.rlimitMemKB) ? config.rlimitMemKB : memKB;
  const memFlag = USE_CG
    ? [`--cg-mem=${effectiveMemKB}`]
    : [`--mem=${effectiveMemKB}`];

  const envFlags = [
    '--env=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    '--env=HOME=/box',
    '--env=TMPDIR=/box',
    ...Object.entries(extraEnv).map(([k, v]) => `--env=${k}=${v}`),
  ];

  const cgFlags = USE_CG ? ['--cg'] : [];

  const isolateArgs = [
    `--box-id=${id}`,
    ...cgFlags,
    ...memFlag,
    `--time=${timeSec}`,
    `--wall-time=${wallTimeSec}`,
    `--processes=${processes}`,
    `--fsize=${FSIZE_KB}`,
    '--stack=65536',           // 64 MB stack limit
    '--stdin=.stdin',          // relative to /box inside sandbox
    '--stdout=stdout.txt',
    '--stderr=stderr.txt',
    `--meta=${metaPath(id)}`,  // host path — isolate writes here before teardown
    ...envFlags,
    '--run', '--',
    cmd, ...args,
  ];

  // Outer timeout: wall-time + 8s to let isolate handle the kill gracefully
  const outerTimeoutMs = (wallTimeSec + 8) * 1000;

  const result = await exec(ISOLATE_BIN, isolateArgs, {
    timeout: outerTimeoutMs,
  });

  // Read output files from box dir (host path) — they exist until cleanup
  let stdout = '';
  let stderr = '';
  try { stdout = await fsp.readFile(path.join(dir, 'stdout.txt'), 'utf8'); } catch {}
  try { stderr = await fsp.readFile(path.join(dir, 'stderr.txt'), 'utf8'); } catch {}

  // Truncate to protect downstream consumers
  stdout = truncate(stdout);
  stderr = truncate(stderr);

  // Parse meta file for authoritative status
  let meta = {};
  try {
    const metaText = await fsp.readFile(metaPath(id), 'utf8');
    meta = parseMeta(metaText);
  } catch {}

  return { stdout, stderr, meta, isolateExitCode: result.code };
}

const TRUNCATE_MARKER = '\n...[output truncated at 64 KB]';

function truncate(s) {
  // Use strict < so that output at exactly 64 KB (fsize limit hit) also gets
  // the truncation marker appended. With <=, a file stopped at exactly
  // MAX_OUTPUT bytes would pass silently without the marker.
  // Subtract marker length so total output never exceeds MAX_OUTPUT.
  if (s.length < MAX_OUTPUT) return s;
  return s.slice(0, MAX_OUTPUT - TRUNCATE_MARKER.length) + TRUNCATE_MARKER;
}

/**
 * Translate isolate meta into run result shape.
 *
 * isolate 2.x meta field reference (empirically verified on Ubuntu 24.04):
 *
 *  Clean exit (code 0)  → exitcode:0           — NO status field written
 *  Non-zero exit        → exitcode:N + status:RE + message:...
 *  Time limit exceeded  → status:TO + killed:1  — NO exitcode field
 *  Killed by signal     → status:SG + exitsig:N — NO exitcode field
 *  Internal error       → no exitcode, no status (status defaults to 'XX')
 *
 * The key gotcha: isolate does NOT write status:OK for a clean exit.
 * Treating a missing status as an error (old behaviour) caused every
 * successful run to be reported as SIGKILL.
 */
function buildRunResult(stdout, stderr, meta) {
  const status   = meta['status'] ?? null;   // null = clean exit (no status field)
  const exitCode = meta['exitcode'] != null ? parseInt(meta['exitcode'], 10) : null;
  const exitsig  = meta['exitsig'];

  // ── Clean exit (code 0): no status field, exitcode present ──────────────────
  if (status === null) {
    if (exitCode !== null) {
      return { stdout, stderr, code: exitCode, signal: null, output: truncate(stdout + stderr) };
    }
    // No status AND no exitcode → internal isolate error
    return { stdout, stderr, code: null, signal: 'SIGKILL', output: truncate(stdout + stderr) };
  }

  // ── status:RE — non-zero exit ────────────────────────────────────────────────
  if (status === 'OK' || status === 'RE') {
    return {
      stdout, stderr,
      code:   Number.isFinite(exitCode) ? exitCode : 1,
      signal: null,
      output: truncate(stdout + stderr),
    };
  }

  // ── status:TO — time limit exceeded ─────────────────────────────────────────
  if (status === 'TO') {
    return { stdout, stderr, code: null, signal: 'SIGKILL', output: truncate(stdout + stderr) };
  }

  // ── status:SG — killed by signal (OOM, SIGSEGV, SIGABRT …) ─────────────────
  if (status === 'SG') {
    return {
      stdout, stderr,
      code:   null,
      signal: exitsig ? `SIG${exitsig}` : 'SIGKILL',
      output: truncate(stdout + stderr),
    };
  }

  // ── Unknown / internal isolate error ────────────────────────────────────────
  return { stdout, stderr, code: null, signal: 'SIGKILL', output: truncate(stdout + stderr) };
}

// ── Box pool ───────────────────────────────────────────────────────────────────

/**
 * Async semaphore-style pool. LIFO free-list for warm-cache reuse.
 * Bounded queue — requests rejected beyond MAX_QUEUE to prevent memory leak.
 */
class BoxPool {
  constructor(size) {
    this.free    = Array.from({ length: size }, (_, i) => i);
    this.waiting = [];
  }

  acquire() {
    if (this.free.length > 0) {
      return Promise.resolve(this.free.pop()); // LIFO
    }
    if (this.waiting.length >= MAX_QUEUE) {
      return Promise.reject(new Error('server_busy'));
    }
    return new Promise(resolve => this.waiting.push(resolve));
  }

  release(id) {
    if (this.waiting.length > 0) {
      this.waiting.shift()(id);
    } else {
      this.free.push(id);
    }
  }

  /** Remove a box from the pool permanently (broken box after failed re-init). */
  discard(id) {
    console.error(`[pool] Box ${id} discarded after re-init failure. Pool size: ${this.free.length + this.waiting.length}`);
    // Do not call release() — the box is gone.
  }
}

const pool = new BoxPool(POOL_SIZE);

// ── TypeScript ambient shims ───────────────────────────────────────────────────
//
// Written to the box dir before `tsc --noEmit` so that Node.js built-in imports
// like `import * as readline from "readline"` resolve without @types/node.
// --skipLibCheck prevents tsc from type-checking this shims file itself.

const TS_NODE_SHIMS = `
// ── Node.js globals (not in ES lib) ──────────────────────────────────────────
declare var require: (id: string) => any;
declare var module:  { exports: any };
declare var exports: any;
declare var __dirname:  string;
declare var __filename: string;

declare namespace process {
  var stdin:    any;
  var stdout:   any;
  var stderr:   any;
  var env:      Record<string, string | undefined>;
  var argv:     string[];
  var version:  string;
  var platform: string;
  function exit(code?: number): never;
  function on(event: string, listener: (...args: any[]) => void): any;
  function hrtime(time?: [number, number]): [number, number];
}

declare class Buffer {
  static from(data: any, encoding?: string): Buffer;
  static alloc(size: number, fill?: any): Buffer;
  static isBuffer(obj: any): obj is Buffer;
  static concat(list: Buffer[], totalLength?: number): Buffer;
  toString(encoding?: string): string;
  length: number;
  [index: number]: number;
}

// ── Node.js built-in module declarations ─────────────────────────────────────
declare module "readline" {
  interface Interface {
    on(event: "line",  listener: (input: string) => void): this;
    on(event: "close", listener: () => void): this;
    on(event: string,  listener: (...args: any[]) => void): this;
    close(): void;
    question(query: string, callback: (answer: string) => void): void;
  }
  function createInterface(options: { input?: any; output?: any; terminal?: boolean }): Interface;
  function createInterface(input: any, output?: any): Interface;
}
declare module "fs" {
  function readFileSync(path: string, encoding: string): string;
  function readFileSync(path: string): Buffer;
  function writeFileSync(path: string, data: string | Buffer, options?: any): void;
  function existsSync(path: string): boolean;
  function readdirSync(path: string): string[];
  const promises: { readFile(path: string, options?: any): Promise<any>; writeFile(path: string, data: any): Promise<void>; };
}
declare module "path" {
  function join(...paths: string[]): string;
  function resolve(...paths: string[]): string;
  function dirname(p: string): string;
  function basename(p: string, ext?: string): string;
  function extname(p: string): string;
  const sep: string;
}
declare module "os" {
  function hostname(): string;
  function platform(): string;
  function arch(): string;
  function tmpdir(): string;
  function homedir(): string;
  const EOL: string;
}
declare module "crypto" {
  function createHash(alg: string): { update(d: string | Buffer): any; digest(enc: string): string; };
  function randomBytes(size: number): Buffer;
  function randomUUID(): string;
}
declare module "events" {
  class EventEmitter {
    on(event: string, listener: (...args: any[]) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    removeAllListeners(event?: string): this;
  }
  export = EventEmitter;
}
declare module "util" {
  function format(fmt?: any, ...params: any[]): string;
  function inspect(obj: any, opts?: any): string;
  function promisify(fn: Function): (...args: any[]) => Promise<any>;
}
declare module "assert" {
  function assert(value: any, msg?: string | Error): asserts value;
  namespace assert {
    function ok(v: any, msg?: string): void;
    function strictEqual(a: any, b: any, msg?: string): void;
    function deepStrictEqual(a: any, b: any, msg?: string): void;
    function throws(fn: () => any, msg?: string): void;
    function fail(msg?: string): never;
  }
  export = assert;
}
declare module "url" {
  function parse(u: string, parseQS?: boolean): any;
  function format(obj: any): string;
  class URL { constructor(input: string, base?: string); href: string; hostname: string; pathname: string; search: string; toString(): string; }
}
declare module "http"          { const _: any; export = _; }
declare module "https"         { const _: any; export = _; }
declare module "net"           { const _: any; export = _; }
declare module "child_process" {
  function exec(cmd: string, cb?: (err: Error | null, stdout: string, stderr: string) => void): any;
  function execSync(cmd: string, opts?: any): Buffer | string;
  function spawn(cmd: string, args?: string[], opts?: any): any;
}
declare module "stream"         { const _: any; export = _; }
declare module "zlib"           { const _: any; export = _; }
declare module "buffer"         { export { Buffer }; }
declare module "querystring"    { const _: any; export = _; }
declare module "timers"         { const _: any; export = _; }
declare module "perf_hooks"     { const _: any; export = _; }
declare module "vm"             { const _: any; export = _; }
declare module "worker_threads" { const _: any; export = _; }
declare module "node:readline"       { export * from "readline"; }
declare module "node:fs"             { export * from "fs"; }
declare module "node:path"           { export * from "path"; }
declare module "node:os"             { export * from "os"; }
declare module "node:crypto"         { export * from "crypto"; }
declare module "node:events"         { export * from "events"; }
declare module "node:util"           { export * from "util"; }
declare module "node:assert"         { export * from "assert"; }
declare module "node:url"            { export * from "url"; }
declare module "node:http"           { export * from "http"; }
declare module "node:https"          { export * from "https"; }
declare module "node:net"            { export * from "net"; }
declare module "node:child_process"  { export * from "child_process"; }
declare module "node:stream"         { export * from "stream"; }
declare module "node:zlib"           { export * from "zlib"; }
declare module "node:timers"         { export * from "timers"; }
declare module "node:worker_threads" { export * from "worker_threads"; }
declare namespace NodeJS { type Platform = string; }
type BufferEncoding = "ascii" | "utf8" | "utf-8" | "utf16le" | "base64" | "latin1" | "binary" | "hex";
`;

// ── Language definitions ───────────────────────────────────────────────────────

const BASE_ENV = {
  PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
  HOME: '/tmp',
};

const GO_ENV = {
  ...BASE_ENV,
  CGO_ENABLED:  '0',
  GOARCH:       'arm64',
  GOOS:         'linux',
  GOPATH:       '/var/cache/gopath',
  GOCACHE:      '/var/cache/gocache',
  GOMODCACHE:   '/var/cache/gopath/pkg/mod',
};

const JAVA_ENV = {
  ...BASE_ENV,
  JAVA_HOME: '/usr/lib/jvm/java-21-openjdk-arm64',
};

/**
 * Language config:
 *  version    — reported in API response (informational)
 *  ext        — source file extension
 *  fileName   — optional fn(code) → filename (Java needs class-name-based file)
 *  compile    — optional async fn(boxDir, fileName) → { stdout, stderr, code }
 *  runCmd     — fn(fileName) → { cmd, args }
 *  timeSec    — CPU time limit in seconds
 *  wallTimeSec— wall-clock limit in seconds
 *  memKB      — memory limit in KB (RLIMIT_AS or cgroup)
 *  processes  — max process count (fork bomb protection)
 *  extraEnv   — env vars passed into isolate --env flags
 */
const LANGUAGES = {

  // memKB      — physical memory cap for cgroup v2 mode
  // rlimitMemKB — virtual address space cap for RLIMIT_AS mode.
  //               Must be higher than memKB because runtimes map far more VSZ
  //               than they actually use as resident memory (shared libs, JIT
  //               arenas, thread stacks, etc.).  Not set for compiled languages
  //               whose binaries are tiny — they stay at memKB even in rlimit mode.
  //
  // Measured VSZ baselines on ARM64 Ubuntu 24.04 (hello-world program):
  //   python3:  ~50 MB   node:    ~280 MB   java:    ~550 MB
  //   gcc/g++:  ~8 MB    go bin:  ~10 MB    ruby:    ~35 MB
  //   php:      ~25 MB   bash:    ~5 MB      sqlite3: ~5 MB

  python: {
    version: '3.12.0',
    ext: 'py',
    runCmd: () => ({ cmd: '/usr/bin/python3', args: ['main.py'] }),
    timeSec: 5, wallTimeSec: 10, memKB: 131072, rlimitMemKB: 262144, processes: 50,
    extraEnv: { PYTHONDONTWRITEBYTECODE: '1' },
  },

  javascript: {
    version: '20.0.0',
    ext: 'js',
    runCmd: () => ({ cmd: '/usr/bin/node', args: ['main.js'] }),
    // Node.js 20 uses V8 pointer compression: V8 calls mmap(NULL, 4 GB, PROT_NONE)
    // at startup to reserve a contiguous 4 GB virtual cage for pointer compression.
    // RLIMIT_AS limits virtual address space — not physical RAM.  If RLIMIT_AS < ~5 GB,
    // the 4 GB mmap fails, V8 crashes before executing any user code, and isolate
    // reports SG (killed by signal) → oom_killed in the UI.
    // Fix: set rlimitMemKB ≥ 5 GB (virtual only — no physical pages until written).
    // Physical RAM is bounded by the container's limits.memory (2Gi in k8s).
    timeSec: 5, wallTimeSec: 10, memKB: 131072, rlimitMemKB: 6291456, processes: 50,
    extraEnv: { NODE_ENV: 'sandbox' },
  },

  typescript: {
    version: '5.4.5',
    ext: 'ts',
    compile: async (dir) => {
      // Write ambient shims so tsc can resolve Node.js built-in imports
      // (e.g. `import * as readline from "readline"`) without @types/node.
      const shimsPath = path.join(dir, '_node_shims.d.ts');
      await fsp.writeFile(shimsPath, TS_NODE_SHIMS, 'utf8');

      // Type-check outside the sandbox with tsc --noEmit.
      // Produces clean, line-numbered TS error messages
      // (e.g. "main.ts:1:10 - error TS1005: ':' expected.")
      // and prevents ts-node from ever seeing malformed syntax that would
      // trigger its internal "Debug Failure" assertion crash.
      const cr = await exec(
        '/usr/local/bin/tsc',
        [
          '--noEmit',
          '--strict',           '--skipLibCheck',
          '--moduleResolution', 'node',
          '--target',           'ES2022',
          '--module',           'commonjs',
          path.join(dir, 'main.ts'),
          shimsPath,
        ],
        { env: BASE_ENV, timeout: COMPILE_TIMEOUT_MS, maxBuffer: 2 * 1024 * 1024 }
      );

      // TypeScript 5.4.5 compiler bug: certain malformed AST nodes trigger an
      // internal assertion in assertDiagnosticLocation — "Debug Failure. Expected
      // N <= M" — causing tsc itself to crash before it can emit a user-facing
      // diagnostic. Detect the crash and replace with a clean, informative message.
      if (cr.code !== 0 && (cr.stdout.includes('Debug Failure') || cr.stderr.includes('Debug Failure'))) {
        return { ...cr, stdout: 'main.ts - error TS1: Syntax error — invalid or incomplete TypeScript syntax.\n', stderr: '' };
      }

      return cr;
    },
    // --transpile-only: type checking already done by tsc --noEmit above.
    // Skipping redundant type-checking also keeps stdin/readline working correctly.
    // --compiler-options: explicit flags prevent ts-node from picking up any ambient
    // tsconfig.json that might set module:NodeNext and break CommonJS require() shims.
    runCmd: () => ({
      cmd: '/usr/local/bin/ts-node',
      args: [
        '--skip-project',
        '--transpile-only',
        '--compiler-options', '{"module":"commonjs","moduleResolution":"node","target":"ES2022","skipLibCheck":true}',
        'main.ts',
      ],
    }),
    timeSec: 5, wallTimeSec: 10, memKB: 131072, rlimitMemKB: 6291456, processes: 50,
    extraEnv: { NODE_ENV: 'sandbox' },
  },

  java: {
    version: '21.0.0',
    ext: 'java',
    fileName: (code) => {
      // Java file must be named after the public class.
      // Strip comments before matching to avoid false positives.
      const stripped = code
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '');
      const m = stripped.match(/public\s+class\s+(\w+)/);
      return m ? `${m[1]}.java` : 'Main.java';
    },
    compile: async (dir, fileName) => {
      // javac writes .class files alongside the .java file inside the box dir.
      return exec(
        '/usr/bin/javac',
        ['-cp', dir, path.join(dir, fileName)],
        { env: JAVA_ENV, timeout: COMPILE_TIMEOUT_MS, maxBuffer: 2 * 1024 * 1024 }
      );
    },
    runCmd: (fileName) => {
      const className = path.basename(fileName, '.java');
      return {
        // /usr/bin/java → /etc/alternatives/java → real path (symlink chain).
        // /etc/alternatives is NOT mounted inside the isolate sandbox, so the
        // symlink resolution fails with ENOENT. Use the real JVM path directly.
        cmd: '/usr/lib/jvm/java-21-openjdk-arm64/bin/java',
        args: [
          '-cp', '.',
          '-Xmx200m',                  // heap cap below cgroup limit
          '-Xss512k',                  // stack (default 1MB on arm64 is wasteful)
          '-XX:+UseSerialGC',          // avoid background GC threads
          '-XX:-UsePerfData',          // suppress /tmp/hsperfdata write attempts
          '-XX:TieredStopAtLevel=1',   // faster startup for short programs
          '-XX:+ExitOnOutOfMemoryError',
          className,
        ],
      };
    },
    // JVM on 64-bit ARM reserves ~2-3 GB of virtual address space at startup:
    // code cache (~240 MB), metaspace, class data sharing archive, compressed oops
    // region, thread stacks, etc.  With RLIMIT_AS = 1 GB the JVM fails before
    // main() runs.  4 GB gives the JVM enough virtual room; physical RAM is still
    // capped by -Xmx200m (heap) and the container's limits.memory: 2Gi.
    timeSec: 8, wallTimeSec: 15, memKB: 524288, rlimitMemKB: 4194304, processes: 30,
    extraEnv: {
      JAVA_HOME:  '/usr/lib/jvm/java-21-openjdk-arm64',
      JAVA_TOOL_OPTIONS: '-XX:+ExitOnOutOfMemoryError',
    },
  },

  c: {
    version: '13.0.0',
    ext: 'c',
    compile: async (dir) => {
      return exec(
        '/usr/bin/gcc',
        ['-O2', '-o', path.join(dir, 'prog'), path.join(dir, 'main.c'), '-lm'],
        { env: BASE_ENV, timeout: COMPILE_TIMEOUT_MS, maxBuffer: 2 * 1024 * 1024 }
      );
    },
    runCmd: () => ({ cmd: './prog', args: [] }),
    // Compiled binary VSZ is tiny (~8 MB); 256 MB is ample for data structures
    timeSec: 5, wallTimeSec: 10, memKB: 131072, processes: 10,
  },

  'c++': {
    version: '13.0.0',
    ext: 'cpp',
    compile: async (dir) => {
      return exec(
        '/usr/bin/g++',
        ['-O2', '-std=c++17', '-o', path.join(dir, 'prog'), path.join(dir, 'main.cpp'), '-lm'],
        { env: BASE_ENV, timeout: COMPILE_TIMEOUT_MS, maxBuffer: 2 * 1024 * 1024 }
      );
    },
    runCmd: () => ({ cmd: './prog', args: [] }),
    // Same as C — compiled binary, minimal VSZ overhead
    timeSec: 5, wallTimeSec: 10, memKB: 131072, processes: 10,
  },

  go: {
    version: '1.22.0',
    ext: 'go',
    compile: async (dir) => {
      // Write go.mod so 'go build' doesn't try to fetch modules from the network.
      // CGO_ENABLED=0 → static binary (no glibc dependency inside the sandbox).
      fs.writeFileSync(path.join(dir, 'go.mod'), 'module user_prog\n\ngo 1.22\n');
      return exec(
        '/usr/bin/go',
        ['build', '-o', 'prog', '.'],
        {
          cwd: dir,
          env: GO_ENV,
          timeout: COMPILE_TIMEOUT_MS,
          maxBuffer: 2 * 1024 * 1024,
        }
      );
    },
    runCmd: () => ({ cmd: './prog', args: [] }),
    // Go runtime on 64-bit ARM reserves a large virtual address block for its
    // mheap page-summary tables at startup (mpagealloc_64bit.go sysInit).
    // With RLIMIT_AS < ~5 GB the reservation fails ("failed to reserve page
    // summary memory") and the binary exits with code 2 before main() runs.
    // Physical RAM is still bounded by memKB (256 MB) and the container limit.
    timeSec: 5, wallTimeSec: 10, memKB: 262144, rlimitMemKB: 6291456, processes: 30,
  },

  bash: {
    version: '5.2.0',
    ext: 'sh',
    runCmd: () => ({ cmd: '/bin/bash', args: ['main.sh'] }),
    // bash VSZ ~5 MB; 128 MB is safe even in RLIMIT_AS mode
    timeSec: 5, wallTimeSec: 10, memKB: 65536, processes: 20,
    extraEnv: { BASH_ENV: '' },
  },

  ruby: {
    version: '3.2.0',
    ext: 'rb',
    runCmd: () => ({ cmd: '/usr/bin/ruby', args: ['main.rb'] }),
    // Ruby VSZ ~35 MB; 256 MB covers most programs comfortably
    timeSec: 5, wallTimeSec: 10, memKB: 131072, rlimitMemKB: 262144, processes: 50,
  },

  php: {
    version: '8.3.0',
    ext: 'php',
    // /usr/bin/php → /etc/alternatives/php (absolute symlink) — /etc/alternatives
    // is NOT mounted inside the isolate sandbox. Use the concrete versioned binary.
    runCmd: () => ({ cmd: '/usr/bin/php8.3', args: ['main.php'] }),
    // PHP VSZ ~25 MB; 256 MB is safe headroom
    timeSec: 5, wallTimeSec: 10, memKB: 131072, rlimitMemKB: 262144, processes: 30,
  },

  sqlite3: {
    version: '3.45.0',
    ext: 'sql',
    // Pass SQL from the source file as stdin; SQLite executes against :memory:
    runCmd: () => ({ cmd: '/usr/bin/sqlite3', args: [':memory:'] }),
    // Override: use file content as stdin (handled in execute())
    useSqliteStdin: true,
    // sqlite3 binary VSZ ~5 MB; 64 MB physical / 128 MB VSZ is more than enough
    timeSec: 5, wallTimeSec: 10, memKB: 65536, processes: 5,
  },
};

// ── Output sanitizer ──────────────────────────────────────────────────────────
//
// Strip the sandbox box directory from compiler/runtime error messages so that
// users see just filenames rather than internal system paths.
//
// Examples (box dir = /var/local/lib/isolate/0/box):
//   "/var/local/lib/isolate/0/box/main.ts:1:10 - error TS1005"
//     → "main.ts:1:10 - error TS1005"
//   File "/var/local/lib/isolate/0/box/main.py", line 3
//     → File "main.py", line 3
//   in /var/local/lib/isolate/0/box/main.php on line 5
//     → in main.php on line 5
//
// Applied to stdout + stderr for both compile and run steps across all languages.

function sanitizeOutput(text, dir) {
  if (!text) return text;
  // Escape regex special chars in the directory path, then strip all occurrences
  // with or without a trailing slash.
  const escaped = dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(escaped + '/?', 'g'), '');
}

// ── Core execute function ──────────────────────────────────────────────────────

async function execute(language, code, stdin) {
  const lang = LANGUAGES[language];
  if (!lang) throw Object.assign(new Error(`Unsupported language: ${language}`), { status: 400 });

  const fileName = lang.fileName ? lang.fileName(code) : `main.${lang.ext}`;

  let boxId = null;
  try {
    boxId = await pool.acquire();
  } catch (e) {
    if (e.message === 'server_busy') {
      return { status: 'server_busy' };
    }
    throw e;
  }

  try {
    // ── Write source file into the already-initialized box ───────────────────
    const dir = boxDir(boxId);
    await fsp.writeFile(path.join(dir, fileName), code, 'utf8');

    // ── Compile step (outside sandbox — compilers don't execute user code) ───
    let compileResult = null;
    if (lang.compile) {
      const cr = await lang.compile(dir, fileName);
      // Strip internal box directory from compiler error messages.
      const cOut = sanitizeOutput(cr.stdout ?? '', dir);
      const cErr = sanitizeOutput(cr.stderr ?? '', dir);
      if (cr.code !== 0) {
        // Compile failed — return compile error shape immediately
        return {
          language,
          version:  lang.version,
          compile: {
            stdout: truncate(cOut),
            stderr: truncate(cErr),
            code:   cr.code,
            signal: cr.signal ?? null,
            output: truncate(cOut + cErr),
          },
          run: { stdout: '', stderr: '', code: null, signal: null, output: '' },
        };
      }
      compileResult = {
        stdout: truncate(cOut),
        stderr: truncate(cErr),
        code:   0,
        signal: null,
        output: truncate(cOut + cErr),
      };
    }

    // ── Determine effective stdin ─────────────────────────────────────────────
    // SQLite: SQL from the source file becomes stdin; user-provided stdin ignored
    const effectiveStdin = lang.useSqliteStdin
      ? code
      : (stdin ?? '');

    // ── Run inside isolate sandbox ────────────────────────────────────────────
    const { cmd, args } = lang.runCmd(fileName);
    const { stdout, stderr, meta } = await isolateRun(boxId, {
      cmd,
      args,
      stdin:        effectiveStdin,
      timeSec:      lang.timeSec,
      wallTimeSec:  lang.wallTimeSec,
      memKB:        lang.memKB,
      rlimitMemKB:  lang.rlimitMemKB,
      processes:    lang.processes,
      extraEnv:     lang.extraEnv ?? {},
    });

    // Strip internal box directory from runtime error messages (stack traces, etc.)
    const cleanStdout = sanitizeOutput(stdout, dir);
    const cleanStderr = sanitizeOutput(stderr, dir);

    const run = buildRunResult(cleanStdout, cleanStderr, meta);

    return {
      language,
      version:  lang.version,
      compile:  compileResult ?? undefined,
      run,
    };

  } finally {
    // ── Box cleanup + re-init (ALWAYS runs, even on thrown errors) ───────────
    if (boxId !== null) {
      await isolateCleanup(boxId);

      // Re-init so the box is immediately ready for the next request.
      // If re-init fails, the box is discarded to prevent corrupted state.
      const reinit = await exec(ISOLATE_BIN,
        [...(USE_CG ? ['--cg'] : []), `--box-id=${boxId}`, '--init']
      ).catch(() => ({ code: 1 }));

      if (reinit.code === 0) {
        pool.release(boxId);
      } else {
        console.error(`[warn] box ${boxId} re-init failed — removing from pool`);
        pool.discard(boxId);
      }
    }
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    ok:       true,
    cgMode:   USE_CG ? 'cgroup-v2' : 'rlimit',
    poolSize: pool.free.length,
    queued:   pool.waiting.length,
    uptime:   Math.floor(process.uptime()),
  });
});

app.get('/api/v2/runtimes', (_req, res) => {
  res.json(
    Object.entries(LANGUAGES).map(([lang, def]) => ({
      language: lang,
      version:  def.version,
      aliases:  [],
    }))
  );
});

app.post('/api/v2/execute', async (req, res) => {
  try {
    const { language, files, stdin } = req.body ?? {};
    const code = files?.[0]?.content ?? '';

    if (!language || !code) {
      return res.status(400).json({ message: 'language and files[0].content are required' });
    }

    if (!LANGUAGES[language]) {
      return res.status(400).json({ message: `Unsupported language: ${language}` });
    }

    const result = await execute(language, code, stdin ?? '');

    if (result.status === 'server_busy') {
      return res.status(503).json({ message: 'server_busy' });
    }

    res.json(result);
  } catch (e) {
    console.error('[execute error]', e);
    res.status(500).json({ message: 'internal server error' });
  }
});

app.use((_req, res) => res.status(404).json({ message: 'not found' }));

// ── Startup ────────────────────────────────────────────────────────────────────

/**
 * Test whether cgroup v2 is accessible inside this container.
 * Uses box ID 99 (outside the pool range) to avoid interfering with real boxes.
 *
 * Defaults to RLIMIT_AS mode (USE_ISOLATE_CG !== '1') because:
 *
 *  • In Kubernetes, the container cgroup does NOT have 'memory' in
 *    cgroup.subtree_control by default.  isolate --cg --init succeeds
 *    (it just mkdir's the cgroup directory), but writing memory.max fails.
 *    The run then either aborts (empty meta → oom_killed in the UI) or runs
 *    without any memory limit — both are wrong.
 *
 *  • The detection test passes even when memory limiting is broken because
 *    a trivial shell script uses far less than the test's cg-mem value.
 *
 *  • Physical memory is already bounded by the container's limits.memory: 2Gi
 *    k8s resource limit, so RLIMIT_AS mode is safe: the rlimitMemKB values
 *    (6 GB VSZ for Node/TS/Go, 4 GB for Java) limit virtual address space
 *    while the container cgroup limits physical RSS.
 *
 *  Set USE_ISOLATE_CG=1 in the deployment env to opt back into cgroup mode
 *  (only useful if the node has proper cgroup delegation configured).
 */
async function detectCgroupSupport() {
  if (process.env.USE_ISOLATE_CG !== '1') {
    console.log('[startup] USE_ISOLATE_CG not set — using RLIMIT_AS memory mode');
    return false;
  }

  await exec(ISOLATE_BIN, ['--cleanup', '--box-id=99']).catch(() => {});

  const init = await exec(ISOLATE_BIN, ['--cg', '--init', '--box-id=99']);
  if (init.code !== 0) {
    console.log('[startup] cgroup v2 not available — using RLIMIT_AS memory mode');
    return false;
  }

  // Write a trivial test program and run with cgroup mem flag
  try {
    fs.writeFileSync('/var/local/lib/isolate/99/box/test.sh', '#!/bin/sh\nexit 0\n');
  } catch {
    await exec(ISOLATE_BIN, ['--cg', '--cleanup', '--box-id=99']).catch(() => {});
    return false;
  }

  const test = await exec(ISOLATE_BIN, [
    '--box-id=99', '--cg', '--cg-mem=65536',
    '--time=2', '--wall-time=5', '--processes=5',
    `--meta=${metaPath(99)}`,
    '--run', '--', '/bin/sh', 'test.sh',
  ]);

  await exec(ISOLATE_BIN, ['--cg', '--cleanup', '--box-id=99']).catch(() => {});
  await fsp.unlink(metaPath(99)).catch(() => {});

  if (test.code === 0) {
    console.log('[startup] cgroup v2 available — using cgroup memory mode');
    return true;
  } else {
    console.log('[startup] cgroup v2 test run failed — using RLIMIT_AS memory mode');
    console.log('[startup] stderr:', test.stderr.slice(0, 200));
    return false;
  }
}

/**
 * Initialize all pool boxes. Called once at startup.
 * Cleans any leftover state from a previous pod crash, then inits fresh boxes.
 */
async function initPool() {
  console.log(`[startup] Initializing ${POOL_SIZE} isolate boxes...`);
  for (let id = 0; id < POOL_SIZE; id++) {
    // Clean first (idempotent — safe even if box was never initialized)
    await exec(ISOLATE_BIN, [...(USE_CG ? ['--cg'] : []), `--box-id=${id}`, '--cleanup'])
      .catch(() => {});

    const init = await exec(ISOLATE_BIN, [...(USE_CG ? ['--cg'] : []), `--box-id=${id}`, '--init']);
    if (init.code !== 0) {
      console.error(`[startup] FATAL: isolate --init failed for box ${id}`);
      console.error('[startup] stderr:', init.stderr);
      process.exit(1);
    }
  }
  console.log(`[startup] All ${POOL_SIZE} boxes ready.`);
}

// ── Graceful shutdown ──────────────────────────────────────────────────────────

/**
 * On SIGTERM (Kubernetes rolling update / node drain):
 * Stop accepting new requests, clean up all boxes, then exit.
 * Without this, boxes may hold cgroup resources and the next pod fails to init.
 */
let server;

async function shutdown(signal) {
  console.log(`[shutdown] Received ${signal}`);
  server.close(async () => {
    console.log('[shutdown] HTTP server closed — cleaning boxes...');
    for (let id = 0; id < POOL_SIZE; id++) {
      await exec(ISOLATE_BIN, [...(USE_CG ? ['--cg'] : []), `--box-id=${id}`, '--cleanup'])
        .catch(() => {});
    }
    // Also clean box 99 (cgroup detection box)
    await exec(ISOLATE_BIN, ['--cleanup', '--box-id=99']).catch(() => {});
    console.log('[shutdown] Done.');
    process.exit(0);
  });

  // Force exit after 25s (Kubernetes terminationGracePeriodSeconds is 30s)
  setTimeout(() => {
    console.error('[shutdown] Force exit after 25s timeout');
    process.exit(1);
  }, 25_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ── Main ───────────────────────────────────────────────────────────────────────

(async function main() {
  // Verify isolate is installed and executable
  const check = await exec(ISOLATE_BIN, ['--version']).catch(() => null);
  if (!check || check.code === null) {
    console.error('[startup] FATAL: isolate binary not found or not executable at', ISOLATE_BIN);
    process.exit(1);
  }
  console.log('[startup] isolate:', check.stdout.trim() || check.stderr.trim());

  // Adaptive cgroup detection
  USE_CG = await detectCgroupSupport();

  // Initialize all sandbox boxes
  await initPool();

  const PORT = parseInt(process.env.PORT ?? '2000', 10);
  server = app.listen(PORT, () => {
    console.log(`[startup] Listening on :${PORT}`);
    console.log(`[startup] Languages: ${Object.keys(LANGUAGES).join(', ')}`);
    console.log(`[startup] cgroup mode: ${USE_CG ? 'cgroup v2' : 'rlimit'}`);
    console.log(`[startup] Pool: ${POOL_SIZE} boxes, max queue: ${MAX_QUEUE}`);
  });
})();
