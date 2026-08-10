"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";

export function useDeletePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      submitJson<null>(
        `/api/permissions/${id}`,
        "DELETE",
        "Unable to delete permission.",
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: rbacKeys.permissions() }),
        queryClient.invalidateQueries({ queryKey: rbacKeys.roles() }),
      ]);
    },
  });
}