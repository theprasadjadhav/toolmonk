"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Editor, { type BeforeMount } from "@monaco-editor/react";
import { Toolbar, ToolbarButton, ToolbarRight, Icons } from "@/components/ui/Toolbar";
import { useToolFullscreen, FullscreenButton } from "@/components/tool/ToolPanel";
import { cn } from "@/lib/utils/cn";
import { actionBtnBase, actionBtnEnabledCls, actionBtnDisabledCls } from "@/lib/utils/formStyles";

// ── Types ──────────────────────────────────────────────────────────────────────

export type RunStatus =
  | "idle" | "queued" | "executing" | "success"
  | "runtime_error" | "compile_error" | "timeout"
  | "oom_killed" | "rate_limited" | "server_busy";

interface RunResult {
  status: RunStatus;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  time?: number;
  retryAfter?: number;
}

export interface ExecutorToolProps {
  monacoId: string;
  label: string;
  initialCode?: string;
  initialStdin?: string;
  toolbarLeading?: React.ReactNode;
}

// ── Language metadata ──────────────────────────────────────────────────────────

const FILE_NAMES: Record<string, string> = {
  python: "main.py", javascript: "main.js", typescript: "main.ts",
  java: "Main.java", c: "main.c", cpp: "main.cpp", go: "main.go",
  shell: "script.sh", ruby: "main.rb", php: "main.php", sql: "query.sql",
};

const LANG_DOTS: Record<string, string> = {
  python: "#3b82f6", javascript: "#f59e0b", typescript: "#3b82f6",
  java: "#ef4444", c: "#a78bfa", cpp: "#a78bfa", go: "#22d3ee",
  shell: "#4ade80", ruby: "#fb7185", php: "#818cf8", sql: "#fb923c",
};

// ── Client ID ─────────────────────────────────────────────────────────────────

function getClientId(): string {
  if (typeof window === "undefined") return "";
  const key = "tm_client_id";
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
}

// ── Monaco: Node.js type declarations ─────────────────────────────────────────
// Adds ambient globals + module declarations for Node.js built-ins so that
// `import * as readline from "readline"` (and similar) never show a red line.

