"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { loanOfficerKeys } from "@/lib/query/keys/loan-officers";
import type { ReassignLoansPayload } from "@/types/loan-officer";

interface ReassignArgs {
  officerId: string;
  payload: ReassignLoansPayload;
}

export function useReassignLoansMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ officerId, payload }: ReassignArgs) =>
      submitJson<unknown>(
        `/api/loan-officers/${officerId}/reassign`,
        "POST",
        "Unable to reassign loans.",
        payload,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: loanOfficerKeys.all });
    },
  });
}
