"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useLoanOfficersQuery } from "@/hooks/loan-officers/useLoanOfficersQuery";
import { useReassignLoansMutation } from "@/hooks/loan-officers/useReassignLoansMutation";
import { DEFAULT_LOAN_OFFICER_LIST_QUERY } from "@/types/loan-officer";
import type { OfficerLoan, LoanOfficer } from "@/types/loan-officer";

interface ReassignLoansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The officer whose loans are being reassigned */
  sourceOfficer: Pick<LoanOfficer, "id" | "fullName">;
  /** Pre-loaded loans for that officer */
  loans: OfficerLoan[];
  loansLoading?: boolean;
}

export function ReassignLoansDialog({
  open,
  onOpenChange,
  sourceOfficer,
  loans,
  loansLoading = false,
}: ReassignLoansDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [targetOfficerId, setTargetOfficerId] = useState("");
  const [reason, setReason] = useState("");

  const officersQuery = useLoanOfficersQuery({
    ...DEFAULT_LOAN_OFFICER_LIST_QUERY,
    limit: 100,
  });

  const reassignMutation = useReassignLoansMutation();

  const togglePortfolio = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === loans.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(loans.map((l) => l.portfolioId)));
    }
  };

  const canSubmit =
    selectedIds.size > 0 &&
    targetOfficerId.length > 0 &&
    !reassignMutation.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;

    reassignMutation.mutate(
      {
        officerId: sourceOfficer.id ?? "",
        payload: {
          targetOfficerId,
          portfolioIds: [...selectedIds],
          ...(reason.trim() ? { reason: reason.trim() } : {}),
        },
      },
      {
        onSuccess: () => {
          setSelectedIds(new Set());
          setTargetOfficerId("");
          setReason("");
          onOpenChange(false);
        },
      },
    );
  };

  // Officers available as targets (exclude the source officer)
  const targetCandidates =
    officersQuery.data?.data.filter((o) => o.id !== sourceOfficer.id) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Reassign Loans — {sourceOfficer.fullName ?? "Officer"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Loan selection */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">
                Select loans to reassign
                {selectedIds.size > 0 && (
                  <span className="ml-2 text-muted-foreground">
                    ({selectedIds.size} selected)
                  </span>
                )}
              </p>
              {loans.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleAll}
                >
                  {selectedIds.size === loans.length
                    ? "Deselect all"
                    : "Select all"}
                </Button>
              )}
            </div>

            <div className="rounded-lg border divide-y max-h-56 overflow-y-auto">
              {loansLoading ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-8 rounded" />
                  ))}
                </div>
              ) : loans.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  No loans assigned to this officer.
                </p>
              ) : (
                loans.map((loan) => (
                  <label
                    key={loan.portfolioId}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`loan-${loan.portfolioId}`}
                      checked={selectedIds.has(loan.portfolioId)}
                      onCheckedChange={() => togglePortfolio(loan.portfolioId)}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate">
                        {loan.loaneeName ?? "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {loan.portfolioId}
                        {loan.status ? ` · ${loan.status}` : ""}
                      </span>
                    </span>
                    {loan.principal && (
                      <span className="text-sm font-mono shrink-0">
                        ₦{Number(loan.principal).toLocaleString()}
                      </span>
                    )}
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Target officer */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Transfer to</p>
            <Select
              value={targetOfficerId}
              onValueChange={setTargetOfficerId}
            >
              <SelectTrigger aria-label="Select target officer" className="w-full">
                <SelectValue placeholder="Choose officer…" />
              </SelectTrigger>
              <SelectContent>
                {officersQuery.isPending ? (
                  <SelectItem value="loading" disabled>
                    Loading…
                  </SelectItem>
                ) : (
                  targetCandidates.map((o) => (
                    <SelectItem key={o.id} value={o.id ?? ""}>
                      {o.fullName ?? o.email}
                      {o.branch?.name ? ` — ${o.branch.name}` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Optional reason */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Reason{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </p>
            <Input
              placeholder="e.g. Officer on leave"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {reassignMutation.isError && (
            <p className="text-sm text-destructive">
              {reassignMutation.error.message}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={reassignMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {reassignMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reassign Loans
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
