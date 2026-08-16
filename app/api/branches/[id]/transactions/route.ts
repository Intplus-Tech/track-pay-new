import { NextRequest, NextResponse } from "next/server";
import { getBackendJson, readBackendBody } from "@/lib/backend";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function isUnauthorizedError(error: unknown) {
  return error instanceof Error && error.message === "UNAUTHORIZED";
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const accessToken = await getAccessTokenOrThrow();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const response = await getBackendJson(
      `/branches/${id}/transactions${query ? `?${query}` : ""}`,
      {
        headers: getAuthHeaders(accessToken),
      },
    );
    const payload = await readBackendBody<unknown>(response);

    if (!response.ok) {
      return NextResponse.json(payload ?? { message: "Unable to load branch transactions." }, {
        status: response.status,
      });
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({ message: "Unable to load branch transactions." }, { status: 502 });
  }
}
