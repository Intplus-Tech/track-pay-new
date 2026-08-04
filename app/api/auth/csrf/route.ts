import { NextResponse } from "next/server";
import { generateCsrfToken, setCsrfCookie } from "@/lib/csrf";

export async function GET() {
  const csrfToken = generateCsrfToken();
  const response = NextResponse.json({ csrfToken }, { status: 200 });

  setCsrfCookie(response, csrfToken);

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-CSRF-Initialized", "1");

  return response;
}
