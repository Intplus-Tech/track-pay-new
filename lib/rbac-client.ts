import { getCsrfToken, clearCsrfTokenCache } from "@/lib/csrf-client";

type RequestPayload = Record<string, unknown> | undefined;

function extractMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
}

async function readPayload<T>(response: Response) {
  return (await response.json().catch(() => null)) as T | null;
}

export async function fetchJson<T>(path: string, fallbackMessage: string) {
  const response = await fetch(path, {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  const payload = await readPayload<T>(response);

  if (response.status === 401) {
    clearCsrfTokenCache();
    window.location.href = "/auth/sign-in";
    throw new Error("Session expired.");
  }

  if (!response.ok) {
    throw new Error(extractMessage(payload, fallbackMessage));
  }

  return payload as T;
}

export async function mutateJson<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  fallbackMessage: string,
  body?: RequestPayload,
) {
  const csrfToken = await getCsrfToken();

  const response = await fetch(path, {
    method,
    cache: "no-store",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null as T;
  }

  const payload = await readPayload<T>(response);

  if (response.status === 401) {
    clearCsrfTokenCache();
    window.location.href = "/auth/sign-in";
    throw new Error("Session expired.");
  }

  // If CSRF validation failed, the cached token is likely stale.
  // Clear the cache and retry the request once with a fresh token.
  if (response.status === 403) {
    clearCsrfTokenCache();
    const freshCsrfToken = await getCsrfToken();

    const retryResponse = await fetch(path, {
      method,
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": freshCsrfToken,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (retryResponse.status === 204) {
      return null as T;
    }

    const retryPayload = await readPayload<T>(retryResponse);

    if (!retryResponse.ok) {
      throw new Error(extractMessage(retryPayload, fallbackMessage));
    }

    return retryPayload as T;
  }

  if (!response.ok) {
    throw new Error(extractMessage(payload, fallbackMessage));
  }

  return payload as T;
}