"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";

interface ReverseRepaymentArgs {
  repaymentId: string;
  portfolioId: string;
}

export function useReverseRepaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ repaymentId }: ReverseRepaymentArgs) =>
      submitJson<unknown>(
        `/api/loan/repayments/${repaymentId}/reverse`,
        "PATCH",
        "Unable to reverse repayment.",
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
