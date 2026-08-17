"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { PortfolioDetails } from "@/types/loan";

export function usePortfolioDetailsQuery(id: string) {
  return useQuery({
    queryKey: loanKeys.portfolioDetails(id),
    queryFn: () =>
      queryJson<PortfolioDetails>(
        `/api/loan/portfolios/${id}/details`,
        "Unable to load portfolio details.",
      ),
    enabled: !!id,
  });
}