const NODE_DEFS = `
declare var require: (module: string) => any;
declare var module: { exports: any };
declare var exports: any;
declare var __dirname: string;
declare var __filename: string;
declare namespace process {
  var stdin: any; var stdout: any; var stderr: any;
  var env: Record<string, string | undefined>;
  var argv: string[]; var version: string; var platform: string;
  function exit(code?: number): never;
  function on(event: string, listener: (...args: any[]) => void): any;
}
declare class Buffer {
  static from(data: any, encoding?: string): Buffer;
  static alloc(size: number): Buffer;
  toString(encoding?: string): string;
  length: number;
}

// ── readline ──────────────────────────────────────────────────────────────────
declare module "readline" {
  interface ReadLineOptions {
    input?: any;
    output?: any;
    terminal?: boolean;
    historySize?: number;
    prompt?: string;
    crlfDelay?: number;
    removeHistoryDuplicates?: boolean;
  }
  interface Interface {
    on(event: "line",  listener: (line: string)  => void): this;
    on(event: "close", listener: ()              => void): this;
    on(event: string,  listener: (...a: any[])   => void): this;
    once(event: string, listener: (...a: any[])  => void): this;
    close(): void;
    pause(): this;
    resume(): this;
    setPrompt(prompt: string): void;
    prompt(preserveCursor?: boolean): void;
    question(query: string, callback: (answer: string) => void): void;
  }
  function createInterface(options: ReadLineOptions): Interface;
  function createInterface(input: any, output?: any): Interface;
}

// ── fs ────────────────────────────────────────────────────────────────────────
declare module "fs" {
  function readFileSync(path: string, encoding: BufferEncoding): string;
  function readFileSync(path: string): Buffer;
  function writeFileSync(path: string, data: string | Buffer, options?: any): void;
  function appendFileSync(path: string, data: string | Buffer, options?: any): void;
  function existsSync(path: string): boolean;
  function readdirSync(path: string, options?: any): string[];
  function mkdirSync(path: string, options?: any): string | undefined;
  function rmSync(path: string, options?: any): void;
  function unlinkSync(path: string): void;
  function statSync(path: string): { size: number; isFile(): boolean; isDirectory(): boolean; mtime: Date };
  function createReadStream(path: string, options?: any): any;
  function createWriteStream(path: string, options?: any): any;
  function copyFileSync(src: string, dest: string, flags?: number): void;
  function renameSync(oldPath: string, newPath: string): void;
  const promises: {
    readFile(path: string, encoding?: BufferEncoding): Promise<string | Buffer>;
    writeFile(path: string, data: string | Buffer, options?: any): Promise<void>;
    readdir(path: string): Promise<string[]>;
    mkdir(path: string, options?: any): Promise<string | undefined>;
    rm(path: string, options?: any): Promise<void>;
    stat(path: string): Promise<any>;
  };
}

// ── path ──────────────────────────────────────────────────────────────────────
declare module "path" {
  function join(...paths: string[]): string;
  function resolve(...paths: string[]): string;
  function relative(from: string, to: string): string;
  function dirname(p: string): string;
  function basename(p: string, ext?: string): string;
  function extname(p: string): string;
  function parse(p: string): { root: string; dir: string; base: string; ext: string; name: string };
  function format(obj: Partial<{ root: string; dir: string; base: string; ext: string; name: string }>): string;
  function isAbsolute(p: string): boolean;
  function normalize(p: string): string;
  const sep: string;
  const delimiter: string;
  const posix: typeof import("path");
  const win32: typeof import("path");
}

// ── os ────────────────────────────────────────────────────────────────────────
declare module "os" {
  function hostname(): string;
  function platform(): NodeJS.Platform;
  function arch(): string;
  function release(): string;
  function cpus(): Array<{ model: string; speed: number; times: any }>;
  function totalmem(): number;
  function freemem(): number;
  function homedir(): string;
  function tmpdir(): string;
  function userInfo(options?: any): { username: string; uid: number; gid: number; shell: string | null; homedir: string };
  function networkInterfaces(): Record<string, any[]>;
  function loadavg(): [number, number, number];
  const EOL: string;
}

// ── crypto ────────────────────────────────────────────────────────────────────
declare module "crypto" {
  interface Hash { update(data: string | Buffer, encoding?: string): Hash; digest(encoding: "hex" | "base64" | "latin1"): string; digest(): Buffer; }
  interface Hmac { update(data: string | Buffer, encoding?: string): Hmac; digest(encoding: "hex" | "base64" | "latin1"): string; digest(): Buffer; }
  function createHash(algorithm: string): Hash;
  function createHmac(algorithm: string, key: string | Buffer): Hmac;
  function randomBytes(size: number): Buffer;
  function randomBytes(size: number, callback: (err: Error | null, buf: Buffer) => void): void;
  function randomInt(max: number): number;
  function randomInt(min: number, max: number): number;
  function randomUUID(): string;
  function pbkdf2Sync(password: string, salt: string, iterations: number, keylen: number, digest: string): Buffer;
  function scryptSync(password: string | Buffer, salt: string | Buffer, keylen: number, options?: any): Buffer;
  function timingSafeEqual(a: Buffer, b: Buffer): boolean;
  function createCipheriv(algorithm: string, key: any, iv: any, options?: any): any;
  function createDecipheriv(algorithm: string, key: any, iv: any, options?: any): any;
}

// ── events ────────────────────────────────────────────────────────────────────
declare module "events" {
  class EventEmitter {
    static defaultMaxListeners: number;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    off(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
    emit(event: string | symbol, ...args: any[]): boolean;
    listeners(event: string | symbol): Function[];
    listenerCount(event: string | symbol): number;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    eventNames(): Array<string | symbol>;
  }
  export = EventEmitter;
}

// ── util ──────────────────────────────────────────────────────────────────────
declare module "util" {
  function format(format?: any, ...params: any[]): string;
  function inspect(object: any, options?: any): string;
  function promisify<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => Promise<any>;
  function inherits(constructor: any, superConstructor: any): void;
  function isDeepStrictEqual(val1: any, val2: any): boolean;
  function deprecate<T extends Function>(fn: T, msg: string): T;
  const types: {
    isArray(val: any): val is any[];
    isDate(val: any): val is Date;
    isRegExp(val: any): val is RegExp;
    isPromise(val: any): val is Promise<any>;
    isMap(val: any): val is Map<any, any>;
    isSet(val: any): val is Set<any>;
  };
}

// ── assert ────────────────────────────────────────────────────────────────────
declare module "assert" {
  function assert(value: any, message?: string | Error): asserts value;
  namespace assert {
    function ok(value: any, message?: string | Error): asserts value;
    function strictEqual<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
    function notStrictEqual(actual: any, expected: any, message?: string | Error): void;
    function deepStrictEqual<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
    function notDeepStrictEqual(actual: any, expected: any, message?: string | Error): void;
    function throws(block: () => any, message?: string | Error): void;
    function throws(block: () => any, error: any, message?: string | Error): void;
    function doesNotThrow(block: () => any, message?: string | Error): void;
    function rejects(block: () => Promise<any>, message?: string | Error): Promise<void>;
    function doesNotReject(block: () => Promise<any>, message?: string | Error): Promise<void>;
    function fail(message?: string | Error): never;
    function equal(actual: any, expected: any, message?: string | Error): void;
    function notEqual(actual: any, expected: any, message?: string | Error): void;
    class AssertionError extends Error { actual: any; expected: any; operator: string; }
  }
  export = assert;
}

// ── url ───────────────────────────────────────────────────────────────────────
declare module "url" {
  function parse(urlString: string, parseQueryString?: false, slashesDenoteHost?: boolean): any;
  function format(urlObject: any): string;
  function resolve(from: string, to: string): string;
  class URL {
    constructor(input: string, base?: string | URL);
    href: string; origin: string; protocol: string; username: string; password: string;
    host: string; hostname: string; port: string; pathname: string; search: string;
    hash: string; searchParams: URLSearchParams;
    toString(): string; toJSON(): string;
  }
  class URLSearchParams {
    constructor(init?: string | Record<string, string> | Iterable<[string, string]>);
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    getAll(name: string): string[];
    has(name: string): boolean;
    set(name: string, value: string): void;
    toString(): string;
  }
}

// ── querystring ───────────────────────────────────────────────────────────────
declare module "querystring" {
  function parse(str: string, sep?: string, eq?: string, options?: any): Record<string, string | string[]>;
  function stringify(obj: any, sep?: string, eq?: string, options?: any): string;
  function escape(str: string): string;
  function unescape(str: string): string;
}

// ── child_process ─────────────────────────────────────────────────────────────
declare module "child_process" {
  interface ExecOptions { cwd?: string; env?: Record<string, string>; shell?: string; timeout?: number; maxBuffer?: number; encoding?: string; }
  interface SpawnOptions { cwd?: string; env?: Record<string, string>; stdio?: any; shell?: boolean | string; detached?: boolean; }
  function exec(command: string, callback?: (error: Error | null, stdout: string, stderr: string) => void): any;
  function exec(command: string, options: ExecOptions, callback?: (error: Error | null, stdout: string, stderr: string) => void): any;
  function execSync(command: string, options?: ExecOptions): Buffer | string;
  function spawn(command: string, args?: readonly string[], options?: SpawnOptions): any;
  function spawnSync(command: string, args?: readonly string[], options?: SpawnOptions): { pid: number; output: any; stdout: Buffer; stderr: Buffer; status: number | null; signal: string | null; error?: Error };
  function execFile(file: string, callback?: (error: Error | null, stdout: string, stderr: string) => void): any;
  function fork(modulePath: string, args?: readonly string[], options?: SpawnOptions): any;
}

// ── stream ────────────────────────────────────────────────────────────────────
declare module "stream" {
  class Readable {
    on(event: string, listener: (...args: any[]) => void): this;
    pipe<T extends Writable>(destination: T, options?: { end?: boolean }): T;
    read(size?: number): any;
    destroy(error?: Error): this;
  }
  class Writable {
    write(chunk: any, encoding?: string, callback?: (err?: Error | null) => void): boolean;
    end(chunk?: any, encoding?: string, callback?: () => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
    destroy(error?: Error): this;
  }
  class Transform extends Readable {
    write(chunk: any, encoding?: string, callback?: (err?: Error | null) => void): boolean;
    end(chunk?: any, encoding?: string, callback?: () => void): this;
  }
  class PassThrough extends Transform {}
  function pipeline(...streams: any[]): any;
  function finished(stream: any, callback: (err?: Error | null) => void): () => void;
}

// ── http / https (minimal, network is blocked in sandbox) ────────────────────
declare module "http" {
  interface IncomingMessage { statusCode?: number; headers: any; on(e: string, l: (...a: any[]) => void): this; }
  interface ServerResponse { writeHead(status: number, headers?: any): this; write(chunk: any): boolean; end(data?: any): this; }
  interface ClientRequest { on(e: string, l: (...a: any[]) => void): this; end(): this; write(chunk: any): this; abort(): void; }
  function request(url: string | any, options?: any, callback?: (res: IncomingMessage) => void): ClientRequest;
  function get(url: string | any, callback?: (res: IncomingMessage) => void): ClientRequest;
  function createServer(requestListener?: (req: IncomingMessage, res: ServerResponse) => void): any;
}
declare module "https" {
  export * from "http";
  function request(url: string | any, options?: any, callback?: (res: any) => void): any;
  function get(url: string | any, callback?: (res: any) => void): any;
}

// ── net ───────────────────────────────────────────────────────────────────────
declare module "net" {
  class Socket {
    connect(port: number, host?: string, connectionListener?: () => void): this;
    write(data: string | Buffer, encoding?: string, callback?: (err?: Error) => void): boolean;
    end(data?: string | Buffer): this;
    destroy(error?: Error): this;
    on(event: string, listener: (...args: any[]) => void): this;
    localAddress: string; localPort: number; remoteAddress?: string; remotePort?: number;
  }
  function createServer(connectionListener?: (socket: Socket) => void): any;
  function createConnection(options: any, connectionListener?: () => void): Socket;
  function createConnection(port: number, host?: string, connectionListener?: () => void): Socket;
}

// ── zlib ──────────────────────────────────────────────────────────────────────
declare module "zlib" {
  function gzip(buffer: Buffer | string, callback: (error: Error | null, result: Buffer) => void): void;
  function gunzip(buffer: Buffer, callback: (error: Error | null, result: Buffer) => void): void;
  function deflate(buffer: Buffer | string, callback: (error: Error | null, result: Buffer) => void): void;
  function inflate(buffer: Buffer, callback: (error: Error | null, result: Buffer) => void): void;
  function gzipSync(buffer: Buffer | string, options?: any): Buffer;
  function gunzipSync(buffer: Buffer, options?: any): Buffer;
  function deflateSync(buffer: Buffer | string, options?: any): Buffer;
  function inflateSync(buffer: Buffer, options?: any): Buffer;
  function brotliCompress(buffer: Buffer | string, callback: (error: Error | null, result: Buffer) => void): void;
  function brotliDecompress(buffer: Buffer, callback: (error: Error | null, result: Buffer) => void): void;
}

// ── buffer ────────────────────────────────────────────────────────────────────
declare module "buffer" {
  export { Buffer };
  const constants: { MAX_LENGTH: number; MAX_STRING_LENGTH: number };
}

// ── timers / promises ─────────────────────────────────────────────────────────
declare module "timers" {
  function setTimeout(callback: (...args: any[]) => void, ms?: number, ...args: any[]): any;
  function setInterval(callback: (...args: any[]) => void, ms?: number, ...args: any[]): any;
  function setImmediate(callback: (...args: any[]) => void, ...args: any[]): any;
  function clearTimeout(timeoutId: any): void;
  function clearInterval(intervalId: any): void;
  function clearImmediate(immediateId: any): void;
  const promises: { setTimeout(ms: number, value?: any): Promise<any>; setImmediate(value?: any): Promise<any> };
}

// ── perf_hooks ────────────────────────────────────────────────────────────────
declare module "perf_hooks" {
  const performance: { now(): number; mark(name: string): void; measure(name: string, startMark?: string, endMark?: string): any; getEntries(): any[]; clearMarks(): void; };
}

// ── vm ────────────────────────────────────────────────────────────────────────
declare module "vm" {
  function runInNewContext(code: string, sandbox?: any, options?: any): any;
  function runInThisContext(code: string, options?: any): any;
  function createContext(sandbox?: any): any;
  class Script { constructor(code: string, options?: any); runInContext(context: any, options?: any): any; }
}

// ── string_decoder ────────────────────────────────────────────────────────────
declare module "string_decoder" {
  class StringDecoder {
    constructor(encoding?: BufferEncoding);
    write(buffer: Buffer): string;
    end(buffer?: Buffer): string;
  }
}

// ── worker_threads ────────────────────────────────────────────────────────────
declare module "worker_threads" {
  const isMainThread: boolean;
  const threadId: number;
  const workerData: any;
  const parentPort: any;
  class Worker { constructor(filename: string, options?: any); on(event: string, listener: (...args: any[]) => void): this; terminate(): Promise<number>; }
  class MessageChannel { port1: any; port2: any; }
}

// ── node: prefix aliases (e.g. import readline from "node:readline") ──────────
declare module "node:readline"      { export * from "readline"; }
declare module "node:fs"            { export * from "fs"; }
declare module "node:path"          { export * from "path"; }
declare module "node:os"            { export * from "os"; }
declare module "node:crypto"        { export * from "crypto"; }
declare module "node:events"        { export * from "events"; }
declare module "node:util"          { export * from "util"; }
declare module "node:assert"        { export * from "assert"; }
declare module "node:url"           { export * from "url"; }
declare module "node:querystring"   { export * from "querystring"; }
declare module "node:child_process" { export * from "child_process"; }
declare module "node:stream"        { export * from "stream"; }
declare module "node:http"          { export * from "http"; }
declare module "node:https"         { export * from "https"; }
declare module "node:net"           { export * from "net"; }
declare module "node:zlib"          { export * from "zlib"; }
declare module "node:buffer"        { export * from "buffer"; }
declare module "node:timers"        { export * from "timers"; }
declare module "node:perf_hooks"    { export * from "perf_hooks"; }
declare module "node:vm"            { export * from "vm"; }
declare module "node:string_decoder"{ export * from "string_decoder"; }
declare module "node:worker_threads"{ export * from "worker_threads"; }

// TypeScript helper namespace referenced by some declarations above
declare namespace NodeJS {
  type Platform = "aix" | "android" | "darwin" | "freebsd" | "haiku" | "linux" | "openbsd" | "sunos" | "win32" | "cygwin" | "netbsd";
  type ReadableStream = any;
  type WritableStream = any;
}
type BufferEncoding = "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "base64url" | "latin1" | "binary" | "hex";
`;

