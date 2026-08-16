"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacBranch } from "@/types/rbac";

export function useBranchDetailQuery(branchId: string | null) {
  return useQuery({
    queryKey: [...rbacKeys.branches(), "detail", branchId ?? "pending"],
    queryFn: async () => {
      if (!branchId) {
        throw new Error("Branch id is required.");
      }

      return queryJson<RbacBranch>(`/api/branches/${branchId}`, "Unable to load branch.");
    },
    enabled: Boolean(branchId),
  });
}
