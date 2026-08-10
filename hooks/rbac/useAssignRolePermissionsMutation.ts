"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { AssignRolePermissionsPayload } from "@/types/rbac";

interface AssignRolePermissionsArgs {
  roleId: string;
  permissionIds: string[];
}

export function useAssignRolePermissionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionIds }: AssignRolePermissionsArgs) =>
      submitJson<AssignRolePermissionsPayload>(
        `/api/roles/${roleId}/permissions`,
        "POST",
        "Unable to assign permissions.",
        { permissionIds },
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: rbacKeys.roles() }),
        queryClient.invalidateQueries({ queryKey: rbacKeys.permissions() }),
      ]);
    },
  });
}