"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";

interface ApplyRepaymentArgs {
  repaymentId: string;
  portfolioId: string;
}

export function useApplyRepaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ repaymentId }: ApplyRepaymentArgs) =>
      submitJson<unknown>(
        `/api/loan/repayments/${repaymentId}/apply`,
        "PATCH",
        "Unable to apply repayment.",
      ),
    onSuccess: async (_data, { portfolioId }) => {
      await queryClient.invalidateQueries({
        queryKey: loanKeys.repaymentList(portfolioId),
      });
      await queryClient.invalidateQueries({
        queryKey: loanKeys.portfolioDetails(portfolioId),
      });
      await queryClient.invalidateQueries({
        queryKey: loanKeys.scheduleSummary(portfolioId),
      });
    },
  });
}
