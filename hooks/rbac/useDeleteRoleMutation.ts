"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      submitJson<null>(`/api/roles/${id}`, "DELETE", "Unable to delete role."),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.roles() });
    },
  });
}