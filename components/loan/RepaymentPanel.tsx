"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import {
  repaymentColumns,
  type RepaymentTableMeta,
} from "@/components/data-table/columns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { RecordRepaymentForm } from "@/components/forms/RecordRepaymentForm";
import { ApplyPaymentForm } from "@/components/forms/ApplyPaymentForm";
import { useRepaymentListQuery } from "@/hooks/loan/useRepaymentListQuery";
import { useApplyRepaymentMutation } from "@/hooks/loan/useApplyRepaymentMutation";
import { useReverseRepaymentMutation } from "@/hooks/loan/useReverseRepaymentMutation";
import type { LoanRepayment } from "@/types/loan";
import { PlusCircle, CreditCard } from "lucide-react";

interface RepaymentPanelProps {
  portfolioId: string;
}

export function RepaymentPanel({ portfolioId }: RepaymentPanelProps) {
  const [recordOpen, setRecordOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [repaymentToReverse, setRepaymentToReverse] = useState<LoanRepayment | null>(null);

  const repaymentQuery = useRepaymentListQuery(portfolioId);
  const applyMutation = useApplyRepaymentMutation();
  const reverseMutation = useReverseRepaymentMutation();

  const repayments = Array.isArray(repaymentQuery.data)
    ? repaymentQuery.data
    : (repaymentQuery.data?.data ?? []);

  const handleApply = (repayment: LoanRepayment) => {
    applyMutation.mutate(
      { repaymentId: (repayment.id || repayment._id)!, portfolioId },
      {
        onSuccess: () => toast.success("Repayment applied successfully"),
        onError: (err) => toast.error(err.message || "Failed to apply repayment"),
      }
    );
  };

  const handleReverse = (repayment: LoanRepayment) => {
    setRepaymentToReverse(repayment);
  };

  const confirmReverse = () => {
    if (!repaymentToReverse) return;
    reverseMutation.mutate(
      { repaymentId: (repaymentToReverse.id || repaymentToReverse._id)!, portfolioId },
      {
        onSuccess: () => {
          toast.success("Repayment reversed successfully");
          setRepaymentToReverse(null);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to reverse repayment");
          setRepaymentToReverse(null);
        },
      }
    );
  };

  const tableMeta: RepaymentTableMeta = {
    onApply: handleApply,
    onReverse: handleReverse,
    applyingId: applyMutation.isPending ? applyMutation.variables?.repaymentId : null,
    reversingId: reverseMutation.isPending ? reverseMutation.variables?.repaymentId : null,
  };

  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <header className="flex items-center justify-between border-b p-4">
        <div>
          <h2 className="text-base font-semibold leading-none tracking-tight">
            Repayments
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All recorded repayments for this portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setApplyOpen(true)}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Apply Payment
          </Button>
          <Button
            size="sm"
            onClick={() => setRecordOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Record Repayment
          </Button>
        </div>
      </header>

      <div className="p-4">
        {repaymentQuery.isPending ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : repaymentQuery.isError ? (
          <p className="text-sm text-destructive">{repaymentQuery.error.message}</p>
        ) : repayments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No repayments recorded yet.
          </p>
        ) : (
          <DataTable
            columns={repaymentColumns}
            data={repayments}
            meta={tableMeta}
            searchConfig={{ enabled: false }}
            durationConfig={{ enabled: false }}
            exportConfig={{ enabled: false, options: [] }}
            paginationConfig={{ enabled: true, pageSizeOptions: [10, 20] }}
          />
        )}
      </div>

      {/* Record repayment dialog */}
      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle className="sr-only">Record Repayment</DialogTitle>
          <RecordRepaymentForm
            portfolioId={portfolioId}
            onSuccess={() => setRecordOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Apply payment dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="sr-only">Apply Payment</DialogTitle>
          <ApplyPaymentForm
            portfolioId={portfolioId}
            onSuccess={() => setApplyOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Reverse confirmation dialog */}
      <AlertDialog
        open={!!repaymentToReverse}
        onOpenChange={(open) => !open && setRepaymentToReverse(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reverse Repayment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will roll back the portfolio balance and mark this repayment as reversed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <Button
              onClick={confirmReverse}
              variant="destructive"
              disabled={reverseMutation.isPending}
            >
              {reverseMutation.isPending ? "Reversing..." : "Reverse"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
