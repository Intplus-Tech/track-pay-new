"use client";

import { Receipt } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBranchTransactionsQuery } from "@/hooks/rbac/useBranchTransactionsQuery";
import type { RbacBranchTransaction } from "@/types/rbac";
import { Section } from "./shared";
import { formatCurrency } from "./utils";

function getTransactionTag(type: RbacBranchTransaction["type"], label?: string | null) {
  const normalizedLabel = label ?? type.replace("_", " ");
  const shared = "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";

  if (type === "REPAYMENT") {
    return <span className={`${shared} border-emerald-200 bg-emerald-50 text-emerald-700`}>{normalizedLabel}</span>;
  }

  if (type === "DISBURSEMENT") {
    return <span className={`${shared} border-primary/30 bg-primary/10 text-primary`}>{normalizedLabel}</span>;
  }

  return <span className={`${shared} border-violet-200 bg-violet-50 text-violet-700`}>{normalizedLabel}</span>;
}

export function BranchTransactions({ branchId }: { branchId: string }) {
  const transactionsQuery = useBranchTransactionsQuery(branchId, 10);
  const transactionRows = transactionsQuery.data ?? [];

  return (
    <Section title="Recent transactions">
      {transactionsQuery.isLoading ? (
        <div className="px-4 py-3 text-xs text-muted-foreground">Loading transactions...</div>
      ) : transactionsQuery.isError ? (
        <div className="px-4 py-3 text-xs text-destructive">
          {transactionsQuery.error instanceof Error ? transactionsQuery.error.message : "Unable to load transactions."}
        </div>
      ) : transactionRows.length > 0 ? (
        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[24%]">When</TableHead>
                <TableHead className="w-[20%]">Type</TableHead>
                <TableHead className="w-[22%]">Loan</TableHead>
                <TableHead className="w-[18%] text-right">Amount</TableHead>
                <TableHead className="w-[16%] text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionRows.map((row) => (
                <TableRow key={row.id} className="align-top">
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(row.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                  </TableCell>
                  <TableCell>{getTransactionTag(row.type, row.typeLabel)}</TableCell>
                  <TableCell className="text-xs text-foreground">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">{row.loanId || "-"}</span>
                      <span className="text-xs text-muted-foreground">{row.loaneeName || "Unknown loanee"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold text-foreground">
                    {row.amount != null ? formatCurrency(Number(row.amount)) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${row.status === "COMPLETED"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                    >
                      {row.statusLabel || row.status || "Pending"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-b-xl border-t border-dashed border-border">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3 text-muted-foreground">
            <Receipt className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No transactions yet</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-[280px]">
            This branch hasn't recorded any disbursements or repayments. Once transactions occur, they will appear here.
          </p>
        </div>
      )}
    </Section>
  );
}
