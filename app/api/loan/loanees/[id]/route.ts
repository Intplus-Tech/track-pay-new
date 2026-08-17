import { NextRequest, NextResponse } from "next/server";
import {
  getBackendJson,
  patchBackendJson,
  deleteBackend,
  readBackendBody,
} from "@/lib/backend";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";
import { validateCsrfRequest } from "@/lib/csrf";

function toErrorBody(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") return payload;
  if (typeof payload === "string" && payload.trim().length > 0)
    return { message: payload };
  return { message: fallback };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const accessToken = await getAccessTokenOrThrow();

    const response = await getBackendJson(`/loan/loanees/${id}`, {
      headers: getAuthHeaders(accessToken),
    });
    const payload = await readBackendBody<unknown>(response);

    if (!response.ok) {
      return NextResponse.json(
        toErrorBody(payload, "Unable to load loanee."),
        { status: response.status },
      );
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Unable to load loanee." },
      { status: 502 },
    );
  }
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

  if (!body) {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  try {
    const { id } = await params;
    const accessToken = await getAccessTokenOrThrow();

    const response = await patchBackendJson(`/loan/loanees/${id}`, body, {
      headers: getAuthHeaders(accessToken),
    });
    const responsePayload = await readBackendBody<unknown>(response);

    if (!response.ok) {
      return NextResponse.json(
        toErrorBody(responsePayload, "Unable to update loanee."),
        { status: response.status },
      );
    }

    return NextResponse.json(responsePayload, { status: response.status });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Unable to update loanee." },
      { status: 502 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) return csrfError;

  try {
    const { id } = await params;
    const accessToken = await getAccessTokenOrThrow();

    const response = await deleteBackend(`/loan/loanees/${id}`, {
      headers: getAuthHeaders(accessToken),
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const responsePayload = await readBackendBody<unknown>(response);

    if (!response.ok) {
      return NextResponse.json(
        toErrorBody(responsePayload, "Unable to delete loanee."),
        { status: response.status },
      );
    }

    return NextResponse.json(responsePayload, { status: response.status });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Unable to delete loanee." },
      { status: 502 },
    );
  }
}
