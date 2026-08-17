"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";

export function useDeletePortfolioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      submitJson<null>(
        `/api/loan/portfolios/${id}`,
        "DELETE",
        "Unable to delete portfolio.",
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: loanKeys.portfolios() });
    },
  });
}
