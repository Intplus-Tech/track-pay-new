import { NextRequest, NextResponse } from "next/server";
import { getBackendJson, readBackendBody } from "@/lib/backend";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";

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

    const response = await getBackendJson(`/loan-officers/${id}/snapshot`, {
      headers: getAuthHeaders(accessToken),
    });
    const payload = await readBackendBody<unknown>(response);

    if (!response.ok) {
      return NextResponse.json(
        toErrorBody(payload, "Unable to load officer snapshot."),
        { status: response.status },
      );
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Unable to load officer snapshot." },
      { status: 502 },
    );
  }
}
