import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Module mocks (must be before importing the route) ─────────────────────────

vi.mock("@/lib/utils/rateLimiter", () => ({
  checkExecuteRateLimit: vi.fn().mockReturnValue({ allowed: true }),
}));

vi.mock("@/lib/utils/runnerClient", () => ({
  runnerExecute: vi.fn(),
}));

// ── Imports after mocks ────────────────────────────────────────────────────────

import { POST } from "@/app/api/execute/route";
import { checkExecuteRateLimit } from "@/lib/utils/rateLimiter";
import { runnerExecute } from "@/lib/utils/runnerClient";

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeRequest(
  body: object,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest("http://localhost/api/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

async function readSseEvents(response: Response): Promise<Record<string, unknown>[]> {
  const text = await response.text();
  return text
    .split("\n\n")
    .filter((chunk) => chunk.startsWith("data: "))
    .map((chunk) => JSON.parse(chunk.slice(6)));
}

function makeRunSuccess(stdout = "Hello", stderr = "", exitCode = 0) {
  return {
    stdout,
    stderr,
    exitCode,
    signal: null,
    killed: false,
  };
}

describe("POST /api/execute", () => {
  beforeEach(() => {
    vi.mocked(checkExecuteRateLimit).mockReturnValue({ allowed: true });
    vi.mocked(runnerExecute).mockResolvedValue(makeRunSuccess());
  });

  // ── Response headers ───────────────────────────────────────────────────────

  describe("response headers", () => {
    it("returns text/event-stream Content-Type", async () => {
      vi.mocked(runnerExecute).mockResolvedValue(makeRunSuccess());
      const res = await POST(makeRequest({ monacoId: "python", code: "print(1)" }));
      expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    });

    it("returns X-Accel-Buffering: no", async () => {
      const res = await POST(makeRequest({ monacoId: "python", code: "print(1)" }));
      expect(res.headers.get("X-Accel-Buffering")).toBe("no");
    });

    it("returns Cache-Control: no-cache, no-transform", async () => {
      const res = await POST(makeRequest({ monacoId: "python", code: "print(1)" }));
      expect(res.headers.get("Cache-Control")).toBe("no-cache, no-transform");
    });
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  describe("validation", () => {
    it("returns error event when monacoId is missing", async () => {
      const res = await POST(makeRequest({ code: "print(1)" }));
      const events = await readSseEvents(res);
      expect(events[0]).toMatchObject({ status: "error", message: expect.stringContaining("Missing") });
    });

    it("returns error event for unsupported language", async () => {
      const res = await POST(makeRequest({ monacoId: "cobol", code: "DISPLAY 'HELLO'." }));
      const events = await readSseEvents(res);
      expect(events[0]).toMatchObject({ status: "error", message: expect.stringContaining("Unsupported") });
    });

    it("returns error event when code exceeds 64 KB", async () => {
      const bigCode = "x".repeat(65_537);
      const res = await POST(makeRequest({ monacoId: "python", code: bigCode }));
      const events = await readSseEvents(res);
      expect(events[0]).toMatchObject({ status: "error", message: expect.stringContaining("64 KB") });
    });

    it("returns error event when stdin exceeds 16 KB", async () => {
      const bigStdin = "x".repeat(16_385);
      const res = await POST(makeRequest({ monacoId: "python", code: "print(1)", stdin: bigStdin }));
      const events = await readSseEvents(res);
      expect(events[0]).toMatchObject({ status: "error", message: expect.stringContaining("16 KB") });
    });

    it("returns error event for invalid JSON body", async () => {
      const req = new NextRequest("http://localhost/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not valid json {{{{",
      });
      const res = await POST(req);
      const events = await readSseEvents(res);
      expect(events[0]).toMatchObject({ status: "error" });
    });

    it("accepts code exactly at 64 KB limit", async () => {
      const code = "x".repeat(65_536);
      vi.mocked(runnerExecute).mockResolvedValue(makeRunSuccess());
      const res = await POST(makeRequest({ monacoId: "python", code }));
      const events = await readSseEvents(res);
      const statuses = events.map((e) => e.status);
      expect(statuses).toContain("success");
    });

    it("accepts all supported language monacoIds", async () => {
      const supportedMonacoIds = [
        "python", "javascript", "typescript", "java", "c", "cpp",
        "go", "shell", "ruby", "php", "sql",
      ];
      for (const monacoId of supportedMonacoIds) {
        vi.mocked(runnerExecute).mockResolvedValue(makeRunSuccess());
        const res = await POST(makeRequest({ monacoId, code: "hello" }));
        const events = await readSseEvents(res);
        const statuses = events.map((e) => e.status);
        expect(statuses, `${monacoId} should not return error`).not.toContain("error");
      }
    });
  });

  // ── Rate limiting ──────────────────────────────────────────────────────────

  describe("rate limiting", () => {
    it("emits rate_limited event when IP is rate limited", async () => {
      vi.mocked(checkExecuteRateLimit).mockReturnValueOnce({
        allowed: false,
        retryAfterMs: 30_000,
      });

      const res = await POST(
        makeRequest({ monacoId: "python", code: 'print("x")' }, {
          "x-forwarded-for": "1.2.3.4",
        })
      );
      const events = await readSseEvents(res);
      expect(events[0]).toMatchObject({ status: "rate_limited", retryAfter: 30 });
    });

    it("retryAfter is in seconds (ceil of ms/1000)", async () => {
      vi.mocked(checkExecuteRateLimit).mockReturnValueOnce({
        allowed: false,
        retryAfterMs: 45_500, // 45.5 s → ceil → 46 s
      });

      const res = await POST(makeRequest({ monacoId: "python", code: "x" }));
      const events = await readSseEvents(res);
      expect(events[0]).toMatchObject({ status: "rate_limited", retryAfter: 46 });
    });

    it("emits rate_limited when clientId is rate limited", async () => {
      vi.mocked(checkExecuteRateLimit)
        .mockReturnValueOnce({ allowed: true }) // IP passes
        .mockReturnValueOnce({ allowed: false, retryAfterMs: 60_000 }); // clientId fails

      const res = await POST(
        makeRequest({
          monacoId: "python",
          code: 'print("x")',
          clientId: "client-abc",
        })
      );
      const events = await readSseEvents(res);
      expect(events[0]).toMatchObject({ status: "rate_limited" });
    });

    it("uses x-forwarded-for header for IP key", async () => {
      vi.mocked(checkExecuteRateLimit).mockReturnValue({ allowed: true });
      const res = await POST(
        makeRequest({ monacoId: "python", code: "x" }, {
          "x-forwarded-for": "10.0.0.1, 10.0.0.2",
        })
      );
      await readSseEvents(res); // consume stream to let async start() complete
      // First call uses "ip:10.0.0.1" (first IP in x-forwarded-for)
      expect(vi.mocked(checkExecuteRateLimit).mock.calls[0][0]).toBe("ip:10.0.0.1");
    });

    it("uses x-real-ip when x-forwarded-for absent", async () => {
      vi.mocked(checkExecuteRateLimit).mockReturnValue({ allowed: true });
      const res = await POST(
        makeRequest({ monacoId: "python", code: "x" }, {
          "x-real-ip": "192.168.1.1",
        })
      );
      await readSseEvents(res);
      expect(vi.mocked(checkExecuteRateLimit).mock.calls[0][0]).toBe("ip:192.168.1.1");
    });

    it("uses 'unknown' IP when no IP headers present", async () => {
      vi.mocked(checkExecuteRateLimit).mockReturnValue({ allowed: true });
      const res = await POST(makeRequest({ monacoId: "python", code: "x" }));
      await readSseEvents(res);
      expect(vi.mocked(checkExecuteRateLimit).mock.calls[0][0]).toBe("ip:unknown");
    });

    it("skips clientId check when clientId is empty", async () => {
      vi.mocked(checkExecuteRateLimit).mockReturnValue({ allowed: true });
      const res = await POST(makeRequest({ monacoId: "python", code: "x", clientId: "" }));
      await readSseEvents(res);
      // Only called once (for IP), not twice (no clientId check)
      expect(vi.mocked(checkExecuteRateLimit)).toHaveBeenCalledTimes(1);
    });
  });

  // ── Success ────────────────────────────────────────────────────────────────

  describe("success execution", () => {
    it("emits queued and executing before success", async () => {
      vi.mocked(runnerExecute).mockResolvedValue(makeRunSuccess("Hello, World!"));
      const res = await POST(makeRequest({ monacoId: "python", code: 'print("Hello")' }));
      const events = await readSseEvents(res);
      const statuses = events.map((e) => e.status);
      expect(statuses).toContain("queued");
      expect(statuses).toContain("executing");
      expect(statuses).toContain("success");
    });

    it("includes stdout in success event", async () => {
      vi.mocked(runnerExecute).mockResolvedValue(makeRunSuccess("Hello, World!"));
      const res = await POST(makeRequest({ monacoId: "python", code: 'print("Hello")' }));
      const events = await readSseEvents(res);
      const successEvent = events.find((e) => e.status === "success");
      expect(successEvent?.stdout).toBe("Hello, World!");
    });

    it("includes time in success event", async () => {
      vi.mocked(runnerExecute).mockResolvedValue(makeRunSuccess());
      const res = await POST(makeRequest({ monacoId: "python", code: "pass" }));
      const events = await readSseEvents(res);
      const successEvent = events.find((e) => e.status === "success");
      expect(typeof successEvent?.time).toBe("number");
    });

    it("passes code to runnerExecute", async () => {
      vi.mocked(runnerExecute).mockResolvedValue(makeRunSuccess());
      const code = 'print("test code")';
      const res = await POST(makeRequest({ monacoId: "python", code }));
      await readSseEvents(res);
      expect(vi.mocked(runnerExecute)).toHaveBeenCalledWith(
        expect.objectContaining({ code })
      );
    });

    it("passes stdin to runnerExecute", async () => {
      vi.mocked(runnerExecute).mockResolvedValue(makeRunSuccess());
      const res = await POST(makeRequest({ monacoId: "python", code: "print(input())", stdin: "test-input" }));
      await readSseEvents(res);
      expect(vi.mocked(runnerExecute)).toHaveBeenCalledWith(
        expect.objectContaining({ stdin: "test-input" })
      );
    });

    it("uses correct runtime for go", async () => {
      vi.mocked(runnerExecute).mockResolvedValue(makeRunSuccess());
      const res = await POST(makeRequest({ monacoId: "go", code: "package main\nfunc main(){}" }));
      await readSseEvents(res);
      expect(vi.mocked(runnerExecute)).toHaveBeenCalledWith(
        expect.objectContaining({ language: "go" })
      );
    });

    it("uses sqlite3 runtime for sql monacoId", async () => {
      vi.mocked(runnerExecute).mockResolvedValue(makeRunSuccess());
      const res = await POST(makeRequest({ monacoId: "sql", code: "SELECT 1;" }));
      await readSseEvents(res);
      expect(vi.mocked(runnerExecute)).toHaveBeenCalledWith(
        expect.objectContaining({ language: "sqlite3" })
      );
    });

    it("uses bash runtime for shell monacoId", async () => {
      vi.mocked(runnerExecute).mockResolvedValue(makeRunSuccess());
      const res = await POST(makeRequest({ monacoId: "shell", code: "echo hello" }));
      await readSseEvents(res);
      expect(vi.mocked(runnerExecute)).toHaveBeenCalledWith(
        expect.objectContaining({ language: "bash" })
      );
    });
  });

  // ── Runtime error ──────────────────────────────────────────────────────────

  describe("runtime error", () => {
    it("emits runtime_error for non-zero exit code", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "",
        stderr: "NameError: name 'x' is not defined",
        exitCode: 1,
        signal: null,
        killed: false,
        compileStderr: "",
      });

      const res = await POST(makeRequest({ monacoId: "python", code: "print(x)" }));
      const events = await readSseEvents(res);
      expect(events.some((e) => e.status === "runtime_error")).toBe(true);
    });

    it("includes exitCode in runtime_error event", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "", stderr: "Error", exitCode: 2, signal: null, killed: false, compileStderr: "",
      });

      const res = await POST(makeRequest({ monacoId: "python", code: "bad()" }));
      const events = await readSseEvents(res);
      const errEvent = events.find((e) => e.status === "runtime_error");
      expect(errEvent?.exitCode).toBe(2);
    });

    it("includes stderr in runtime_error event", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "", stderr: "Traceback: error", exitCode: 1, signal: null, killed: false, compileStderr: "",
      });

      const res = await POST(makeRequest({ monacoId: "python", code: "bad()" }));
      const events = await readSseEvents(res);
      const errEvent = events.find((e) => e.status === "runtime_error");
      expect(errEvent?.stderr).toBe("Traceback: error");
    });

    it("includes stdout in runtime_error when partial output exists", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "partial output", stderr: "then error", exitCode: 1,
        signal: null, killed: false, compileStderr: "",
      });

      const res = await POST(makeRequest({ monacoId: "python", code: "print('x'); raise Exception()" }));
      const events = await readSseEvents(res);
      const errEvent = events.find((e) => e.status === "runtime_error");
      expect(errEvent?.stdout).toBe("partial output");
    });
  });

  // ── Compile error ──────────────────────────────────────────────────────────

  describe("compile error", () => {
    it("emits compile_error when compileFailed is true", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "", stderr: "", exitCode: null,
        signal: null, killed: false,
        compileStderr: "Main.java:3: error: expected ';'",
        compileFailed: true,
      });

      const res = await POST(makeRequest({ monacoId: "java", code: "bad java" }));
      const events = await readSseEvents(res);
      expect(events.some((e) => e.status === "compile_error")).toBe(true);
    });

    it("includes compileStderr in compile_error event", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "", stderr: "", exitCode: null,
        signal: null, killed: false,
        compileStderr: "error: syntax error",
        compileFailed: true,
      });

      const res = await POST(makeRequest({ monacoId: "java", code: "bad" }));
      const events = await readSseEvents(res);
      const errEvent = events.find((e) => e.status === "compile_error");
      expect(errEvent?.stderr).toBe("error: syntax error");
    });

    it("emits compile_error for TypeScript (tsc writes errors to stdout, not stderr)", async () => {
      // tsc stdout is combined into compileStderr by runnerClient
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "", stderr: "", exitCode: null,
        signal: null, killed: false,
        compileStderr: "main.ts:6:18 - error TS2304: Cannot find name 'Perso'.",
        compileFailed: true,
      });

      const res = await POST(makeRequest({ monacoId: "typescript", code: "const x: Perso = 1;" }));
      const events = await readSseEvents(res);
      const errEvent = events.find((e) => e.status === "compile_error");
      expect(errEvent).toBeDefined();
      expect(errEvent?.stderr).toContain("error TS2304");
    });

    it("does NOT emit compile_error when compileFailed is false even with compileStderr", async () => {
      // Compiler warnings produce compileStderr but compileFailed stays false
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "hello", stderr: "", exitCode: 0,
        signal: null, killed: false,
        compileStderr: "warning: unused variable",
        compileFailed: false,
      });

      const res = await POST(makeRequest({ monacoId: "java", code: "good java" }));
      const events = await readSseEvents(res);
      expect(events.some((e) => e.status === "compile_error")).toBe(false);
      expect(events.some((e) => e.status === "success")).toBe(true);
    });
  });

  // ── Timeout ────────────────────────────────────────────────────────────────

  describe("timeout", () => {
    it("emits timeout when process is killed and elapsed >= 4800ms", async () => {
      vi.mocked(runnerExecute).mockImplementation(async () => {
        // Simulate 5s delay
        await new Promise((r) => setTimeout(r, 5));
        return {
          stdout: "", stderr: "", exitCode: null,
          signal: "SIGKILL", killed: true, compileStderr: "",
        };
      });

      // Mock Date.now to simulate 5s elapsed
      const realDateNow = Date.now;
      let callCount = 0;
      vi.spyOn(Date, "now").mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 0 : 5000; // start=0, end=5000
      });

      const res = await POST(makeRequest({ monacoId: "python", code: "while True: pass" }));
      const events = await readSseEvents(res);
      expect(events.some((e) => e.status === "timeout")).toBe(true);

      vi.spyOn(Date, "now").mockRestore();
    });

    it("emits oom_killed when process killed by SIGKILL with elapsed < 4800ms", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "", stderr: "", exitCode: null,
        signal: "SIGKILL", killed: true, compileStderr: "",
      });

      // Mock Date.now to simulate very short elapsed
      let callCount = 0;
      vi.spyOn(Date, "now").mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 0 : 100; // start=0, end=100ms
      });

      const res = await POST(makeRequest({ monacoId: "python", code: "x=[0]*10**9" }));
      const events = await readSseEvents(res);
      expect(events.some((e) => e.status === "oom_killed")).toBe(true);

      vi.spyOn(Date, "now").mockRestore();
    });

    it("emits timeout when runnerExecute throws timeout error", async () => {
      vi.mocked(runnerExecute).mockRejectedValue(new Error("AbortError: timeout"));

      const res = await POST(makeRequest({ monacoId: "python", code: "bad" }));
      const events = await readSseEvents(res);
      expect(events.some((e) => e.status === "timeout")).toBe(true);
    });

    it("emits server_busy for non-timeout execution errors", async () => {
      vi.mocked(runnerExecute).mockRejectedValue(new Error("Connection refused"));

      const res = await POST(makeRequest({ monacoId: "python", code: "print(1)" }));
      const events = await readSseEvents(res);
      expect(events.some((e) => e.status === "server_busy")).toBe(true);
    });

    it("emits oom_killed when SIG9 (cgroup OOM kill) with elapsed < 4800ms", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "", stderr: "", exitCode: null,
        signal: "SIG9", killed: true, compileStderr: "",
      });

      let callCount = 0;
      vi.spyOn(Date, "now").mockImplementation(() => { callCount++; return callCount === 1 ? 0 : 100; });

      const res = await POST(makeRequest({ monacoId: "c", code: "int main(){}" }));
      const events = await readSseEvents(res);
      expect(events.some((e) => e.status === "oom_killed")).toBe(true);

      vi.spyOn(Date, "now").mockRestore();
    });
  });

  // ── Signal runtime errors ──────────────────────────────────────────────────

  describe("signal runtime errors", () => {
    it("emits runtime_error (not oom_killed) for SIGFPE (division by zero)", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "", stderr: "", exitCode: null,
        signal: "SIG8", killed: true, compileStderr: "",
      });

      const res = await POST(makeRequest({ monacoId: "c", code: "int main(){int x=1/0;}" }));
      const events = await readSseEvents(res);
      expect(events.some((e) => e.status === "runtime_error")).toBe(true);
      expect(events.some((e) => e.status === "oom_killed")).toBe(false);
    });

    it("SIGFPE runtime_error includes SIGFPE description in stderr", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "", stderr: "", exitCode: null,
        signal: "SIG8", killed: true, compileStderr: "",
      });

      const res = await POST(makeRequest({ monacoId: "c", code: "int main(){int x=1/0;}" }));
      const events = await readSseEvents(res);
      const errEvent = events.find((e) => e.status === "runtime_error");
      expect((errEvent?.stderr as string)).toMatch(/SIGFPE/);
    });

    it("emits runtime_error (not oom_killed) for SIGSEGV (segfault)", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "", stderr: "", exitCode: null,
        signal: "SIG11", killed: true, compileStderr: "",
      });

      const res = await POST(makeRequest({ monacoId: "c", code: "int main(){int*p=0;*p=1;}" }));
      const events = await readSseEvents(res);
      expect(events.some((e) => e.status === "runtime_error")).toBe(true);
      expect(events.some((e) => e.status === "oom_killed")).toBe(false);
    });

    it("emits runtime_error for SIG5 (SIGTRAP — ARM64 UB trap for division by zero)", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "", stderr: "", exitCode: null,
        signal: "SIG5", killed: true, compileStderr: "",
      });

      const res = await POST(makeRequest({ monacoId: "c", code: "int main(){int x=1/0;}" }));
      const events = await readSseEvents(res);
      const errEvent = events.find((e) => e.status === "runtime_error");
      expect(errEvent).toBeDefined();
      expect((errEvent?.stderr as string)).toMatch(/SIGTRAP|division by zero/);
    });

    it("emits runtime_error for unknown signal with fallback message", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "", stderr: "", exitCode: null,
        signal: "SIG99", killed: true, compileStderr: "",
      });

      const res = await POST(makeRequest({ monacoId: "c", code: "bad" }));
      const events = await readSseEvents(res);
      const errEvent = events.find((e) => e.status === "runtime_error");
      expect(errEvent).toBeDefined();
      expect((errEvent?.stderr as string)).toMatch(/SIG99/);
    });
  });

  // ── Success with zero exit code ────────────────────────────────────────────

  describe("edge cases", () => {
    it("exit code 0 with stderr is still success (warnings)", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "output", stderr: "warning: something", exitCode: 0,
        signal: null, killed: false, compileStderr: "",
      });

      const res = await POST(makeRequest({ monacoId: "python", code: "print(1)" }));
      const events = await readSseEvents(res);
      expect(events.some((e) => e.status === "success")).toBe(true);
    });

    it("success event includes stderr (warnings)", async () => {
      vi.mocked(runnerExecute).mockResolvedValue({
        stdout: "out", stderr: "warn", exitCode: 0,
        signal: null, killed: false, compileStderr: "",
      });

      const res = await POST(makeRequest({ monacoId: "python", code: "print(1)" }));
      const events = await readSseEvents(res);
      const successEvent = events.find((e) => e.status === "success");
      expect(successEvent?.stderr).toBe("warn");
    });

    it("handles missing stdin (defaults to empty string)", async () => {
      vi.mocked(runnerExecute).mockResolvedValue(makeRunSuccess());
      const res = await POST(makeRequest({ monacoId: "python", code: "print(1)" }));
      await readSseEvents(res);
      expect(vi.mocked(runnerExecute)).toHaveBeenCalledWith(
        expect.objectContaining({ stdin: "" })
      );
    });
  });
});
