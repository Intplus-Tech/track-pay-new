"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";
import type { UpdateLoaneeDto, Loanee } from "@/types/loan";

interface UpdateLoaneeArgs {
  id: string;
  payload: UpdateLoaneeDto;
}

export function useUpdateLoaneeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateLoaneeArgs) =>
      submitJson<Loanee>(
        `/api/loan/loanees/${id}`,
        "PATCH",
        "Unable to update loanee.",
        payload,
      ),
    onSuccess: async (_data, { id }) => {
      await queryClient.invalidateQueries({ queryKey: loanKeys.loanees() });
      await queryClient.invalidateQueries({
        queryKey: loanKeys.loaneeDetail(id),
      });
    },
  });
}
