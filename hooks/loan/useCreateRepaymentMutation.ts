"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { CreateLoanRepaymentDto, LoanRepayment } from "@/types/loan";

export function useCreateRepaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLoanRepaymentDto) =>
      submitJson<LoanRepayment>(
        "/api/loan/repayments",
        "POST",
        "Unable to record repayment.",
        payload,
      ),
    onSuccess: async (_data, payload) => {
      await queryClient.invalidateQueries({
        queryKey: loanKeys.repaymentList(payload.portfolioId),
      });
      await queryClient.invalidateQueries({
        queryKey: loanKeys.portfolioDetails(payload.portfolioId),
      });
    },
  });
}
