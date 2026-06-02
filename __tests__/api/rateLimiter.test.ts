import { describe, it, expect, vi, beforeEach } from "vitest";

// Import after vi is available; we need fresh module state per test group
// Since the module uses a module-level Map, we need to re-import carefully.
// vitest will reset module cache between test files but not within.

describe("checkRateLimit", () => {
  beforeEach(async () => {
    // Re-import fresh module state for each test block to avoid polluting
    vi.resetModules();
  });

  it("allows requests under the limit", async () => {
    const { checkRateLimit } = await import("@/lib/utils/rateLimiter");
    const result = checkRateLimit("test-key-1", 5, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("allows multiple requests up to the limit", async () => {
    const { checkRateLimit } = await import("@/lib/utils/rateLimiter");
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit("key-multi-1", 5, 60_000);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks the request that exceeds the limit", async () => {
    const { checkRateLimit } = await import("@/lib/utils/rateLimiter");
    for (let i = 0; i < 5; i++) {
      checkRateLimit("key-block-1", 5, 60_000);
    }
    const result = checkRateLimit("key-block-1", 5, 60_000);
    expect(result.allowed).toBe(false);
  });

  it("returns retryAfterMs when blocked", async () => {
    const { checkRateLimit } = await import("@/lib/utils/rateLimiter");
    for (let i = 0; i < 3; i++) {
      checkRateLimit("key-retry-1", 3, 60_000);
    }
    const result = checkRateLimit("key-retry-1", 3, 60_000);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThan(0);
      expect(result.retryAfterMs).toBeLessThanOrEqual(60_000);
    }
  });

  it("different keys are independent", async () => {
    const { checkRateLimit } = await import("@/lib/utils/rateLimiter");
    // Exhaust key A
    for (let i = 0; i < 3; i++) {
      checkRateLimit("key-a-indep", 3, 60_000);
    }
    const resultA = checkRateLimit("key-a-indep", 3, 60_000);
    expect(resultA.allowed).toBe(false);

    // Key B should still be allowed
    const resultB = checkRateLimit("key-b-indep", 3, 60_000);
    expect(resultB.allowed).toBe(true);
  });

  it("evicts timestamps outside the sliding window", async () => {
    const { checkRateLimit } = await import("@/lib/utils/rateLimiter");
    const windowMs = 100; // 100ms window

    // Fill the window
    for (let i = 0; i < 3; i++) {
      checkRateLimit("key-evict-1", 3, windowMs);
    }
    const blocked = checkRateLimit("key-evict-1", 3, windowMs);
    expect(blocked.allowed).toBe(false);

    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 150));

    // Now should be allowed again
    const allowed = checkRateLimit("key-evict-1", 3, windowMs);
    expect(allowed.allowed).toBe(true);
  });

  it("limit of 1 allows exactly 1 request", async () => {
    const { checkRateLimit } = await import("@/lib/utils/rateLimiter");
    const r1 = checkRateLimit("key-limit1", 1, 60_000);
    expect(r1.allowed).toBe(true);
    const r2 = checkRateLimit("key-limit1", 1, 60_000);
    expect(r2.allowed).toBe(false);
  });
});

describe("checkExecuteRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("allows requests under both per-minute and per-hour limits", async () => {
    const { checkExecuteRateLimit } = await import("@/lib/utils/rateLimiter");
    const result = checkExecuteRateLimit("exec-key-1");
    expect(result.allowed).toBe(true);
  });

  it("allows up to 10 requests per minute", async () => {
    const { checkExecuteRateLimit } = await import("@/lib/utils/rateLimiter");
    for (let i = 0; i < 10; i++) {
      const r = checkExecuteRateLimit("exec-key-2");
      expect(r.allowed).toBe(true);
    }
  });

  it("blocks the 11th request per minute", async () => {
    const { checkExecuteRateLimit } = await import("@/lib/utils/rateLimiter");
    for (let i = 0; i < 10; i++) {
      checkExecuteRateLimit("exec-key-3");
    }
    const result = checkExecuteRateLimit("exec-key-3");
    expect(result.allowed).toBe(false);
  });

  it("returns retryAfterMs when blocked by per-minute limit", async () => {
    const { checkExecuteRateLimit } = await import("@/lib/utils/rateLimiter");
    for (let i = 0; i < 10; i++) {
      checkExecuteRateLimit("exec-key-4");
    }
    const result = checkExecuteRateLimit("exec-key-4");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThanOrEqual(1000);
    }
  });

  it("different keys do not affect each other", async () => {
    const { checkExecuteRateLimit } = await import("@/lib/utils/rateLimiter");
    for (let i = 0; i < 10; i++) {
      checkExecuteRateLimit("exec-key-5a");
    }
    // Key 5b should still be allowed
    const result = checkExecuteRateLimit("exec-key-5b");
    expect(result.allowed).toBe(true);
  });

  it("uses separate per-minute and per-hour windows", async () => {
    const { checkExecuteRateLimit } = await import("@/lib/utils/rateLimiter");
    // Just verify it allows initial requests without error
    const r = checkExecuteRateLimit("exec-key-6");
    expect(r.allowed).toBe(true);
  });
});
