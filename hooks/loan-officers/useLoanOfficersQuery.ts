"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { loanOfficerKeys } from "@/lib/query/keys/loan-officers";
import type {
  LoanOfficerListQuery,
  LoanOfficerListResponse,
} from "@/types/loan-officer";

function buildQuery(q: LoanOfficerListQuery): string {
  const params = new URLSearchParams({
    page: String(q.page),
    limit: String(q.limit),
  });

  if (q.search.trim().length > 0) params.set("search", q.search.trim());
  if (q.branchId !== "all") params.set("branchId", q.branchId);
  if (q.availabilityStatus !== "all")
    params.set("availabilityStatus", q.availabilityStatus);
  if (q.order === "DESC") params.set("order", q.order);

  return params.toString();
}

export function useLoanOfficersQuery(query: LoanOfficerListQuery) {
  const qs = buildQuery(query);

  return useQuery({
    queryKey: loanOfficerKeys.list(query),
    queryFn: () =>
      queryJson<LoanOfficerListResponse>(
        `/api/loan-officers?${qs}`,
        "Unable to load loan officers.",
      ),
    placeholderData: keepPreviousData,
  });
}
