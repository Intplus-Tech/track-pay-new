"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { UpdateLoanPortfolioDto, LoanPortfolio } from "@/types/loan";

interface UpdatePortfolioArgs {
  id: string;
  payload: UpdateLoanPortfolioDto;
}

export function useUpdatePortfolioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdatePortfolioArgs) =>
      submitJson<LoanPortfolio>(
        `/api/loan/portfolios/${id}`,
        "PATCH",
        "Unable to update portfolio.",
        payload,
      ),
    onSuccess: async (_data, { id }) => {
      await queryClient.invalidateQueries({ queryKey: loanKeys.portfolios() });
      await queryClient.invalidateQueries({
        queryKey: loanKeys.portfolioDetail(id),
      });
    },
  });
}
