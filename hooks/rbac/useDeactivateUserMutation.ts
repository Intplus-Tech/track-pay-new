"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";

interface DeactivateUserArgs {
  id: string;
  reason?: string;
}

export function useDeactivateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: DeactivateUserArgs) =>
      submitJson<unknown>(`/api/users/${id}/deactivate`, "PATCH", "Unable to deactivate user.", reason ? { reason } : undefined),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.users() });
    },
  });
}
