"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { LoanScheduleListResponse } from "@/types/loan";

export function useScheduleQuery(portfolioId: string) {
  return useQuery({
    queryKey: loanKeys.schedule(portfolioId),
    queryFn: () =>
      queryJson<LoanScheduleListResponse>(
        `/api/loan/schedules/portfolio/${portfolioId}`,
        "Unable to load schedule.",
      ),
    enabled: !!portfolioId,
  });
}
