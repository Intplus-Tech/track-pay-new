"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { LoanScheduleInstalment } from "@/types/loan";

export function useUpcomingScheduleQuery(portfolioId: string, limit = 3) {
  return useQuery({
    queryKey: loanKeys.upcomingSchedule(portfolioId),
    queryFn: () =>
      queryJson<LoanScheduleInstalment[]>(
        `/api/loan/schedules/portfolio/${portfolioId}/upcoming?limit=${limit}`,
        "Unable to load upcoming instalments.",
      ),
    enabled: !!portfolioId,
  });
}
