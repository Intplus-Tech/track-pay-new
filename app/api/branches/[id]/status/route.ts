import { NextRequest, NextResponse } from "next/server";
import { patchBackendJson, readBackendBody } from "@/lib/backend";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";
import { validateCsrfRequest } from "@/lib/csrf";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function isUnauthorizedError(error: unknown) {
  return error instanceof Error && error.message === "UNAUTHORIZED";
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body.status !== "string") {
    return NextResponse.json(
      { message: "Branch status is required." },
      { status: 400 },
    );
  }

  try {
    const accessToken = await getAccessTokenOrThrow();
    const { id } = await context.params;
    const response = await patchBackendJson(`/branches/${id}/status`, body, {
      headers: getAuthHeaders(accessToken),
    });
    const payload = await readBackendBody<unknown>(response);

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({ message: "Unable to update branch status." }, { status: 502 });
  }
}
