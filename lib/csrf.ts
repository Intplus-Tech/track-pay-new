import { randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const CSRF_COOKIE_NAME = "trackpay_csrf";

const CSRF_MAX_AGE_SECONDS = 60 * 60 * 2;

function csrfCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CSRF_MAX_AGE_SECONDS,
  };
}

export function generateCsrfToken() {
  return randomBytes(32).toString("hex");
}

export function setCsrfCookie(response: NextResponse, token: string) {
  response.cookies.set(CSRF_COOKIE_NAME, token, csrfCookieOptions());
}

function isAllowedFetchSite(fetchSite?: string | null) {
  if (!fetchSite) {
    return true;
  }

  return (
    fetchSite === "same-origin" ||
    fetchSite === "same-site" ||
    fetchSite === "none"
  );
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function issueCsrfToken(response: NextResponse) {
  const token = generateCsrfToken();

  setCsrfCookie(response, token);

  return token;
}

export function validateCsrfRequest(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ message: "Invalid request." }, { status: 403 });
  }

  const fetchSite = request.headers.get("sec-fetch-site");

  if (!isAllowedFetchSite(fetchSite)) {
    return NextResponse.json({ message: "Invalid request." }, { status: 403 });
  }

  const csrfHeaderToken = request.headers.get("x-csrf-token");
  const csrfCookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (!csrfHeaderToken || !csrfCookieToken) {
    return NextResponse.json({ message: "Invalid request." }, { status: 403 });
  }

  if (!safeEqual(csrfHeaderToken, csrfCookieToken)) {
    return NextResponse.json({ message: "Invalid request." }, { status: 403 });
  }

  return null;
}
