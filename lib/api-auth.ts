import { cookies } from "next/headers";
import { AUTH_ACCESS_TOKEN_COOKIE, decodeJwtClaims } from "@/lib/auth";

export async function getAccessTokenOrThrow() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new Error("UNAUTHORIZED");
  }

  const claims = decodeJwtClaims(accessToken);

  if (claims?.exp && claims.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("UNAUTHORIZED");
  }

  return accessToken;
}

export function getAuthHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}