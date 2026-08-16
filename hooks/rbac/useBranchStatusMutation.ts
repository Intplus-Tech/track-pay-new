"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacBranch, RbacBranchStatus } from "@/types/rbac";

interface UpdateBranchStatusArgs {
  branchId: string;
  status: RbacBranchStatus;
  reason?: string;
}

export function useBranchStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchId, status, reason }: UpdateBranchStatusArgs) =>
      submitJson<RbacBranch>(
        `/api/branches/${branchId}/status`,
        "PATCH",
        "Unable to update branch status.",
        { status, ...(reason ? { reason } : {}) },
      ),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.branches() });
      await queryClient.invalidateQueries({ queryKey: [...rbacKeys.branches(), "detail", variables.branchId] });
    },
  });
}
