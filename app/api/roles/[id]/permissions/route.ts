import { NextRequest, NextResponse } from "next/server";
import { postBackendJson, readBackendBody } from "@/lib/backend";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";
import { validateCsrfRequest } from "@/lib/csrf";
import { sanitizeAssignPermissionsPayload } from "@/lib/rbac";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const payload = sanitizeAssignPermissionsPayload(body);

  try {
    const accessToken = await getAccessTokenOrThrow();
    const { id } = await context.params;
    const response = await postBackendJson(`/users/roles/${id}/permissions`, payload, {
      headers: getAuthHeaders(accessToken),
    });
    const responsePayload = await readBackendBody<unknown>(response);

    return NextResponse.json(responsePayload, { status: response.status });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Unable to assign permissions." },
      { status: 502 },
    );
  }
}