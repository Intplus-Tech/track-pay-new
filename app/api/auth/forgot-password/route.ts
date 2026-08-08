import { NextRequest, NextResponse } from "next/server";
import { postBackendJson, readBackendBody } from "@/lib/backend";
import { validateCsrfRequest } from "@/lib/csrf";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const clientIp = getClientIp(request);
  if (!rateLimit(`forgot-password:${clientIp}`, 3, 60_000)) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { email?: string }
    | null;

  if (!body?.email) {
    return NextResponse.json(
      { message: "Email is required." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await postBackendJson(
      "/api/v1/auth/forgot-password",
      {
        email: body.email,
      },
    );

    await readBackendBody(backendResponse);

    if (backendResponse.status >= 500) {
      return NextResponse.json(
        { message: "Unable to process request at this time." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        message:
          "If the email is registered, a password reset link has been sent.",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the authentication service." },
      { status: 502 },
    );
  }
}

