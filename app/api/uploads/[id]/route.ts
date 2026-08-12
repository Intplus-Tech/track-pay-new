import { NextRequest, NextResponse } from "next/server";
import { getBackendJson, readBackendBody } from "@/lib/backend";
import { getAccessTokenOrThrow, getAuthHeaders } from "@/lib/api-auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const accessToken = await getAccessTokenOrThrow();
    const { id } = await context.params;
    
    const response = await getBackendJson(`/uploads/${id}`, {
      headers: getAuthHeaders(accessToken),
    });

    const payload = await readBackendBody<unknown>(response);

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({ message: "Unable to load upload." }, { status: 502 });
  }
}
