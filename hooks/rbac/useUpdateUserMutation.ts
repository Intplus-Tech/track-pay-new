"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacUser, UpdateUserPayload } from "@/types/rbac";

interface UpdateUserArgs {
  id: string;
  payload: UpdateUserPayload;
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateUserArgs) =>
      submitJson<RbacUser>(`/api/users/${id}`, "PUT", "Unable to update user.", payload),
    onSuccess: async (data, variables) => {

      await queryClient.invalidateQueries({ queryKey: rbacKeys.users() });
      await queryClient.invalidateQueries({ queryKey: rbacKeys.user(variables.id) });
    },
  });
}
