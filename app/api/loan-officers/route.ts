import { NextRequest, NextResponse } from "next/server";
import {
  getBackendJson,
  postBackendJson,
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

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenOrThrow();
    const query = request.nextUrl.search;

    const response = await getBackendJson(`/loan-officers${query}`, {
      headers: getAuthHeaders(accessToken),
    });
    const payload = await readBackendBody<unknown>(response);

    if (!response.ok) {
      return NextResponse.json(
        toErrorBody(payload, "Unable to load loan officers."),
        { status: response.status },
      );
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Unable to load loan officers." },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
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

  const { firstName, lastName, email, password } = body;

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json(
      {
        message:
          "First name, last name, email, and password are required.",
      },
      { status: 400 },
    );
  }

  try {
    const accessToken = await getAccessTokenOrThrow();

    const response = await postBackendJson("/loan-officers", body, {
      headers: getAuthHeaders(accessToken),
    });
    const responsePayload = await readBackendBody<unknown>(response);

    if (!response.ok) {
      return NextResponse.json(
        toErrorBody(responsePayload, "Unable to create loan officer."),
        { status: response.status },
      );
    }

    return NextResponse.json(responsePayload, { status: response.status });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Unable to create loan officer." },
      { status: 502 },
    );
  }
}
