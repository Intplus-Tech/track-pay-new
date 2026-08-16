"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacBranchTransaction } from "@/types/rbac";

export function useBranchTransactionsQuery(branchId: string | null, limit = 10) {
  return useQuery({
    queryKey: [...rbacKeys.branches(), "transactions", branchId ?? "pending", limit],
    queryFn: async () => {
      if (!branchId) {
        throw new Error("Branch id is required.");
      }

      return queryJson<RbacBranchTransaction[]>(
        `/api/branches/${branchId}/transactions?limit=${limit}`,
        "Unable to load branch transactions.",
      );
    },
    enabled: Boolean(branchId),
  });
}
