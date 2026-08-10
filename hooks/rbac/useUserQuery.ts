"use client";

import { useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { normalizeUser } from "@/lib/rbac";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacUser } from "@/types/rbac";

function parseUserPayload(payload: unknown): RbacUser {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid user payload.");
  }

  const record = payload as Record<string, unknown>;

  if (record.data && typeof record.data === "object") {
    return normalizeUser(record.data as Record<string, unknown>);
  }

  return normalizeUser(record);
}

export function useUserQuery(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: rbacKeys.user(id ?? "pending"),
    queryFn: async () => {
      if (!id) {
        throw new Error("User id is required.");
      }

      const payload = await queryJson<unknown>(`/api/users/${id}`, "Unable to load user.");
      return parseUserPayload(payload);
    },
    enabled: enabled && Boolean(id),
  });
}
