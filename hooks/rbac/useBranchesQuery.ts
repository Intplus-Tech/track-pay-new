"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacBranch } from "@/types/rbac";

export function useBranchesQuery() {
  return useQuery({
    queryKey: rbacKeys.branches(),
    queryFn: () =>
      queryJson<RbacBranch[]>("/api/branches", "Unable to load branches."),
  });
}