"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { loanOfficerKeys } from "@/lib/query/keys/loan-officers";
import type { CreateLoanOfficerPayload, LoanOfficer } from "@/types/loan-officer";

export function useCreateLoanOfficerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLoanOfficerPayload) =>
      submitJson<LoanOfficer>(
        "/api/loan-officers",
        "POST",
        "Unable to create loan officer.",
        payload,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: loanOfficerKeys.lists() });
    },
  });
}
