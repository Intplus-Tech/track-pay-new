"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { CreateRolePayload, RbacRole } from "@/types/rbac";

interface UpdateRoleArgs {
  id: string;
  payload: CreateRolePayload;
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateRoleArgs) =>
      submitJson<RbacRole>(`/api/roles/${id}`, "PATCH", "Unable to update role.", payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rbacKeys.roles() });
    },
  });
}