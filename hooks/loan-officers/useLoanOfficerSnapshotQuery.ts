"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { loanOfficerKeys } from "@/lib/query/keys/loan-officers";
import type { LoanOfficerSnapshot } from "@/types/loan-officer";

export function useLoanOfficerSnapshotQuery(id: string) {
  return useQuery({
    queryKey: loanOfficerKeys.snapshot(id),
    queryFn: () =>
      queryJson<LoanOfficerSnapshot>(
        `/api/loan-officers/${id}/snapshot`,
        "Unable to load officer snapshot.",
      ),
    enabled: id.trim().length > 0,
  });
}
