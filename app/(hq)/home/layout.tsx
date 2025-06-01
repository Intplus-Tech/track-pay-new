import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../_components/AppSidebar";
import Header from "../_components/Header";
import { cookies } from "next/headers";

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="min-h-screen flex w-full relative">
        {/* <div className="absolute inset-0 bg-[url(/images/bg-image.svg)] bg-no-repeat bg-cover opacity-10"></div> */}
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 space-y-6 z50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>

  );
}

