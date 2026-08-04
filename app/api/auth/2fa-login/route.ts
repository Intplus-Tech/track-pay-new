import { NextRequest, NextResponse } from "next/server";
import { postBackendJson, readBackendBody } from "@/lib/backend";
import { validateCsrfRequest } from "@/lib/csrf";
import {
  AUTH_PENDING_COOKIE,
  clearAuthSession,
  decodeSessionValue,
  LoginSuccessResponse,
  normalizeLoginSuccessPayload,
  PendingAuthSession,
  sanitizeAuthPayloadForLogs,
  setAuthenticatedSession,
} from "@/lib/auth";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const body = (await request.json().catch(() => null)) as
    | {
      token?: string;
      rememberMe?: boolean;
    }
    | null;

  if (!body?.token) {
    return NextResponse.json(
      { message: "token is required." },
      { status: 400 },
    );
  }

  const pendingSession = decodeSessionValue<PendingAuthSession>(
    request.cookies.get(AUTH_PENDING_COOKIE)?.value,
  );

  if (!pendingSession?.authUserId) {
    return NextResponse.json(
      { message: "Pending sign-in session not found or expired." },
      { status: 401 },
    );
  }

  try {
    const backendResponse = await postBackendJson(
      "/api/v1/auth/2fa-login",
      {
        authUserId: pendingSession.authUserId,
        token: body.token,
      },
    );

    const payload = await readBackendBody<LoginSuccessResponse | { message?: string }>(
      backendResponse,
    );

    const safePayload = sanitizeAuthPayloadForLogs(payload);

    console.info("[auth/2fa-login] backend response", {
      status: backendResponse.status,
      ok: backendResponse.ok,
      payload: safePayload,
    });

    if (!backendResponse.ok) {
      return NextResponse.json(payload ?? { message: "2FA login failed." }, {
        status: backendResponse.status,
      });
    }

    const normalizedSuccessPayload = normalizeLoginSuccessPayload(payload);

    if (normalizedSuccessPayload) {
      const successResponse = NextResponse.json(normalizedSuccessPayload, {
        status: 200,
      });

      setAuthenticatedSession(
        successResponse,
        normalizedSuccessPayload,
        Boolean(body.rememberMe),
      );

      return successResponse;
    }

    const unexpectedResponse = NextResponse.json(payload, { status: 200 });
    clearAuthSession(unexpectedResponse);
    return unexpectedResponse;

  } catch (error) {
    console.error("[auth/2fa-login] upstream request failed", {
      error,
    });

    return NextResponse.json(
      { message: "Unable to reach the authentication service." },
      { status: 502 },
    );
  }
}
