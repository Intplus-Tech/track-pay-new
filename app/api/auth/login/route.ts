import { NextRequest, NextResponse } from "next/server";
import { postBackendJson, readBackendBody } from "@/lib/backend";
import { validateCsrfRequest } from "@/lib/csrf";
import {
  clearAuthSession,
  LoginResponse,
  normalizeLoginSuccessPayload,
  sanitizeAuthPayloadForLogs,
  setAuthenticatedSession,
  setPendingAuthSession,
} from "@/lib/auth";
import { isObject } from "@/lib/type-guards";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

function hasStringProperty(
  value: Record<string, unknown>,
  propertyName: string,
): value is Record<string, unknown> & Record<string, string> {
  return typeof value[propertyName] === "string";
}

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const clientIp = getClientIp(request);
  if (!rateLimit(`login:${clientIp}`, 10, 60_000)) {
    return NextResponse.json(
      { message: "Too many login attempts. Please try again later." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | {
      email?: string;
      password?: string;
      rememberMe?: boolean;
    }
    | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await postBackendJson(
      "/api/v1/auth/login",
      {
        email: body.email,
        password: body.password,
      },
    );

    const payload = await readBackendBody<LoginResponse | { message?: string }>(
      backendResponse,
    );

    const safePayload = sanitizeAuthPayloadForLogs(payload);



    if (!backendResponse.ok) {
      return NextResponse.json(payload ?? { message: "Login failed." }, {
        status: backendResponse.status,
      });
    }

    if (isObject(payload) && "twoFactorRequired" in payload) {
      if (!hasStringProperty(payload, "authUserId")) {
        return NextResponse.json(
          { message: "Invalid two-factor response from the authentication service." },
          { status: 502 },
        );
      }

      const challengeResponse = NextResponse.json(
        {
          twoFactorRequired: true,
          message:
            hasStringProperty(payload, "message")
              ? payload.message
              : "Verification code required.",
        },
        { status: 200 },
      );

      setPendingAuthSession(challengeResponse, {
        authUserId: payload.authUserId,
        email: body.email,
      });
      return challengeResponse;
    }

    const normalizedSuccessPayload = normalizeLoginSuccessPayload(
      payload,
      body.email,
    );

    if (normalizedSuccessPayload) {
      const successResponse = NextResponse.json(
        { success: true, twoFactorRequired: false },
        { status: 200 },
      );

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


    return NextResponse.json(
      { message: "Unable to reach the authentication service." },
      { status: 502 },
    );
  }
}
