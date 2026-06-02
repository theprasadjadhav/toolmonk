import { NextRequest } from "next/server";
import { checkExecuteRateLimit } from "@/lib/utils/rateLimiter";
import { runnerExecute } from "@/lib/utils/runnerClient";
import { ALLOWED_RUNTIMES, LANGUAGE_BY_MONACO } from "@/lib/runners/languages";

export const runtime = "nodejs";

// Signal descriptions for common runtime signals.
// The runner encodes isolate exitsig as "SIG{N}" (e.g. "SIG8" for SIGFPE).
// "SIGKILL" (string) is emitted for isolate timeout (TO status).
//
// Note: on ARM64, GCC -O2 converts compile-time UB (e.g. integer division by
// zero with a constant divisor) into a trap instruction (brk #0), which raises
// SIGTRAP (5) rather than SIGFPE (8).  Both mean the same thing to the user.
const SIGNAL_DESCRIPTIONS: Record<string, string> = {
  SIG4:  "Illegal instruction (SIGILL) — invalid or undefined CPU instruction",
  SIG5:  "Trap: undefined behavior detected — likely division by zero or invalid operation (SIGTRAP)",
  SIG6:  "Aborted (SIGABRT) — the program called abort() or an assertion failed",
  SIG8:  "Floating point exception — division by zero or invalid arithmetic operation (SIGFPE)",
  SIG11: "Segmentation fault — invalid memory access or null pointer dereference (SIGSEGV)",
  SIG13: "Broken pipe (SIGPIPE)",
  SIG15: "Terminated (SIGTERM)",
};

// Global inflight counter to prevent queue saturation.
// Set to match per-pod runner box count (POOL_SIZE = 12).
// With 2 Next.js pods: 2 × 12 = 24 total inflight = 2 runner pods × 12 boxes.
let inflight = 0;
const MAX_INFLIGHT = 12;

// Max payload sizes (bytes)
const MAX_CODE_BYTES = 65_536;  // 64 KB
const MAX_STDIN_BYTES = 16_384; // 16 KB

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(sseEvent(data)));
      };

      try {
        // ── Parse body ──────────────────────────────────────────────────────────
        let body: {
          monacoId?: string;
          code?: string;
          stdin?: string;
          clientId?: string;
        };

        try {
          body = await req.json();
        } catch {
          send({ status: "error", message: "Invalid JSON body" });
          controller.close();
          return;
        }

        const { monacoId, code = "", stdin = "", clientId = "" } = body;

        // ── Validate payload ────────────────────────────────────────────────────
        if (!monacoId) {
          send({ status: "error", message: "Missing language" });
          controller.close();
          return;
        }

        const lang = LANGUAGE_BY_MONACO.get(monacoId);
        if (!lang || !ALLOWED_RUNTIMES.has(lang.runtime)) {
          send({ status: "error", message: "Unsupported language" });
          controller.close();
          return;
        }

        if (new TextEncoder().encode(code).length > MAX_CODE_BYTES) {
          send({ status: "error", message: "Code exceeds 64 KB limit" });
          controller.close();
          return;
        }

        if (new TextEncoder().encode(stdin).length > MAX_STDIN_BYTES) {
          send({ status: "error", message: "Stdin exceeds 16 KB limit" });
          controller.close();
          return;
        }

        // ── Rate limiting ───────────────────────────────────────────────────────
        const ip =
          req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
          req.headers.get("x-real-ip") ??
          "unknown";

        const ipResult = checkExecuteRateLimit(`ip:${ip}`);
        if (!ipResult.allowed) {
          send({
            status: "rate_limited",
            retryAfter: Math.ceil(ipResult.retryAfterMs / 1000),
          });
          controller.close();
          return;
        }

        if (clientId) {
          const clientResult = checkExecuteRateLimit(`client:${clientId}`);
          if (!clientResult.allowed) {
            send({
              status: "rate_limited",
              retryAfter: Math.ceil(clientResult.retryAfterMs / 1000),
            });
            controller.close();
            return;
          }
        }

        // ── Queue guard ─────────────────────────────────────────────────────────
        if (inflight >= MAX_INFLIGHT) {
          send({ status: "server_busy" });
          controller.close();
          return;
        }

        // ── Execute ─────────────────────────────────────────────────────────────
        inflight++;
        send({ status: "queued" });

        try {
          send({ status: "executing" });

          const start = Date.now();
          const result = await runnerExecute({
            language: lang.runtime,
            version: lang.version,
            code,
            fileExt: lang.fileExt,
            stdin,
          });

          const elapsed = Date.now() - start;

          // Killed by signal — distinguish the signal type:
          //   'SIGKILL'        = isolate timeout (TO status) — use elapsed to confirm
          //   'SIG9'           = cgroup OOM hard kill (SG + exitsig:9)
          //   'SIG8','SIG11',… = runtime signal (SIGFPE÷0, SIGSEGV, SIGABRT, …) → runtime_error
          if (result.killed) {
            const isKillOrOom =
              result.signal === "SIGKILL" || result.signal === "SIG9";

            if (!isKillOrOom) {
              // Runtime signal (SIGFPE, SIGSEGV, SIGABRT, etc.)
              const sigMsg =
                (result.signal && SIGNAL_DESCRIPTIONS[result.signal]) ??
                (result.signal ? `Killed by signal (${result.signal})` : "Process killed by signal");
              send({
                status: "runtime_error",
                stdout: result.stdout,
                stderr: result.stderr || sigMsg,
                exitCode: null,
              });
              controller.close();
              return;
            }

            // Hard kill: timeout (SIGKILL from isolate TO) or OOM (SIG9 from cgroup)
            if (elapsed >= 4_800) {
              send({ status: "timeout" });
            } else {
              send({ status: "oom_killed" });
            }
            controller.close();
            return;
          }

          // Compile step failed — show compile error regardless of run output.
          // compileFailed is set when the compile step ran and returned non-zero.
          // compileStderr combines compile.stdout + compile.stderr so tsc errors
          // (which go to stdout) are always included.
          if (result.compileFailed) {
            send({
              status: "compile_error",
              stderr: result.compileStderr ?? "",
            });
            controller.close();
            return;
          }

          // Non-zero exit code → runtime error
          if (result.exitCode !== 0 && result.exitCode !== null) {
            send({
              status: "runtime_error",
              stdout: result.stdout,
              stderr: result.stderr || result.compileStderr || "",
              exitCode: result.exitCode,
            });
            controller.close();
            return;
          }

          send({
            status: "success",
            stdout: result.stdout,
            stderr: result.stderr,
            time: elapsed,
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Execution failed";
          // Distinguish timeout from other errors
          if (msg.includes("timeout") || msg.includes("AbortError")) {
            send({ status: "timeout" });
          } else {
            send({ status: "server_busy" });
          }
        } finally {
          inflight--;
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
