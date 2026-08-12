"use client";

import * as React from "react";
import {
  Building2,
  Grid2X2,
  KeyRound,
  NotebookText,
  ShieldCheck,
  Users,
  UserCog,
  UsersRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import type { DashboardSession } from "@/lib/session";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  subItems?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Overview",
    href: "/home/overview",
    icon: Grid2X2,
  },
  {
    title: "Branch Matrix",
    href: "/home/branch-matrix",
    icon: Building2,
  },
  {
    title: "Loan Ledger",
    href: "/home/loan-ledger",
    icon: NotebookText,
  },
  {
    title: "Team",
    href: "/home/team",
    icon: Users,
  },
  {
    title: "Admin",
    icon: ShieldCheck,
    subItems: [
      {
        title: "User Management",
        href: "/home/user-management",
      },
      {
        title: "Role Management",
        href: "/home/role-management",
      },
      {
        title: "Permission Management",
        href: "/home/permission-management",
      },
    ],
  },
];

export function AppSidebar({
  session,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  session: DashboardSession | null;
}) {
  const pathname = usePathname();

  const { open } = useSidebar();

  const footerLabel = session?.branch?.name ?? "HQ";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200 bg-white text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
      {...props}
    >
      <SidebarHeader className="px-4 pb-2 pt-5">
        <Link
          href="/home/overview"
          className={cn(
            "flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-slate-50",
            !open && "justify-center px-0",
          )}
        >
          <Logo width={34} height={34} priority />
          <span
            className={cn(
              "text-[1.55rem] font-semibold tracking-[-0.03em] text-[#1038f0] transition-all duration-200",
              open ? "opacity-100" : "hidden opacity-0",
            )}
          >
            TrackPay
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 pb-4 pt-8">
        <SidebarMenu className="space-y-1 p-0">
          {navItems.map((item) => {
            if (item.subItems) {
              const isActive = item.subItems.some((subItem) => pathname === subItem.href || pathname.startsWith(`${subItem.href}/`));

              return (
                <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        className={cn(
                          "h-11 rounded-xl border border-transparent px-3 text-[0.95rem] font-medium text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 data-[active=true]:border-slate-200 data-[active=true]:bg-white data-[active=true]:text-[#1038f0] data-[active=true]:shadow-[0_8px_24px_rgba(15,23,42,0.08)]",
                          !open && "justify-center px-0",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex size-5 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition-colors group-data-[active=true]/menu-item:bg-[#1038f0]/10 group-data-[active=true]/menu-item:text-[#1038f0]">
                            <item.icon className="size-3.5" />
                          </span>
                          <span className={cn(open ? "inline" : "hidden")}>{item.title}</span>
                        </span>
                        {open && (
                          <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {open && (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => {
                            const isSubActive = pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);
                            return (
                              <SidebarMenuSubItem key={subItem.href}>
                                <SidebarMenuSubButton asChild isActive={isSubActive} className={cn("text-slate-500 hover:text-slate-900 data-[active=true]:text-[#1038f0] data-[active=true]:font-semibold")}>
                                  <Link href={subItem.href}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href ? pathname === item.href || pathname.startsWith(`${item.href}/`) : false;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={cn(
                    "h-11 rounded-xl border border-transparent px-3 text-[0.95rem] font-medium text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 data-[active=true]:border-slate-200 data-[active=true]:bg-white data-[active=true]:text-[#1038f0] data-[active=true]:shadow-[0_8px_24px_rgba(15,23,42,0.08)]",
                    !open && "justify-center px-0",
                  )}
                >
                  <Link href={item.href!}>
                    <span className="flex items-center gap-3">
                      <span className="flex size-5 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition-colors group-data-[active=true]/menu-item:bg-[#1038f0]/10 group-data-[active=true]/menu-item:text-[#1038f0]">
                        <item.icon className="size-3.5" />
                      </span>
                      <span className={cn(open ? "inline" : "hidden")}>{item.title}</span>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-3 pb-4 pt-0">
        <div className="relative overflow-hidden rounded-[1.35rem] bg-[linear-gradient(135deg,#1837dd_0%,#0f2cc7_52%,#102dbf_100%)] p-4 text-white shadow-[0_18px_40px_rgba(16,45,191,0.28)]">
          <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_100%_100%,rgba(255,255,255,0.28)_0,rgba(255,255,255,0.12)_24%,transparent_25%),radial-gradient(circle_at_85%_90%,rgba(255,255,255,0.18)_0,rgba(255,255,255,0.1)_14%,transparent_15%),radial-gradient(circle_at_70%_100%,rgba(255,255,255,0.18)_0,rgba(255,255,255,0.08)_18%,transparent_19%)]" />
          <div className="relative flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Logo width={22} height={22} priority />
            </div>
            <div className="min-w-0">
              <div className="text-[1.15rem] font-semibold leading-none tracking-[-0.03em]">
                {footerLabel}
              </div>
              <p className="mt-2 max-w-[8.5rem] text-[0.82rem] leading-5 text-white/92">
                Micro Investment Support Services
              </p>
              <p className="mt-1 text-[0.72rem] text-white/72">www.misleasing.com</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
