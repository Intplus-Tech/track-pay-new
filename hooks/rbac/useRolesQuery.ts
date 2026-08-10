"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacRole } from "@/types/rbac";

export function useRolesQuery() {
  return useQuery({
    queryKey: rbacKeys.roles(),
    queryFn: () => queryJson<RbacRole[]>("/api/roles", "Unable to load roles."),
  });
}