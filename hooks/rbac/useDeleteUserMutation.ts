"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      submitJson<null>(`/api/users/${id}`, "DELETE", "Unable to deactivate user."),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.users() });
    },
  });
}