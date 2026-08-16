"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacBranchConfiguration } from "@/types/rbac";

export function useBranchConfigurationQuery() {
  return useQuery({
    queryKey: [...rbacKeys.branches(), "configuration"],
    queryFn: () => queryJson<RbacBranchConfiguration[]>("/api/branches/configuration", "Unable to load branch configuration."),
  });
}
