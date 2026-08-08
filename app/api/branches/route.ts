import { NextResponse } from "next/server";
import { getBackendJson, readBackendBody } from "@/lib/backend";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";
import { normalizeBranch } from "@/lib/rbac";

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
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({ message: "Unable to load branches." }, { status: 502 });
  }
}