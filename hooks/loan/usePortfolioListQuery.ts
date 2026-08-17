"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { PortfolioListQuery, PortfolioListResponse } from "@/types/loan";

function buildQuery(q: PortfolioListQuery): string {
  const params = new URLSearchParams({
    page: String(q.page),
    limit: String(q.limit),
  });

  if (q.search.trim().length > 0) params.set("search", q.search.trim());
  if (q.status !== "all") params.set("status", q.status);
  if (q.order === "DESC") params.set("order", q.order);
  if (q.loaneeId) params.set("loaneeId", q.loaneeId);
  if (q.loanOfficerId) params.set("loanOfficerId", q.loanOfficerId);
  if (q.branchId) params.set("branchId", q.branchId);
  if (q.dateFrom) params.set("dateFrom", q.dateFrom);
  if (q.dateTo) params.set("dateTo", q.dateTo);

  return params.toString();
}

export function usePortfolioListQuery(query: PortfolioListQuery) {
  const qs = buildQuery(query);

  return useQuery({
    queryKey: loanKeys.portfolioList(query),
    queryFn: () =>
      queryJson<PortfolioListResponse>(
        `/api/loan/portfolios?${qs}`,
        "Unable to load portfolios.",
      ),
    placeholderData: keepPreviousData,
  });
}
