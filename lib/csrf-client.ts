let csrfTokenCache: string | null = null;

interface CsrfResponse {
  csrfToken?: string;
}

export async function getCsrfToken() {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

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

  csrfTokenCache = payload.csrfToken;

  return csrfTokenCache;
}

export function clearCsrfTokenCache() {
  csrfTokenCache = null;
}
