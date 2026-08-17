"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { Loanee } from "@/types/loan";

export function useLoaneeDetailQuery(id: string) {
  return useQuery({
    queryKey: loanKeys.loaneeDetail(id),
    queryFn: () =>
      queryJson<Loanee>(`/api/loan/loanees/${id}`, "Unable to load loanee."),
    enabled: !!id,
  });
}
