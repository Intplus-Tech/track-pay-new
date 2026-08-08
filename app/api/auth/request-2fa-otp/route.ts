import { NextRequest, NextResponse } from "next/server";
import { postBackendJson, readBackendBody } from "@/lib/backend";
import { validateCsrfRequest } from "@/lib/csrf";
import {
  AUTH_PENDING_COOKIE,
  decodeSessionValue,
  PendingAuthSession,
} from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const clientIp = getClientIp(request);
  if (!rateLimit(`request-2fa-otp:${clientIp}`, 3, 60_000)) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 },
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
      "/api/v1/auth/request-2fa-otp",
      {
        authUserId: pendingSession.authUserId,
      },
    );

    const payload = await readBackendBody(backendResponse);

    return NextResponse.json(payload ?? {}, {
      status: backendResponse.status,
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the authentication service." },
      { status: 502 },
    );
  }
}

