"use client";

import { Input } from "@/components/ui/input";
import { ArrowLeft, Bell, Search, Settings } from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { DashboardSession } from "@/lib/session";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearCsrfTokenCache, getCsrfToken } from "@/lib/csrf-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name?: string | null) {
  if (!name) {
    return "TP";
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

const Header = ({ session }: { session: DashboardSession | null }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const routeTitles: Record<string, string> = {
    "/home/overview": "Overview",
    "/home/branch-matrix": "Branch Matrix",
    "/home/user-directory": "User Directory",
    "/home/user-management": "User Management",
    "/home/loan-ledger": "Loan Ledger",
    "/home/team": "Team",
    "/home/settings": "Settings",
    "/home/accounts": "Branch Matrix",
    "/home/loan-officer": "Loan Officers",
    "/home/tracker": "Loan Ledger",
  };

  const isBranchDetail =
    /^\/home\/branch-matrix\/[^/]+$/.test(pathname);
  const isLoaneeDetail = 
    /^\/home\/loan-ledger\/[^/]+$/.test(pathname);

  const title =
    routeTitles[pathname] ??
    (pathname.startsWith("/home/user-management/") ? "User Detail" : null) ??
    (isBranchDetail ? "Branch Detail" : null) ??
    (isLoaneeDetail ? "Loanee Details" : null) ??
    (!isBranchDetail && !isLoaneeDetail
      ? pathname
        .split("/")
        .filter(Boolean)
        .pop()
        ?.replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()) ?? "Dashboard"
      : null) ??
    "Dashboard";

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      });

      if (!response.ok) {
        setIsLoggingOut(false);
        return;
      }

      clearCsrfTokenCache();
      router.replace("/auth/sign-in");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-sidebar px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        {isBranchDetail ? (
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => router.push("/home/branch-matrix")}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Back to Branch Matrix"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground leading-none">Branch Matrix</span>
              <h1 className="text-base font-semibold leading-tight tracking-tight text-foreground truncate">
                Branch Details
              </h1>
            </div>
          </div>
        ) : (
          <h1 className="text-3xl font-semibold leading-none tracking-tight text-foreground">
            {title}
          </h1>
        )}
        <div className="flex items-center gap-3">
          <label className="relative hidden w-[320px] md:block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search portfolio..."
              className="h-9 rounded-full pl-9 text-sm shadow-none"
            />
          </label>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
          <Link
            href="/home/settings"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Settings"
            title="Settings"
          >
            <Settings size={18} />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-full ring-offset-background transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Open user menu"
              >
                <Avatar>
                  {session?.user.photoUrl ? <AvatarImage src={session.user.photoUrl} alt={session.user.name} /> : null}
                  <AvatarFallback>{getInitials(session?.user.name)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href="/home/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(event) => {
                  event.preventDefault();
                  void handleLogout();
                }}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
