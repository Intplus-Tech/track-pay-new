"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { LoaneeListQuery, LoaneeListResponse } from "@/types/loan";

function buildQuery(q: LoaneeListQuery): string {
  const params = new URLSearchParams({
    page: String(q.page),
    limit: String(q.limit),
  });

  if (q.loaneeNumber?.trim()) params.set("loaneeNumber", q.loaneeNumber.trim());
  if (q.firstName?.trim()) params.set("firstName", q.firstName.trim());
  if (q.lastName?.trim()) params.set("lastName", q.lastName.trim());
  if (q.email?.trim()) params.set("email", q.email.trim());
  if (q.phoneNumber?.trim()) params.set("phoneNumber", q.phoneNumber.trim());
  if (q.order === "DESC") params.set("order", q.order);

  return params.toString();
}

export function useLoaneeListQuery(query: LoaneeListQuery) {
  const qs = buildQuery(query);

  return useQuery({
    queryKey: loanKeys.loaneeList(query),
    queryFn: () =>
      queryJson<LoaneeListResponse>(
        `/api/loan/loanees?${qs}`,
        "Unable to load loanees.",
      ),
    placeholderData: keepPreviousData,
  });
}
