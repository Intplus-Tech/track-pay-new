import { clearCsrfTokenCache, getCsrfToken } from "@/lib/csrf-client";

type RequestPayload = unknown;

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

function redirectToSignIn() {
  clearCsrfTokenCache();
  window.location.href = "/auth/sign-in";
}

async function sendMutation<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: RequestPayload,
) {
  const csrfToken = await getCsrfToken();

  return fetch(path, {
    method,
    cache: "no-store",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function queryJson<T>(path: string, fallbackMessage: string) {
  const response = await fetch(path, {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  const payload = await readPayload<T>(response);

  if (response.status === 401) {
    redirectToSignIn();
    throw new Error("Session expired.");
  }

  if (!response.ok) {
    throw new Error(extractMessage(payload, fallbackMessage));
  }

  return payload as T;
}

export async function submitJson<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  fallbackMessage: string,
  body?: RequestPayload,
) {
  const response = await sendMutation<T>(path, method, body);

  if (response.status === 204) {
    return null as T;
  }

  const payload = await readPayload<T>(response);

  if (response.status === 401) {
    redirectToSignIn();
    throw new Error("Session expired.");
  }

  if (response.status === 403) {
    clearCsrfTokenCache();
    const retryResponse = await sendMutation<T>(path, method, body);

    if (retryResponse.status === 204) {
      return null as T;
    }

    const retryPayload = await readPayload<T>(retryResponse);

    if (retryResponse.status === 401) {
      redirectToSignIn();
      throw new Error("Session expired.");
    }

    if (!retryResponse.ok) {
      throw new Error(extractMessage(retryPayload, fallbackMessage));
    }

    return retryPayload as T;
  }

  if (!response.ok) {
    console.error(`submitJson error [${method} ${path}]:`, payload);
    throw new Error(extractMessage(payload, fallbackMessage));
  }

  return payload as T;
}