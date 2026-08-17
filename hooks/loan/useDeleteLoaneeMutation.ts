"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";

export function useDeleteLoaneeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      submitJson<null>(
        `/api/loan/loanees/${id}`,
        "DELETE",
        "Unable to delete loanee.",
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: loanKeys.loanees() });
    },
  });
}
