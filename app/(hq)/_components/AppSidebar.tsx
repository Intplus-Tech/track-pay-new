"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Landmark,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  UserRound,
} from "lucide-react"
import {
  BarChart2,
  CreditCard,
  FileText,
  Grid,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";


interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    title: "Overview",
    href: "/home/overview",
    icon: LayoutDashboard,
  },
  {
    title: "Tracker",
    href: "/home/tracker",
    icon: BarChart2,
  },
  {
    title: "Accounts",
    href: "/home/accounts",
    icon: Landmark,
  },
  {
    title: "Loan-Officer",
    href: "/home/loan-officer",
    icon: UserRound,
  },
  {
    title: "Team",
    href: "/home/team",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/home/settings",
    icon: Settings,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();


  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className={`my-4 ${open ? "p-0" : "p-0"}`}>
        <Button
          variant={'ghost'}
          onClick={() => toggleSidebar()}
          className={`hover:bg-sidebar p-0 justify-start ${open ? "pl-2" : " justify-center"} `}
        >
          <Logo width={40} height={40} priority />
          <p
            className={`text-2xl font-semibold transition-all duration-200 text-primary ease-in-out ${open ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"
              }`}
          >
            TrackPay
          </p>
        </Button>
      </SidebarHeader>
      <SidebarContent className="mt-14">
        <SidebarMenu className="p-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(item.href)
                }
                className={cn(
                  "h-10 gap-3 pl-4 pr-2 font-medium text-primary/40 [active=true]:bg-white data-[active=true]:shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] data-[active=true]:text-primary hover:bg-primary/20 hover:text-primary",
                  // pathname === item.href && "bg-primary text-white hover:bg-blue-700 hover:text-white",
                )}
                tooltip={item.title}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
