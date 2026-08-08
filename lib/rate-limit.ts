/**
 * Simple in-memory rate limiter for auth endpoints.
 *
 * NOTE: This works for single-instance deployments. For multi-instance
 * production setups, replace with a Redis-backed implementation.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const hitCounts = new Map<string, RateLimitEntry>();

// Periodically purge expired entries to prevent memory leaks.
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();

  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }

  lastCleanup = now;

  for (const [key, entry] of hitCounts) {
    if (now > entry.resetAt) {
      hitCounts.delete(key);
    }
  }
}

/**
 * Returns `true` if the request is allowed, `false` if rate-limited.
 *
 * @param key      Unique identifier for the limiter bucket (e.g. `login:<ip>`).
 * @param limit    Maximum number of requests allowed within the window.
 * @param windowMs Duration of the sliding window in milliseconds.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  cleanup();

  const now = Date.now();
  const entry = hitCounts.get(key);

  if (!entry || now > entry.resetAt) {
    hitCounts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Extract a best-effort client IP from the request.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}
