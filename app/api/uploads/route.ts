import { NextRequest, NextResponse } from "next/server";
import { postBackendFormData, readBackendBody } from "@/lib/backend";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";
import { validateCsrfRequest } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const formData = await request.formData().catch(() => null);
  const purpose = request.nextUrl.searchParams.get("purpose")?.trim();

  if (!formData) {
    return NextResponse.json({ message: "Invalid upload payload." }, { status: 400 });
  }

  if (!purpose) {
    return NextResponse.json({ message: "Upload purpose is required." }, { status: 400 });
  }

  try {
    const accessToken = await getAccessTokenOrThrow();
    const response = await postBackendFormData(`/uploads?purpose=${encodeURIComponent(purpose)}`, formData, {
      headers: getAuthHeaders(accessToken),
    });
    const payload = await readBackendBody<unknown>(response);

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({ message: "Unable to upload file." }, { status: 502 });
  }
}
