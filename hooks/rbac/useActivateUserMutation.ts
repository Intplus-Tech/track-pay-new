"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";

interface ActivateUserArgs {
  id: string;
  reason?: string;
}

export function useActivateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: ActivateUserArgs) =>
      submitJson<unknown>(`/api/users/${id}/activate`, "PATCH", "Unable to activate user.", reason ? { reason } : undefined),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.users() });
    },
  });
}
