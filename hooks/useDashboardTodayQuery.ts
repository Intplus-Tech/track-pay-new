"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { dashboardKeys } from "@/lib/query/keys/dashboard";
import type { DashboardPerformanceChartFilters, DashboardToday } from "@/types/dashboard";

type DashboardTodayFilters = Pick<
  DashboardPerformanceChartFilters,
  "branchId" | "loanOfficerId" | "recentLimit"
>;

export function useDashboardTodayQuery(filters: DashboardTodayFilters = {}) {
  return useQuery({
    queryKey: dashboardKeys.today(filters),
    queryFn: async () => {
      const searchParameters = new URLSearchParams();

      if (filters.branchId) {
        searchParameters.set("branchId", filters.branchId);
      }

      if (filters.loanOfficerId) {
        searchParameters.set("loanOfficerId", filters.loanOfficerId);
      }

      if (filters.recentLimit) {
        searchParameters.set("recentLimit", String(filters.recentLimit));
      }

      const query = searchParameters.toString();

      return queryJson<DashboardToday>(
        `/api/dashboard/today${query ? `?${query}` : ""}`,
        "Unable to load today's collection position.",
      );
    },
  });
}