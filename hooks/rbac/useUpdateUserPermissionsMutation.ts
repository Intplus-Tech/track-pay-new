"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacModulePermission } from "@/types/rbac";

interface UpdateUserPermissionsArgs {
  id: string;
  modulePermissions: RbacModulePermission[];
}

export function useUpdateUserPermissionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, modulePermissions }: UpdateUserPermissionsArgs) =>
      submitJson<unknown>(
        `/api/users/${id}/permissions`,
        "PATCH",
        "Unable to update user permissions.",
        { modulePermissions },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.users() });
    },
  });
}