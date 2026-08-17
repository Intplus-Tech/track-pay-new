"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { ApplyPaymentDto } from "@/types/loan";

interface ApplyPaymentArgs {
  portfolioId: string;
  payload: ApplyPaymentDto;
}

export function useApplyPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ portfolioId, payload }: ApplyPaymentArgs) =>
      submitJson<unknown>(
        `/api/loan/portfolios/${portfolioId}/apply-payment`,
        "POST",
        "Unable to apply payment.",
        payload,
      ),
    onSuccess: async (_data, { portfolioId }) => {
      await queryClient.invalidateQueries({
        queryKey: loanKeys.portfolioDetail(portfolioId),
      });
      await queryClient.invalidateQueries({
        queryKey: loanKeys.portfolioDetails(portfolioId),
      });
      await queryClient.invalidateQueries({
        queryKey: loanKeys.repaymentList(portfolioId),
      });
      await queryClient.invalidateQueries({
        queryKey: loanKeys.scheduleSummary(portfolioId),
      });
    },
  });
}
