import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_ACCESS_TOKEN_COOKIE,
  AUTH_PASSWORD_RESET_COOKIE,
  AUTH_USER_COOKIE,
  AUTH_PENDING_COOKIE,
  decodeJwtClaims,
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

  const accessToken = request.cookies.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;

  if (accessToken) {
    const claims = decodeJwtClaims(accessToken);
    const now = Math.floor(Date.now() / 1000);

    if (claims?.exp && claims.exp < now) {
      // JWT has expired — clear auth cookies and redirect to sign-in
      const expiredResponse = NextResponse.redirect(
        new URL("/auth/sign-in", request.url),
      );
      expiredResponse.cookies.delete(AUTH_ACCESS_TOKEN_COOKIE);
      expiredResponse.cookies.delete(AUTH_USER_COOKIE);
      expiredResponse.cookies.delete(AUTH_PENDING_COOKIE);
      return expiredResponse;
    }

    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/auth/sign-in", request.url));
}

export const config = {
  matcher: ["/home/:path*", "/auth/sign-in/reset-password"],
};
