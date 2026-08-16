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
  const shared = "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium";

  if (type === "REPAYMENT") {
    return <span className={`${shared} border-emerald-200 bg-emerald-50 text-emerald-700`}>{normalizedLabel}</span>;
  }

  if (type === "DISBURSEMENT") {
    return <span className={`${shared} border-blue-200 bg-blue-50 text-blue-700`}>{normalizedLabel}</span>;
  }

  return <span className={`${shared} border-violet-200 bg-violet-50 text-violet-700`}>{normalizedLabel}</span>;
}

export function BranchTransactions({ branchId }: { branchId: string }) {
  const transactionsQuery = useBranchTransactionsQuery(branchId, 10);
  const transactionRows = transactionsQuery.data ?? [];

  return (
    <Section title="Recent transactions">
      {transactionsQuery.isLoading ? (
        <div className="px-4 py-3 text-xs text-slate-500">Loading transactions...</div>
      ) : transactionsQuery.isError ? (
        <div className="px-4 py-3 text-xs text-red-600">
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
                  <TableCell className="text-[11px] text-slate-600">
                    {new Date(row.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                  </TableCell>
                  <TableCell>{getTransactionTag(row.type, row.typeLabel)}</TableCell>
                  <TableCell className="text-[11px] text-slate-700">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-slate-700">{row.loanId || "-"}</span>
                      <span className="text-[10px] text-slate-400">{row.loaneeName || "Unknown loanee"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-[11px] font-semibold text-slate-800">
                    {row.amount != null ? formatCurrency(Number(row.amount)) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${row.status === "COMPLETED"
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
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-b-xl border-t border-dashed border-slate-200">
          <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 mb-3 text-slate-400">
            <Receipt className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No transactions yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-[280px]">
            This branch hasn't recorded any disbursements or repayments. Once transactions occur, they will appear here.
          </p>
        </div>
      )}
    </Section>
  );
}
