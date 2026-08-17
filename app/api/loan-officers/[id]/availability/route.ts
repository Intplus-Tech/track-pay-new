import { NextRequest, NextResponse } from "next/server";
import { patchBackendJson, readBackendBody } from "@/lib/backend";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";
import { validateCsrfRequest } from "@/lib/csrf";

function toErrorBody(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") return payload;
  if (typeof payload === "string" && payload.trim().length > 0)
    return { message: payload };
  return { message: fallback };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) return csrfError;

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body || !body.availabilityStatus) {
    return NextResponse.json(
      { message: "availabilityStatus is required." },
      { status: 400 },
    );
  }

  try {
    const { id } = await params;
    const accessToken = await getAccessTokenOrThrow();

    const response = await patchBackendJson(
      `/loan-officers/${id}/availability`,
      body,
      { headers: getAuthHeaders(accessToken) },
    );
    const responsePayload = await readBackendBody<unknown>(response);

    if (!response.ok) {
      return NextResponse.json(
        toErrorBody(responsePayload, "Unable to update officer availability."),
        { status: response.status },
      );
    }

    return NextResponse.json(responsePayload, { status: response.status });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Unable to update officer availability." },
      { status: 502 },
    );
  }
}
