import { NextRequest, NextResponse } from "next/server";
import { getBackendJson, postBackendJson, readBackendBody } from "@/lib/backend";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";
import { validateCsrfRequest } from "@/lib/csrf";
import { normalizeBranch, sanitizeCreateBranchPayload } from "@/lib/rbac";

function isUnauthorizedError(error: unknown) {
  return error instanceof Error && error.message === "UNAUTHORIZED";
}

export async function GET() {
  try {
    const accessToken = await getAccessTokenOrThrow();
    const response = await getBackendJson("/branches", {
      headers: getAuthHeaders(accessToken),
    });
    const payload = await readBackendBody<unknown>(response);

    if (!response.ok) {
      return NextResponse.json(payload ?? { message: "Unable to load branches." }, {
        status: response.status,
      });
    }

    const branches = Array.isArray(payload)
      ? payload
        .filter((value): value is Record<string, unknown> =>
          typeof value === "object" && value !== null,
        )
        .map(normalizeBranch)
      : [];

    return NextResponse.json(branches, { status: 200 });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({ message: "Unable to load branches." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const payload = sanitizeCreateBranchPayload(body);

  if (!payload.name) {
    return NextResponse.json({ message: "Branch name is required." }, { status: 400 });
  }

  try {
    const accessToken = await getAccessTokenOrThrow();
    const response = await postBackendJson("/branches", payload, {
      headers: getAuthHeaders(accessToken),
    });
    const responsePayload = await readBackendBody<unknown>(response);

    return NextResponse.json(responsePayload, { status: response.status });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({ message: "Unable to create branch." }, { status: 502 });
  }
}