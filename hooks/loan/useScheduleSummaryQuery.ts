"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { LoanScheduleSummary } from "@/types/loan";

export function useScheduleSummaryQuery(portfolioId: string) {
  return useQuery({
    queryKey: loanKeys.scheduleSummary(portfolioId),
    queryFn: () =>
      queryJson<LoanScheduleSummary>(
        `/api/loan/schedules/portfolio/${portfolioId}/summary`,
        "Unable to load schedule summary.",
      ),
    enabled: !!portfolioId,
  });
}
