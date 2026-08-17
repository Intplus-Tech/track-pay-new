import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../_components/AppSidebar";
import Header from "../_components/Header";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AUTH_ACCESS_TOKEN_COOKIE,
  AUTH_USER_COOKIE,
  decodeSessionValue,
  type AuthUser,
} from "@/lib/auth";
import { resolveDashboardSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const accessToken = cookieStore.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    redirect("/auth/sign-in");
  }

  const currentUser = decodeSessionValue<AuthUser>(
    cookieStore.get(AUTH_USER_COOKIE)?.value,
  );
  const dashboardSession = await resolveDashboardSession(
    accessToken,
    currentUser,
  );

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="min-h-screen flex w-full relative">
        {/* <div className="absolute inset-0 bg-[url(/images/bg-image.svg)] bg-no-repeat bg-cover opacity-10"></div> */}
        <AppSidebar session={dashboardSession} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header session={dashboardSession} />
          <main className="flex-1 p-6 space-y-6 z-50 bg-background">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
