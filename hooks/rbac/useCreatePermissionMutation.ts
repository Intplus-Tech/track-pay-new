"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { CreatePermissionPayload, RbacPermission } from "@/types/rbac";

export function useCreatePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePermissionPayload) =>
      submitJson<RbacPermission>(
        "/api/permissions",
        "POST",
        "Unable to create permission.",
        payload,
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: rbacKeys.permissions() }),
        queryClient.invalidateQueries({ queryKey: rbacKeys.roles() }),
      ]);
    },
  });
}