import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend";
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
    
    const backendUrl = `${getBackendBaseUrl()}/uploads/${id}/download`;


    const response = await fetch(backendUrl, {
      method: "GET",
      headers: getAuthHeaders(accessToken),
    });



    if (!response.ok) {
      return NextResponse.json({ message: "Unable to load image." }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const body = response.body;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({ message: "Unable to load image." }, { status: 502 });
  }
}
