import { NextRequest, NextResponse } from "next/server";
import { getBackendJson, readBackendBody } from "@/lib/backend";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";

function isUnauthorizedError(error: unknown) {
  return error instanceof Error && error.message === "UNAUTHORIZED";
}

export async function GET(_request: NextRequest) {
  try {
    const accessToken = await getAccessTokenOrThrow();
    const response = await getBackendJson("/branches/configuration", {
      headers: getAuthHeaders(accessToken),
    });
    const payload = await readBackendBody<unknown>(response);

    if (!response.ok) {
      return NextResponse.json(payload ?? { message: "Unable to load branch configuration." }, {
        status: response.status,
      });
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({ message: "Unable to load branch configuration." }, { status: 502 });
  }
}
