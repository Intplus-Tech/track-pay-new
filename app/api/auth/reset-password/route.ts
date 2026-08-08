import { NextRequest, NextResponse } from "next/server";
import { postBackendJson, readBackendBody } from "@/lib/backend";
import { validateCsrfRequest } from "@/lib/csrf";
import {
  AUTH_PASSWORD_RESET_COOKIE,
  decodeSessionValue,
  PendingPasswordResetSession,
} from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const clientIp = getClientIp(request);
  if (!rateLimit(`reset-password:${clientIp}`, 5, 60_000)) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | {
      newPassword?: string;
    }
    | null;

  if (!body?.newPassword) {
    return NextResponse.json(
      { message: "newPassword is required." },
      { status: 400 },
    );
  }

  const pendingReset = decodeSessionValue<PendingPasswordResetSession>(
    request.cookies.get(AUTH_PASSWORD_RESET_COOKIE)?.value,
  );

  if (!pendingReset?.authUserId || !pendingReset?.token) {
    return NextResponse.json(
      { message: "Password reset session not found or expired." },
      { status: 401 },
    );
  }

  try {
    const backendResponse = await postBackendJson(
      "/api/v1/auth/reset-password",
      {
        authUserId: pendingReset.authUserId,
        newPassword: body.newPassword,
        token: pendingReset.token,
      },
    );

    const payload = await readBackendBody(backendResponse);

    const response = NextResponse.json(payload ?? {}, {
      status: backendResponse.status,
    });

    // Always clear the reset cookie on terminal responses (success or
    // client-error like "token already used"). Only preserve it on
    // transient server errors so the user can retry.
    if (backendResponse.status < 500) {
      response.cookies.delete(AUTH_PASSWORD_RESET_COOKIE);
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the authentication service." },
      { status: 502 },
    );
  }
}

