"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { LoanPortfolio } from "@/types/loan";

export function usePortfolioDetailQuery(id: string) {
  return useQuery({
    queryKey: loanKeys.portfolioDetail(id),
    queryFn: () =>
      queryJson<LoanPortfolio>(
        `/api/loan/portfolios/${id}`,
        "Unable to load portfolio.",
      ),
    enabled: !!id,
  });
}
