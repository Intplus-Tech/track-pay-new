"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacBranch } from "@/types/rbac";

interface UnassignBranchManagerArgs {
  branchId: string;
  removeFromBranch?: boolean;
  reason?: string;
}

export function useUnassignBranchManagerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchId, removeFromBranch, reason }: UnassignBranchManagerArgs) =>
      submitJson<RbacBranch>(
        `/api/branches/${branchId}/manager`,
        "DELETE",
        "Unable to unassign branch manager.",
        {
          ...(removeFromBranch !== undefined ? { removeFromBranch } : {}),
          ...(reason ? { reason } : {}),
        },
      ),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.branches() });
      await queryClient.invalidateQueries({ queryKey: [...rbacKeys.branches(), "detail", variables.branchId] });
    },
  });
}
