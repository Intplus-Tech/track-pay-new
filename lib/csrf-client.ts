interface CsrfCache {
  token: string;
  cachedAt: number;
}

// Token cache with TTL — must expire before the server-side cookie (2 hours).
const CSRF_CACHE_TTL_MS = 90 * 60 * 1000; // 90 minutes
let csrfCache: CsrfCache | null = null;

interface CsrfResponse {
  csrfToken?: string;
}

async function fetchFreshCsrfToken(): Promise<string> {
  const response = await fetch("/api/auth/csrf", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to initialize request security.");
  }

  const payload = (await response.json().catch(() => null)) as CsrfResponse | null;

  if (!payload?.csrfToken) {
    throw new Error("Unable to initialize request security.");
  }

  csrfCache = { token: payload.csrfToken, cachedAt: Date.now() };

  return csrfCache.token;
}

export async function getCsrfToken() {
  if (csrfCache && Date.now() - csrfCache.cachedAt < CSRF_CACHE_TTL_MS) {
    return csrfCache.token;
  }

  return fetchFreshCsrfToken();
}

export function clearCsrfTokenCache() {
  csrfCache = null;
}

