"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJson } from "@/lib/query/fetcher";
import { loanKeys } from "@/lib/query/keys/loan";

interface RefreshOverdueArgs {
  branchId?: string;
}

export function useRefreshOverdueMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: RefreshOverdueArgs = {}) =>
      submitJson<unknown>(
        "/api/loan/schedules/refresh-overdue",
        "POST",
        "Unable to refresh overdue instalments.",
        args.branchId ? { branchId: args.branchId } : {},
      ),
    onSuccess: async () => {
      // Invalidate all schedule-related keys since this is a batch operation
      await queryClient.invalidateQueries({ queryKey: loanKeys.schedules() });
      await queryClient.invalidateQueries({ queryKey: loanKeys.portfolios() });
    },
  });
}
