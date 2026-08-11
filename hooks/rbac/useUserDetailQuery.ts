"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacUserDetail } from "@/types/rbac";

export function useUserDetailQuery(userId: string | null) {
  return useQuery({
    queryKey: rbacKeys.user(userId ?? "pending"),
    queryFn: async () => {
      if (!userId) {
        throw new Error("User id is required.");
      }

      return queryJson<RbacUserDetail>(`/api/users/${userId}`, "Unable to load user.");
    },
    enabled: Boolean(userId),
  });
}
