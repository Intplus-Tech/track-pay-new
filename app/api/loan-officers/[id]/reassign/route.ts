import { NextRequest, NextResponse } from "next/server";
import { postBackendJson, readBackendBody } from "@/lib/backend";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";
import { validateCsrfRequest } from "@/lib/csrf";

function toErrorBody(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") return payload;
  if (typeof payload === "string" && payload.trim().length > 0)
    return { message: payload };
  return { message: fallback };
}

export async function POST(
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

  const { targetOfficerId, portfolioIds } = body;

  if (
    !targetOfficerId ||
    !Array.isArray(portfolioIds) ||
    portfolioIds.length === 0
  ) {
    return NextResponse.json(
      {
        message:
          "targetOfficerId and at least one portfolioId are required.",
      },
      { status: 400 },
    );
  }

  try {
    const { id } = await params;
    const accessToken = await getAccessTokenOrThrow();

    const response = await postBackendJson(
      `/loan-officers/${id}/reassign`,
      body,
      { headers: getAuthHeaders(accessToken) },
    );
    const responsePayload = await readBackendBody<unknown>(response);

    if (!response.ok) {
      return NextResponse.json(
        toErrorBody(responsePayload, "Unable to reassign loans."),
        { status: response.status },
      );
    }

    return NextResponse.json(responsePayload, { status: response.status });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Unable to reassign loans." },
      { status: 502 },
    );
  }
}
