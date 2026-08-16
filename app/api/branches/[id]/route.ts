import { NextRequest, NextResponse } from "next/server";
import {
  deleteBackend,
  getBackendJson,
  patchBackendJson,
  readBackendBody,
} from "@/lib/backend";
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

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const accessToken = await getAccessTokenOrThrow();
    const { id } = await context.params;
    const response = await getBackendJson(`/branches/${id}`, {
      headers: getAuthHeaders(accessToken),
    });
    const payload = await readBackendBody<unknown>(response);

    if (!response.ok) {
      return NextResponse.json(payload ?? { message: "Unable to load branch." }, {
        status: response.status,
      });
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({ message: "Unable to load branch." }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  try {
    const accessToken = await getAccessTokenOrThrow();
    const { id } = await context.params;
    const response = await patchBackendJson(`/branches/${id}`, body, {
      headers: getAuthHeaders(accessToken),
    });
    const payload = await readBackendBody<unknown>(response);

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({ message: "Unable to update branch." }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  try {
    const accessToken = await getAccessTokenOrThrow();
    const { id } = await context.params;
    const response = await deleteBackend(`/branches/${id}`, {
      headers: getAuthHeaders(accessToken),
    });
    const payload = await readBackendBody<unknown>(response);

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({ message: "Unable to delete branch." }, { status: 502 });
  }
}
