import { NextRequest, NextResponse } from "next/server";
import { postBackendJson, readBackendBody } from "@/lib/backend";
import { validateCsrfRequest } from "@/lib/csrf";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const clientIp = getClientIp(request);
  if (!rateLimit(`change-password:${clientIp}`, 10, 60_000)) {
    return NextResponse.json(
      { message: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | {
      currentPassword?: string;
      newPassword?: string;
    }
    | null;

  if (!body?.currentPassword || !body?.newPassword) {
    return NextResponse.json(
      { message: "Current password and new password are required." },
      { status: 400 },
    );
  }

  try {
    const accessToken = await getAccessTokenOrThrow();

    const backendResponse = await postBackendJson(
      "/api/v1/auth/change-password",
      {
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      },
      {
        headers: getAuthHeaders(accessToken),
      }
    );

    const payload = await readBackendBody<{ message?: string }>(
      backendResponse,
    );

    if (!backendResponse.ok) {
      return NextResponse.json(payload ?? { message: "Failed to change password." }, {
        status: backendResponse.status,
      });
    }

    return NextResponse.json(payload ?? { message: "Password updated successfully." }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Unable to reach the server." },
      { status: 502 },
    );
  }
}
