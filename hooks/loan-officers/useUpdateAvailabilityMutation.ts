"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { loanOfficerKeys } from "@/lib/query/keys/loan-officers";
import type { UpdateAvailabilityPayload } from "@/types/loan-officer";

interface UpdateAvailabilityArgs {
  officerId: string;
  payload: UpdateAvailabilityPayload;
}

export function useUpdateAvailabilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ officerId, payload }: UpdateAvailabilityArgs) =>
      submitJson<unknown>(
        `/api/loan-officers/${officerId}/availability`,
        "PATCH",
        "Unable to update officer availability.",
        payload,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: loanOfficerKeys.lists() });
    },
  });
}
