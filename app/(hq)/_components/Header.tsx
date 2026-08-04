"use client";

import { Input } from "@/components/ui/input";
import { Bell, CircleArrowRight, Search } from "lucide-react";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageHeader from "@/components/PageHeader";
import type { DashboardSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { clearCsrfTokenCache, getCsrfToken } from "@/lib/csrf-client";

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
  const router = useRouter();

  async function handleLogout() {
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
    <header className="flex justify-between p-6">
      <PageHeader />
      <div className="rounded-full bg-white h-fit border p-2 flex items-center gap-4">
        <span className="relative">
          <Search
            size={16}
            className="absolute top-1/2 left-3 -translate-y-2"
          />
          <Input className="rounded-full pl-8 bg-primary/10" />
        </span>
        <div>
          <Select defaultValue="24">
            <SelectTrigger className="w-[140px] h-8 rounded-full bg-primary/10">
              <SelectValue placeholder="Time filter" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg">
              <SelectItem value="24">Last 24 Hours</SelectItem>
              <SelectItem value="48">48 Hours</SelectItem>
              <SelectItem value="week">1 Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Bell size={20} />
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-500 disabled:opacity-50"
          aria-label="Sign out"
          title="Sign out"
        >
          <CircleArrowRight strokeWidth={1} size={20} color="currentColor" />
        </button>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>{getInitials(session?.user.name)}</AvatarFallback>
        </Avatar>
        <div className="hidden xl:block leading-tight">
          <p className="text-sm font-semibold text-gray-900">
            {session?.user.name ?? "Signed in user"}
          </p>
          <p className="text-xs text-gray-500">
            {session?.role?.name ?? "No role"}
            {session?.branch?.name ? ` • ${session.branch.name}` : ""}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
