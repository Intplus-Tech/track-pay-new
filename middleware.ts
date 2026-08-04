import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_ACCESS_TOKEN_COOKIE,
  AUTH_PASSWORD_RESET_COOKIE,
} from "@/lib/auth";

const TEN_MINUTES_IN_SECONDS = 60 * 10;

function encodeSessionValue(value: unknown) {
  return encodeURIComponent(JSON.stringify(value));
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/auth/sign-in/reset-password") {
    const authUserId = request.nextUrl.searchParams.get("authUserId");
    const token = request.nextUrl.searchParams.get("token");

    if (authUserId && token) {
      const sanitizedUrl = request.nextUrl.clone();
      sanitizedUrl.search = "";

      const response = NextResponse.redirect(sanitizedUrl);

      response.cookies.set(
        AUTH_PASSWORD_RESET_COOKIE,
        encodeSessionValue({ authUserId, token }),
        {
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: TEN_MINUTES_IN_SECONDS,
        },
      );

      return response;
    }
  }

  const hasAccessToken = request.cookies.has(AUTH_ACCESS_TOKEN_COOKIE);

  if (hasAccessToken) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/auth/sign-in", request.url));
}

export const config = {
  matcher: ["/home/:path*", "/auth/sign-in/reset-password"],
};
