"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { dashboardKeys } from "@/lib/query/keys/dashboard";
import type {
  DashboardPerformanceChartFilters,
  DashboardPerformancePoint,
} from "@/types/dashboard";

export function useDashboardPerformanceChartQuery(
  filters: DashboardPerformanceChartFilters = {},
) {
  return useQuery({
    queryKey: dashboardKeys.performanceChart(filters),
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

      if (filters.endDate) {
        searchParameters.set("endDate", `${filters.endDate}T23:59:59.999Z`);
      }

      const query = searchParameters.toString();

      return queryJson<DashboardPerformancePoint[]>(
        `/api/dashboard/performance-chart${query ? `?${query}` : ""}`,
        "Unable to load dashboard performance chart.",
      );
    },
  });
}