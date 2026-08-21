import { NextRequest, NextResponse } from "next/server";
import { postBackendJson, readBackendBody } from "@/lib/backend";
import { validateCsrfRequest } from "@/lib/csrf";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { AUTH_USER_COOKIE, decodeSessionValue, AuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const clientIp = getClientIp(request);
  if (!rateLimit(`enable-2fa:${clientIp}`, 10, 60_000)) {
    return NextResponse.json(
      { message: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const accessToken = await getAccessTokenOrThrow();
    
    // Attempt to get the authUserId from the session cookie
    const cookieStore = await cookies();
    const userCookie = cookieStore.get(AUTH_USER_COOKIE)?.value;
    const user = decodeSessionValue<AuthUser>(userCookie);

    if (!user || !user.id) {
       return NextResponse.json(
        { message: "User session not found." },
        { status: 401 },
      );
    }

    const backendResponse = await postBackendJson(
      "/api/v1/auth/enable-2fa",
      {
        authUserId: user.id,
      },
      {
        headers: getAuthHeaders(accessToken),
      }
    );

    const payload = await readBackendBody<{ twoFactorEnabled?: boolean; message?: string }>(
      backendResponse,
    );

    if (!backendResponse.ok) {
      return NextResponse.json(payload ?? { message: "Failed to enable 2FA." }, {
        status: backendResponse.status,
      });
    }

    const nextResponse = NextResponse.json(payload, { status: 200 });

    if (payload?.twoFactorEnabled !== undefined && user) {
      user.twoFactorEnabled = payload.twoFactorEnabled;
      
      const { encodeSessionValue } = await import("@/lib/auth");
      nextResponse.cookies.set(
        AUTH_USER_COOKIE,
        encodeSessionValue(user),
        {
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        }
      );
    }

    return nextResponse;
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
