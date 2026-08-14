"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { CreateBranchPayload, RbacBranch } from "@/types/rbac";

export function useCreateBranchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBranchPayload) =>
      submitJson<RbacBranch>(
        "/api/branches",
        "POST",
        "Unable to create branch.",
        payload,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.branches() });
    },
  });
}