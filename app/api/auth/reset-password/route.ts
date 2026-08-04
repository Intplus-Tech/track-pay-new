import { NextRequest, NextResponse } from "next/server";
import { postBackendJson, readBackendBody } from "@/lib/backend";
import { validateCsrfRequest } from "@/lib/csrf";
import {
  AUTH_PASSWORD_RESET_COOKIE,
  decodeSessionValue,
  PendingPasswordResetSession,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
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

    if (backendResponse.ok) {
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
