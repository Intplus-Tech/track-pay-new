import { NextRequest, NextResponse } from "next/server";
import { clearAuthSession } from "@/lib/auth";
import { validateCsrfRequest } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const response = NextResponse.json({ success: true }, { status: 200 });

  clearAuthSession(response);

  return response;
}
