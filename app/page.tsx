import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_ACCESS_TOKEN_COOKIE, decodeJwtClaims } from "@/lib/auth";

export default async function RootPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;

  let isValidSession = false;

  if (accessToken) {
    const claims = decodeJwtClaims(accessToken);
    isValidSession = !claims?.exp || claims.exp > Math.floor(Date.now() / 1000);
  }

  redirect(isValidSession ? "/home/overview" : "/auth/sign-in");
}