"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { CreateLoaneeDto, Loanee } from "@/types/loan";

export function useCreateLoaneeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLoaneeDto) =>
      submitJson<Loanee>(
        "/api/loan/loanees",
        "POST",
        "Unable to create loanee.",
        payload,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: loanKeys.loanees() });
    },
  });
}
