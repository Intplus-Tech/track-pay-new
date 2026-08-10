"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacPermission } from "@/types/rbac";

export function usePermissionsQuery() {
  return useQuery({
    queryKey: rbacKeys.permissions(),
    queryFn: () =>
      queryJson<RbacPermission[]>(
        "/api/permissions",
        "Unable to load permissions.",
      ),
  });
}