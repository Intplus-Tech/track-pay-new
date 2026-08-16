"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacBranch, UpdateBranchPayload } from "@/types/rbac";

interface UpdateBranchArgs {
  id: string;
  payload: UpdateBranchPayload;
}

export function useUpdateBranchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateBranchArgs) =>
      submitJson<RbacBranch>(`/api/branches/${id}`, "PATCH", "Unable to update branch.", payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.branches() });
      await queryClient.invalidateQueries({ queryKey: [...rbacKeys.branches(), "detail", variables.id] });
    },
  });
}
