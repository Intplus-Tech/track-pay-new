import { NextRequest, NextResponse } from "next/server";
import { getBackendJson, postBackendJson, readBackendBody } from "@/lib/backend";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";
import { validateCsrfRequest } from "@/lib/csrf";
import {
  buildUsersQuery,
  normalizePaginatedUsers,
  sanitizeCreateUserPayload,
} from "@/lib/rbac";

function toErrorBody(payload: unknown, fallbackMessage: string) {
  if (payload && typeof payload === "object") {
    return payload;
  }

  if (typeof payload === "string" && payload.trim().length > 0) {
    return { message: payload };
  }

  return { message: fallbackMessage };
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenOrThrow();
    const query = buildUsersQuery(request.nextUrl.searchParams);
    const requestPath = `/users${query}`;



    const response = await getBackendJson(`/users${query}`, {
      headers: getAuthHeaders(accessToken),
    });
    const payload = await readBackendBody<unknown>(response);





    if (!response.ok) {
      return NextResponse.json(toErrorBody(payload, "Unable to load users."), {
        status: response.status,
      });
    }

    return NextResponse.json(normalizePaginatedUsers(payload), { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Unable to load users." },
      { status: 502 },
    );
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

  const payload = sanitizeCreateUserPayload(body);

  if (!payload.firstName || !payload.lastName || !payload.email || !payload.password) {
    return NextResponse.json(
      { message: "First name, last name, email, and password are required." },
      { status: 400 },
    );
  }

  try {
    const accessToken = await getAccessTokenOrThrow();



    const response = await postBackendJson("/users", payload, {
      headers: getAuthHeaders(accessToken),
    });
    const responsePayload = await readBackendBody<unknown>(response);



    if (!response.ok) {
      return NextResponse.json(toErrorBody(responsePayload, "Unable to create user."), {
        status: response.status,
      });
    }

    return NextResponse.json(responsePayload, { status: response.status });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Unable to create user." },
      { status: 502 },
    );
  }
}