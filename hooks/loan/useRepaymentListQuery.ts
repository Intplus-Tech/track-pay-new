"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { RepaymentListResponse } from "@/types/loan";

export function useRepaymentListQuery(portfolioId: string) {
  return useQuery({
    queryKey: loanKeys.repaymentList(portfolioId),
    queryFn: () =>
      queryJson<RepaymentListResponse>(
        `/api/loan/repayments/portfolio/${portfolioId}`,
        "Unable to load repayments.",
      ),
    enabled: !!portfolioId,
  });
}
