"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { CreatePermissionPayload, RbacPermission } from "@/types/rbac";

interface UpdatePermissionArgs {
  id: string;
  payload: CreatePermissionPayload;
}

export function useUpdatePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdatePermissionArgs) =>
      submitJson<RbacPermission>(
        `/api/permissions/${id}`,
        "PUT",
        "Unable to update permission.",
        payload,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.permissions() });
    },
  });
}