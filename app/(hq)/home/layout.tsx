import Header from "../_components/Header";
import { DashboardSidebar } from "../_components/SideBar";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative h-screen w-screen flex">
      {/* Background Image */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[url(/images/bg-image.svg)] bg-center bg-no-repeat bg-cover opacity-10 z-0"
      />

      {/* Main Layout */}
      <div className="relative z-10 flex flex-1">
        <DashboardSidebar />

        {/* Content Area */}
        <div className="flex flex-1 flex-col h-screen overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-8">
            <Header />
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
