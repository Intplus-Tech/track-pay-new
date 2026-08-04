import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_ACCESS_TOKEN_COOKIE } from "@/lib/auth";

export default async function RootPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;

  redirect(accessToken ? "/home/overview" : "/auth/sign-in");
}