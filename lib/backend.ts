const DEFAULT_API_VERSION_PREFIX = "/api/v1";

export function getBackendBaseUrl() {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL;

  if (!rawBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  return rawBaseUrl.replace(/\/$/, "");
}

function buildJsonHeaders(init?: RequestInit) {
  return {
    "Content-Type": "application/json",
    ...(init?.headers ?? {}),
  };
}

function buildBackendUrl(path: string) {
  return `${getBackendBaseUrl()}${path.startsWith(DEFAULT_API_VERSION_PREFIX) ? path : `${DEFAULT_API_VERSION_PREFIX}${path}`}`;
}

export async function getBackendJson(path: string, init?: RequestInit) {
  return fetch(buildBackendUrl(path), {
    method: "GET",
    cache: "no-store",
    ...init,
    headers: init?.headers ?? {},
  });
}

export async function postBackendJson(
  path: string,
  body: unknown,
  init?: RequestInit,
) {
  const requestInit: RequestInit = {
    ...init,
    method: "POST",
    cache: "no-store",
    headers: buildJsonHeaders(init),
    body: JSON.stringify(body),
  };

  return fetch(buildBackendUrl(path), requestInit);
}

export async function putBackendJson(
  path: string,
  body: unknown,
  init?: RequestInit,
) {
  const requestInit: RequestInit = {
    ...init,
    method: "PUT",
    cache: "no-store",
    headers: buildJsonHeaders(init),
    body: JSON.stringify(body),
  };

  return fetch(buildBackendUrl(path), requestInit);
}

export async function patchBackendJson(
  path: string,
  body: unknown,
  init?: RequestInit,
) {
  const requestInit: RequestInit = {
    ...init,
    method: "PATCH",
    cache: "no-store",
    headers: buildJsonHeaders(init),
    body: JSON.stringify(body),
  };

  return fetch(buildBackendUrl(path), requestInit);
}

export async function deleteBackend(path: string, init?: RequestInit) {
  return fetch(buildBackendUrl(path), {
    method: "DELETE",
    cache: "no-store",
    ...init,
    headers: init?.headers ?? {},
  });
}

export async function readBackendBody<T>(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}