const monacoBeforeMount: BeforeMount = (monaco) => {
  monaco.languages.typescript.typescriptDefaults.addExtraLib(NODE_DEFS, "ts:node-builtins.d.ts");
  monaco.languages.typescript.javascriptDefaults.addExtraLib(NODE_DEFS, "ts:node-builtins.d.ts");
};

// ── Spinner ────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="w-3 h-3 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  );
}

// ── Output empty state ─────────────────────────────────────────────────────────

function OutputEmptyState({ label, status }: { label: string; status: RunStatus }) {
  const isActive = status === "queued" || status === "executing";
  return (
    <div className="h-full min-h-48 flex flex-col items-center justify-center p-8 select-none">
      {isActive ? (
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground-muted/40">
            {status}…
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground-muted/30">
            no output yet
          </p>
          <p className="font-mono text-[11px] text-foreground-muted/20">
            run your {label.toLowerCase()} code
          </p>
        </div>
      )}
    </div>
  );
}

// ── Status strip ───────────────────────────────────────────────────────────────

function StatusStrip({ result }: { result: RunResult }) {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (result.status === "rate_limited" && result.retryAfter) {
      setCountdown(result.retryAfter);
      const iv = setInterval(() => setCountdown((c) => {
        if (c === null || c <= 1) { clearInterval(iv); return null; }
        return c - 1;
      }), 1000);
      return () => clearInterval(iv);
    }
    setCountdown(null);
  }, [result.status, result.retryAfter]);

  if (result.status === "idle" || result.status === "queued" || result.status === "executing")
    return null;

  const variants: Record<string, { cls: string; icon: React.ReactNode; text: string }> = {
    success: {
      cls: "bg-status-ok-bg text-status-ok-text border-status-ok-border",
      icon: (
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
      text: `finished${result.time ? ` in ${(result.time / 1000).toFixed(2)}s` : ""}`,
    },
    runtime_error: {
      cls: "bg-status-err-bg text-status-err-text border-status-err-border",
      icon: <span className="text-[10px] shrink-0">✕</span>,
      text: `runtime error${result.exitCode != null ? ` · exit ${result.exitCode}` : ""}`,
    },
    compile_error: {
      cls: "bg-status-err-bg text-status-err-text border-status-err-border",
      icon: <span className="text-[10px] shrink-0">✕</span>,
      text: "compile error",
    },
    timeout: {
      cls: "bg-status-err-bg text-status-err-text border-status-err-border",
      icon: (
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: "timed out after 5s",
    },
    oom_killed: {
      cls: "bg-status-err-bg text-status-err-text border-status-err-border",
      icon: <span className="text-[10px] shrink-0">✕</span>,
      text: "memory limit exceeded",
    },
    rate_limited: {
      cls: "bg-status-warn-bg text-status-warn-text border-status-warn-border",
      icon: <span className="text-[10px] shrink-0">⚠</span>,
      text: `too many requests${countdown !== null ? ` — retry in ${countdown}s` : ""}`,
    },
    server_busy: {
      cls: "bg-status-warn-bg text-status-warn-text border-status-warn-border",
      icon: <span className="text-[10px] shrink-0">⚠</span>,
      text: "server busy — please try again shortly",
    },
  };

  const v = variants[result.status];
  if (!v) return null;

  return (
    <div className={cn("flex items-center gap-2 px-4 py-2.5 border", v.cls)}>
      {v.icon}
      <span className="font-mono text-[11px]">{v.text}</span>
    </div>
  );
}

// ── Output content ─────────────────────────────────────────────────────────────

function OutputContent({ result }: { result: RunResult }) {
  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";

  const showStdout = stdout.length > 0;
  const showStderr =
    (result.status === "runtime_error" || result.status === "compile_error") &&
    stderr.length > 0;

  if (!showStdout && !showStderr) {
    if (result.status === "success") {
      return (
        <div className="px-4 py-4">
          <p className="font-mono text-xs text-foreground-muted/40 italic">(no output)</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div>
      {showStdout && (
        <div>
          {showStderr && (
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-foreground-muted/40 px-4 pt-4 pb-1">
              stdout
            </p>
          )}
          <pre className="font-mono text-[12px] text-foreground leading-[1.6] px-4 py-4 overflow-x-auto whitespace-pre-wrap break-words">
            {stdout}
          </pre>
        </div>
      )}
      {showStderr && (
        <div className={showStdout ? "border-t border-border" : ""}>
          {/* STDERR box — label lives inside the box at the top */}
          <div className="mx-3 mr-4 my-3 border-l-2 border-status-err-border bg-status-err-bg/40">
            <div className="flex items-center gap-1.5 px-3 pt-2 pb-2 border-b border-status-err-border/40">
              <svg className="w-3 h-3 shrink-0 text-status-err-text opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-status-err-text/60">
                {result.status === "compile_error" ? "compile error" : "stderr"}
              </span>
            </div>
            <pre className="font-mono text-[12px] text-status-err-text leading-[1.6] px-3 pb-3 pt-1.5 overflow-x-auto whitespace-pre-wrap break-words">
              {stderr}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Panel header bar ───────────────────────────────────────────────────────────

function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 h-8 shrink-0 bg-surface-muted border-b border-border">
      {children}
    </div>
  );
}

// ── ExecutorTool ───────────────────────────────────────────────────────────────

export function ExecutorTool({
  monacoId,
  label,
  initialCode = "",
  initialStdin = "",
  toolbarLeading,
}: ExecutorToolProps) {
  const fullscreen = useToolFullscreen();
  const [code, setCode] = useState(initialCode);
  const [stdin, setStdin] = useState(initialStdin);
  const [stdinOpen, setStdinOpen] = useState(!!initialStdin);
  const [result, setResult] = useState<RunResult>({ status: "idle" });
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Monaco theme follows app theme
  const [monacoTheme, setMonacoTheme] = useState<"vs-dark" | "light">("vs-dark");
  useEffect(() => {
    const root = document.documentElement;
    const resolve = () => {
      if (root.classList.contains("light")) return "light" as const;
      if (root.classList.contains("dark")) return "vs-dark" as const;
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" as const : "vs-dark" as const;
    };
    setMonacoTheme(resolve());
    const observer = new MutationObserver(() => setMonacoTheme(resolve()));
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Resize state
  const [leftPct, setLeftPct] = useState(60);
  const [isDesktop, setIsDesktop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(75, Math.max(25, pct)));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

  useEffect(() => {
    setCode(initialCode);
    setStdin(initialStdin);
    setStdinOpen(!!initialStdin);
    setResult({ status: "idle" });
  }, [monacoId, initialCode, initialStdin]);

  // Auto-clear rate_limited status after the retryAfter countdown expires
  // so the Run button re-enables and the warning disappears automatically.
  useEffect(() => {
    if (result.status === "rate_limited" && result.retryAfter) {
      const timer = setTimeout(() => {
        setResult({ status: "idle" });
      }, result.retryAfter * 1000);
      return () => clearTimeout(timer);
    }
  }, [result.status, result.retryAfter]);

  const handleRun = useCallback(async () => {
    if (isRunning) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsRunning(true);
    setResult({ status: "queued" });

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monacoId, code, stdin, clientId: getClientId() }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) { setResult({ status: "server_busy" }); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as RunResult;
            setResult(event);
            if (event.status !== "idle" && event.status !== "queued" && event.status !== "executing")
              setIsRunning(false);
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") setResult({ status: "server_busy" });
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, monacoId, code, stdin]);

  const handleClear = () => {
    abortRef.current?.abort();
    setCode("");
    setStdin("");
    setResult({ status: "idle" });
    setIsRunning(false);
  };

  const isRateLimited = result.status === "rate_limited" && result.retryAfter !== undefined;
  const canRun = !isRunning && code.trim().length > 0 && !isRateLimited;

  const fileName = FILE_NAMES[monacoId] ?? `main.${monacoId}`;
  const langDot = LANG_DOTS[monacoId] ?? "#6b6b7a";

  const isOutputEmpty =
    result.status === "idle" ||
    result.status === "queued" ||
    result.status === "executing";

  return (
    <div className={cn("flex flex-col gap-3", fullscreen && "h-full")}>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <Toolbar>
        {toolbarLeading}
        <ToolbarButton
          icon={<Icons.Clear />}
          label="clear"
          onClick={handleClear}
          disabled={!code && !stdin && result.status === "idle"}
        />
        <ToolbarRight><FullscreenButton /></ToolbarRight>
      </Toolbar>

      {/* ── Workspace ───────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className={cn(
          "flex overflow-hidden border border-border",
          isDesktop ? "flex-row h-[520px]" : "flex-col",
          fullscreen && "flex-1 min-h-0 !h-auto"
        )}
      >

        {/* ── Left: editor panel ──────────────────────────────────────────── */}
        <div
          className={cn(
            "flex flex-col overflow-hidden",
            isDesktop ? "shrink-0 h-full" : "border-b border-border",
          )}
          style={{ width: isDesktop ? `${leftPct}%` : "100%" }}
        >
          {/* Tab header */}
          <PanelHeader>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: langDot }} />
            <span className="font-mono text-[11px] tracking-wide text-foreground-muted">
              {fileName}
            </span>
          </PanelHeader>

          {/* Monaco — fills all available height */}
          <div className={cn(
            "overflow-hidden",
            fullscreen ? "flex-1 min-h-0" : isDesktop ? "flex-1" : "h-[260px]"
          )}>
            <Editor
              language={monacoId}
              value={code}
              onChange={(v) => setCode(v ?? "")}
              theme={monacoTheme}
              beforeMount={monacoBeforeMount}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 2,
                automaticLayout: true,
                padding: { top: 10, bottom: 10 },
                renderLineHighlight: "line",
                fontLigatures: true,
              }}
            />
          </div>

          {/* Stdin — compact collapsible strip */}
          <div className="shrink-0 bg-surface-muted border-t border-border">
            <button
              type="button"
              onClick={() => setStdinOpen((o) => !o)}
              className="flex items-center gap-2 w-full px-3 h-8 transition-colors text-foreground-muted hover:text-foreground"
            >
              <svg
                className={cn("w-2.5 h-2.5 transition-transform shrink-0", stdinOpen && "rotate-90")}
                viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 4l4 4-4 4" />
              </svg>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]">stdin</span>
              {stdin && !stdinOpen && (
                <span className="font-mono text-[10px] ml-1 opacity-40 truncate max-w-24">
                  {stdin.split("\n")[0]}
                </span>
              )}
            </button>
            {stdinOpen && (
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="standard input, one value per line"
                rows={2}
                className="w-full px-3 py-2 font-mono text-[12px] resize-y focus:outline-none placeholder:opacity-25 bg-surface text-foreground border-t border-border"
              />
            )}
          </div>

          {/* Run button — matches actionBtnBase style */}
          <div className="shrink-0 p-2 bg-surface-muted border-t-2 border-border">
            <button
              type="button"
              title="run"
              onClick={handleRun}
              disabled={!canRun}
              className={cn(
                actionBtnBase,
                "flex items-center justify-center gap-2 group",
                canRun ? actionBtnEnabledCls : actionBtnDisabledCls
              )}
            >
              {isRunning ? (
                <><Spinner /><span>running</span></>
              ) : (
                <>
                  <span className={cn("transition-transform duration-150", canRun && "group-hover:scale-110")}>▶</span>
                  <span>run</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Drag handle (desktop only) ───────────────────────────────────── */}
        {isDesktop && (
          <div
            onMouseDown={startDrag}
            className="w-3 shrink-0 cursor-col-resize relative group flex items-center justify-center bg-surface-muted border-x border-border"
          >
            <div className="flex flex-col gap-[4px]">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-[3px] h-[3px] bg-primary opacity-40 group-hover:opacity-80 transition-opacity"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Right: output panel ──────────────────────────────────────────── */}
        <div
          className={cn(
            "flex flex-col min-w-0 overflow-hidden bg-surface",
            isDesktop ? "flex-1" : "min-h-[280px]"
          )}
        >
          {/* Output panel header */}
          <PanelHeader>
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300",
                result.status === "idle" && "bg-foreground-muted/20",
                (result.status === "queued" || result.status === "executing") && "bg-primary animate-pulse",
                result.status === "success" && "bg-status-ok-text",
                ["runtime_error", "compile_error", "timeout", "oom_killed"].includes(result.status) && "bg-status-err-text",
                ["rate_limited", "server_busy"].includes(result.status) && "bg-status-warn-text",
              )}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
              output
            </span>
            {result.status === "success" && result.time && (
              <span className="font-mono text-[10px] ml-auto text-status-ok-text opacity-70">
                {(result.time / 1000).toFixed(2)}s
              </span>
            )}
          </PanelHeader>

          {/* Status strip */}
          <StatusStrip result={result} />

          {/* Output content */}
          <div className={cn("flex-1 overflow-y-auto min-h-0", fullscreen && "min-h-0")}>
            {isOutputEmpty ? (
              <OutputEmptyState label={label} status={result.status} />
            ) : (
              <OutputContent result={result} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
