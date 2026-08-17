"use client";

import { cn } from "@/lib/utils";
import type { PortfolioStatus, RepaymentStatus, InstalmentStatus } from "@/types/loan";

type AnyLoanStatus = PortfolioStatus | RepaymentStatus | InstalmentStatus;

interface LoanStatusBadgeProps {
  status: AnyLoanStatus | string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string; dot: string }> = {
  // Portfolio statuses
  PENDING:    { label: "Pending",   classes: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900", dot: "bg-yellow-500" },
  APPROVED:   { label: "Approved",  classes: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",          dot: "bg-blue-500" },
  REJECTED:   { label: "Rejected",  classes: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",               dot: "bg-red-500" },
  PARTIAL:    { label: "Partial",   classes: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900", dot: "bg-orange-500" },
  OVERDUE:    { label: "Overdue",   classes: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",               dot: "bg-red-500" },
  ONTIME:     { label: "On Time",   classes: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900", dot: "bg-emerald-500" },
  CLOSED:     { label: "Closed",    classes: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",             dot: "bg-gray-400" },
  // Repayment statuses
  RECEIVED:   { label: "Received",  classes: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900",               dot: "bg-sky-500" },
  APPLIED:    { label: "Applied",   classes: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900", dot: "bg-emerald-500" },
  REVERSED:   { label: "Reversed",  classes: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",            dot: "bg-gray-400" },
  // Instalment statuses
  SETTLED:    { label: "Settled",   classes: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900", dot: "bg-emerald-500" },
  UNSETTLED:  { label: "Unsettled", classes: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900", dot: "bg-yellow-500" },
};

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    classes: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.classes,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)} />
      {config.label}
    </span>
  );
}
