"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { dashboardKeys } from "@/lib/query/keys/dashboard";
import type { DashboardOverview, DashboardPerformanceChartFilters } from "@/types/dashboard";

export function useDashboardOverviewQuery(
  filters: Pick<DashboardPerformanceChartFilters, "branchId" | "loanOfficerId" | "recentLimit"> = {},
) {
  return useQuery({
    queryKey: dashboardKeys.overview(filters),
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

      return queryJson<DashboardOverview>(
        `/api/dashboard/overview${query ? `?${query}` : ""}`,
        "Unable to load dashboard overview.",
      );
    },
  });
}