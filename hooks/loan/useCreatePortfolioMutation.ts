"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { CreateLoanPortfolioDto, LoanPortfolio } from "@/types/loan";

export function useCreatePortfolioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLoanPortfolioDto) =>
      submitJson<LoanPortfolio>(
        "/api/loan/portfolios",
        "POST",
        "Unable to create portfolio.",
        payload,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: loanKeys.portfolios() });
    },
  });
}
