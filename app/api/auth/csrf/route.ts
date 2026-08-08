import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken, setCsrfCookie } from "@/lib/csrf";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  if (!rateLimit(`csrf:${clientIp}`, 30, 60_000)) {
    return NextResponse.json(
      { message: "Too many requests." },
      { status: 429 },
    );
  }

  const csrfToken = generateCsrfToken();
  const response = NextResponse.json({ csrfToken }, { status: 200 });

  setCsrfCookie(response, csrfToken);

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-CSRF-Initialized", "1");

  return response;
}

