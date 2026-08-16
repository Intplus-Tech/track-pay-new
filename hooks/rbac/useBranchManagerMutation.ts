"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacBranch } from "@/types/rbac";

interface AssignBranchManagerArgs {
  branchId: string;
  userId: string;
  transferFromCurrentBranch?: boolean;
  allowMultipleBranches?: boolean;
  reason?: string;
}

export function useBranchManagerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchId, userId, transferFromCurrentBranch, allowMultipleBranches, reason }: AssignBranchManagerArgs) =>
      submitJson<RbacBranch>(
        `/api/branches/${branchId}/manager`,
        "PATCH",
        "Unable to assign branch manager.",
        {
          userId,
          ...(transferFromCurrentBranch !== undefined ? { transferFromCurrentBranch } : {}),
          ...(allowMultipleBranches !== undefined ? { allowMultipleBranches } : {}),
          ...(reason ? { reason } : {}),
        },
      ),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.branches() });
      await queryClient.invalidateQueries({ queryKey: [...rbacKeys.branches(), "detail", variables.branchId] });
    },
  });
}
