import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";
import { getBackendJson, readBackendBody } from "@/lib/backend";

const forwardedParameters = ["branchId", "loanOfficerId", "recentLimit"];

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenOrThrow();
    const searchParameters = new URLSearchParams();

    for (const parameter of forwardedParameters) {
      const value = request.nextUrl.searchParams.get(parameter);

      if (value) {
        searchParameters.set(parameter, value);
      }
    }

    const query = searchParameters.toString();
    const response = await getBackendJson(`/dashboard/overview${query ? `?${query}` : ""}`, {
      headers: getAuthHeaders(accessToken),
    });
    const payload = await readBackendBody<unknown>(response);

    return NextResponse.json(payload ?? {}, { status: response.status });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Unable to load dashboard overview." },
      { status: 502 },
    );
  }
}