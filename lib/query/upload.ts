import { getCsrfToken } from "@/lib/csrf-client";

interface UploadResponse {
  _id?: string;
  id?: string;
  url?: string;
  message?: string;
}

function extractMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
}

export async function uploadUserAvatar(file: File) {
  const csrfToken = await getCsrfToken();
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/uploads?purpose=USER_AVATAR", {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    body,
  });

  const payload = (await response.json().catch(() => null)) as UploadResponse | null;

  if (!response.ok) {
    throw new Error(extractMessage(payload, "Unable to upload photo."));
  }

  const uploadId = payload?.id ?? payload?._id;

  if (!uploadId) {
    throw new Error("Upload completed but no upload id was returned.");
  }

  return {
    uploadId,
    url: payload?.url ?? null,
  };
}
