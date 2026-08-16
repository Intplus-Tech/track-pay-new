"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";

export function useDeleteBranchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      submitJson<null>(`/api/branches/${id}`, "DELETE", "Unable to delete branch."),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.branches() });
    },
  });
}
