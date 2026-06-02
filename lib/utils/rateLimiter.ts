/**
 * Sliding-window rate limiter.
 * Stores timestamps of recent requests in an in-memory Map.
 * Two separate limiters run concurrently: per-minute and per-hour.
 */

interface Window {
  timestamps: number[];
}

const store = new Map<string, Window>();

/**
 * Check whether a request is allowed under the given limit.
 *
 * @param key      Unique key (e.g. IP address or client UUID)
 * @param limit    Maximum number of requests allowed in `windowMs`
 * @param windowMs Sliding window duration in milliseconds
 * @returns `{ allowed: true }` or `{ allowed: false, retryAfterMs: number }`
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const cutoff = now - windowMs;

  let window = store.get(key);
  if (!window) {
    window = { timestamps: [] };
    store.set(key, window);
  }

  // Evict timestamps outside the window
  window.timestamps = window.timestamps.filter((t) => t > cutoff);

  if (window.timestamps.length >= limit) {
    // Earliest timestamp in the window + windowMs = when the oldest slot frees up
    const retryAfterMs = window.timestamps[0] + windowMs - now;
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) };
  }

  window.timestamps.push(now);
  return { allowed: true };
}

/**
 * Enforce both per-minute and per-hour limits for a single key.
 *
 * Per-minute: 10 requests / 60 s
 * Per-hour:   50 requests / 60 min
 *
 * Returns the most restrictive failing result, or `{ allowed: true }`.
 */
export function checkExecuteRateLimit(key: string):
  | { allowed: true }
  | { allowed: false; retryAfterMs: number } {
  const perMin = checkRateLimit(`${key}:min`, 10, 60_000);
  if (!perMin.allowed) return perMin;

  const perHour = checkRateLimit(`${key}:hour`, 50, 3_600_000);
  if (!perHour.allowed) return perHour;

  return { allowed: true };
}

// Periodically clean up keys with no recent activity (every 10 minutes).
// Filter out expired timestamps first, then delete keys with nothing left.
setInterval(() => {
  const now = Date.now();
  for (const [key, window] of store.entries()) {
    window.timestamps = window.timestamps.filter((t) => now - t <= 3_600_000);
    if (window.timestamps.length === 0) {
      store.delete(key);
    }
  }
}, 600_000);
