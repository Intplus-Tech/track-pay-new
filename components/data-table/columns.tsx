"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LoanData, StaffLoanPerformance, UserData } from "@/types/data-table";
import type { LoanOfficer } from "@/types/loan-officer";
import type { Loanee, LoanPortfolio, LoanRepayment, LoanScheduleInstalment } from "@/types/loan";
import { StatusBadge } from "./StatusBadge";
import { LoanStatusBadge } from "@/components/loan/LoanStatusBadge";
import { RowActions, DropdownMenuItem, DropdownMenuSeparator } from "./RowActions";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { formatCurrency } from "@/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

/** Callbacks injected via table.options.meta for the loanOfficerColumns action cell */
export interface LoanOfficerTableMeta {
  onViewSnapshot: (officer: LoanOfficer) => void;
  onReassign: (officer: LoanOfficer) => void;
  onToggleAvailability: (officer: LoanOfficer) => void;
  updatingAvailabilityId?: string | null;
}

const portfolioData = {
  title: "Chike Portfolio Snapshot",
  assignedLoans: {
    current: 72,
    capacity: 75,
  },
  currentMonth: {
    collected: "¥2.8M",
    target: "¥3.0M (93%)",
  },
  problemLoans: [
    { name: "Adeola Bello", daysOverdue: 2, type: "overdue" },
    { name: "Liberty Kayode", daysOverdue: 9, type: "overdue" },
    { name: "Ireti Adebayo", daysOverdue: 2, type: "overdue" },
    { name: "Lolu Bello", balance: "¥10,500", type: "partial" },
    { name: "Helen Aguemi", balance: "¥10,500", type: "partial" },
  ],
};

const PasswordCell = ({ password }: { password: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">
        {isVisible ? password : "••••••••"}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="h-6 w-6 p-0"
      >
        {isVisible ? (
          <EyeOff className="h-3 w-3" />
        ) : (
          <Eye className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
};

export const loanColumns: ColumnDef<LoanData>[] = [
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "loanId",
    header: "Loan ID",
  },
  {
    accessorKey: "loanee",
    header: "Loanee",
  },
  {
    accessorKey: "branchOfficer",
    header: "Branch/Officer",
  },
  {
    accessorKey: "amountPaid",
    header: "Amount Paid",
    cell: ({ row }) => formatCurrency(row.getValue("amountPaid")),
  },
  {
    accessorKey: "outstandingLoan",
    header: "Outstanding Loan",
    cell: ({ row }) => formatCurrency(row.getValue("outstandingLoan")),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <RowActions>
        <div className="p-2 flex flex-col gap-y-2 w-[200px]">
          <span className="flex items-center justify-between">
            <p className="text-normal text-xs">{row.getValue("loanId")}</p>
            {/* <MoveUpRight size={10} /> */}
          </span>
          <span className="flex items-center justify-between">
            <p className="text-normal text-xs">Original Amount</p>
            <p className="text-normal text-xs">{formatCurrency(145000)}</p>
          </span>
          <span className="flex items-center justify-between">
            <p className="text-normal text-xs">Paid to date</p>
            <p className="text-normal text-xs">{formatCurrency(145000)}</p>
          </span>
          <Separator className="my-2" />
          <span>
            <p className="text-sm mb-2">All Payments</p>

            <ul className="space-y-2">
              <li className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-xs">{formatCurrency(1400)}</p>
              </li>
              <li className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">June 5</p>
                <p className="text-xs">{formatCurrency(1400)}</p>
              </li>
              <li className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">May 28</p>
                <p className="text-xs">{formatCurrency(1400)}</p>
              </li>
            </ul>
          </span>
        </div>
      </RowActions>
    ),
  },
];

export const userColumns: ColumnDef<UserData>[] = [
  {
    accessorKey: "employeeId",
    header: "Employee ID",
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "email",
    header: "Email Address",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "password",
    header: "Password",
    cell: ({ row }) => <PasswordCell password={row.getValue("password")} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <RowActions>
        <DropdownMenuItem>Edit Order</DropdownMenuItem>
        <DropdownMenuItem>View Full Permission</DropdownMenuItem>
        <DropdownMenuItem>Deactivate</DropdownMenuItem>
      </RowActions>
    ),
  },
];

export const loaneeAccountColumns: ColumnDef<LoanData>[] = [
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "loanId",
    header: "Loanee ID",
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "branchOfficer",
    header: "Branch/Officer",
  },
  {
    accessorKey: "accountCreated",
    header: "Account Created",
  },
  {
    accessorKey: "principal",
    header: "Principal",
    cell: ({ row }) => formatCurrency(row.getValue("principal") || 0),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <RowActions>
        <DropdownMenuItem>Create Single Account</DropdownMenuItem>
        <DropdownMenuItem>Create Bulk Accounts</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Edit Order</DropdownMenuItem>
        <DropdownMenuItem>Deactivate</DropdownMenuItem>
      </RowActions>
    ),
  },
];

export const loanOfficerColumns: ColumnDef<LoanOfficer>[] = [
  {
    accessorKey: "employeeId",
    header: "Employee ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.getValue("employeeId") ?? "—"}
      </span>
    ),
  },
  {
    id: "fullName",
    header: "Name",
    cell: ({ row }) => {
      const officer = row.original;
      const name = (officer.fullName ?? `${officer.firstName ?? ""} ${officer.lastName ?? ""}`.trim()) || officer.email;

      const initials = name
        .split(" ")
        .slice(0, 2)
        .map((s: string) => s[0])
        .join("")
        .toUpperCase();
      return (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-none">{name}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {officer.email}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    id: "branch",
    header: "Branch",
    cell: ({ row }) => row.original.branch?.name ?? "—",
  },
  {
    id: "assignedLoans",
    header: "Loans",
    cell: ({ row }) => {
      const active = row.original.activeLoans;
      const max = row.original.maxAssignedLoans;
      if (active == null) return "—";
      return (
        <span>
          {active}
          {max != null && (
            <span className="text-muted-foreground"> / {max}</span>
          )}
        </span>
      );
    },
  },
  {
    id: "collectionRate",
    header: "Collection Rate",
    cell: ({ row }) => {
      const rate = row.original.collectionRate;
      if (rate == null) return "—";
      return (
        <span
          className={
            rate >= 80
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : rate >= 50
                ? "text-amber-600 dark:text-amber-400 font-medium"
                : "text-destructive font-medium"
          }
        >
          {rate.toFixed(1)}%
        </span>
      );
    },
  },
  {
    id: "availabilityStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.availabilityStatus;
      return (
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
            status === "ACTIVE"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-destructive/10 text-destructive",
          ].join(" ")}
        >
          <span
            className={[
              "h-1.5 w-1.5 rounded-full",
              status === "ACTIVE" ? "bg-emerald-500" : "bg-destructive",
            ].join(" ")}
          />
          {status === "ACTIVE" ? "Active" : "Unavailable"}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const officer = row.original;
      const meta = table.options.meta as LoanOfficerTableMeta | undefined;
      return (
        <RowActions>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 text-sm font-normal w-full text-left flex items-center justify-start"
            onClick={() => meta?.onViewSnapshot(officer)}
          >
            View Portfolio
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 text-sm font-normal w-full text-left flex items-center justify-start"
            onClick={() => meta?.onReassign(officer)}
          >
            Reassign Loans
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={meta?.updatingAvailabilityId === officer.id}
            className="px-2 text-sm font-normal w-full text-left flex items-center justify-start"
            onClick={() => meta?.onToggleAvailability(officer)}
          >
            {meta?.updatingAvailabilityId === officer.id ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : officer.availabilityStatus === "ACTIVE" ? (
              "Mark as Unavailable"
            ) : (
              "Mark as Active"
            )}
          </Button>
        </RowActions>
      );
    },
  },
];

// ─── Loanee columns ──────────────────────────────────────────────────────────

export interface LoaneeTableMeta {
  onEdit: (loanee: Loanee) => void;
  onViewPortfolios: (loanee: Loanee) => void;
  onDelete: (loanee: Loanee) => void;
}

export const loaneeColumns: ColumnDef<Loanee>[] = [
  {
    accessorKey: "loaneeNumber",
    header: "No.",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.getValue("loaneeNumber")}
      </span>
    ),
  },
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => {
      const loanee = row.original;
      const name = [loanee.firstName, loanee.middleName, loanee.lastName]
        .filter(Boolean)
        .join(" ");
      const initials = [loanee.firstName, loanee.lastName]
        .filter(Boolean)
        .map((s) => s![0])
        .join("")
        .toUpperCase();
      return (
        <div className="flex items-center gap-3">
          {loanee.photoUrl ? (
            <img
              src={loanee.photoUrl}
              alt={name || "Loanee"}
              className="h-8 w-8 shrink-0 rounded-full object-cover border border-border/50"
            />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials || "?"}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-none">{name || "—"}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ row }) => row.getValue("phoneNumber") ?? "—",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const loanee = row.original;
      const meta = table.options.meta as LoaneeTableMeta | undefined;
      return (
        <RowActions>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 text-sm font-normal w-full text-left flex items-center justify-start"
            onClick={() => meta?.onEdit(loanee)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 text-sm font-normal w-full text-left flex items-center justify-start"
            onClick={() => meta?.onViewPortfolios(loanee)}
          >
            View Portfolios
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 text-sm font-normal w-full text-left flex items-center justify-start text-destructive"
            onClick={() => meta?.onDelete(loanee)}
          >
            Delete
          </Button>
        </RowActions>
      );
    },
  },
];

// ─── Portfolio columns ────────────────────────────────────────────────────────

export interface PortfolioTableMeta {
  onViewDetail: (portfolio: LoanPortfolio) => void;
  onApplyPayment: (portfolio: LoanPortfolio) => void;
  onDelete: (portfolio: LoanPortfolio) => void;
}

export const portfolioColumns: ColumnDef<LoanPortfolio>[] = [
  {
    accessorKey: "accountNumber",
    header: "Account",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.getValue("accountNumber") ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "principal",
    header: "Principal",
    cell: ({ row }) => `₦${Number(row.getValue("principal")).toLocaleString()}`,
  },
  {
    accessorKey: "tenureMonths",
    header: "Tenure",
    cell: ({ row }) => `${row.getValue("tenureMonths")} mo`,
  },
  {
    accessorKey: "interestRate",
    header: "Rate",
    cell: ({ row }) => `${row.getValue("interestRate")}%`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <LoanStatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "nextDueDate",
    header: "Next Due",
    cell: ({ row }) => {
      const d = row.getValue("nextDueDate") as string | null;
      return d ? new Date(d).toLocaleDateString() : "—";
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const portfolio = row.original;
      const meta = table.options.meta as PortfolioTableMeta | undefined;
      return (
        <RowActions>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 text-sm font-normal w-full text-left flex items-center justify-start"
            onClick={() => meta?.onViewDetail(portfolio)}
          >
            View Detail
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 text-sm font-normal w-full text-left flex items-center justify-start"
            onClick={() => meta?.onApplyPayment(portfolio)}
          >
            Apply Payment
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 text-sm font-normal w-full text-left flex items-center justify-start text-destructive"
            onClick={() => meta?.onDelete(portfolio)}
          >
            Delete
          </Button>
        </RowActions>
      );
    },
  },
];

// ─── Repayment columns ────────────────────────────────────────────────────────

export interface RepaymentTableMeta {
  onApply: (repayment: LoanRepayment) => void;
  onReverse: (repayment: LoanRepayment) => void;
  applyingId?: string | null;
  reversingId?: string | null;
}

export const repaymentColumns: ColumnDef<LoanRepayment>[] = [
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => `₦${Number(row.getValue("amount")).toLocaleString()}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <LoanStatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "paidAt",
    header: "Paid At",
    cell: ({ row }) => {
      const d = row.getValue("paidAt") as string | null;
      return d ? new Date(d).toLocaleString() : "—";
    },
  },
  {
    accessorKey: "provider",
    header: "Provider",
    cell: ({ row }) => row.getValue("provider") ?? "—",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const repayment = row.original;
      const meta = table.options.meta as RepaymentTableMeta | undefined;
      return (
        <RowActions>
          {repayment.status === "RECEIVED" && (
            <DropdownMenuItem
              asChild
              disabled={meta?.applyingId === (repayment.id || repayment._id)}
              onClick={() => meta?.onApply(repayment)}
              className="bg-transparent hover:bg-transparent"
            >
              <Button
                className="w-full"
                variant="secondary"
              >
                {meta?.applyingId === (repayment.id || repayment._id) ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Applying…</>
                ) : "Apply"}
              </Button>
            </DropdownMenuItem>
          )}
          {repayment.status === "APPLIED" && (
            <DropdownMenuItem
              asChild
              disabled={meta?.reversingId === (repayment.id || repayment._id)}
              onClick={() => meta?.onReverse(repayment)}
              className="bg-transparent hover:bg-transparent"
            >
              <Button
                variant="destructive"
                className="w-full"
              >
                {meta?.reversingId === (repayment.id || repayment._id) ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reversing…</>
                ) : "Reverse"}
              </Button>
            </DropdownMenuItem>
          )}
        </RowActions>
      );
    },
  },
];

// ─── Schedule columns ─────────────────────────────────────────────────────────

export const scheduleColumns: ColumnDef<LoanScheduleInstalment>[] = [
  {
    accessorKey: "instalmentNumber",
    header: "#",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.getValue("instalmentNumber")}
      </span>
    ),
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => new Date(row.getValue("dueDate")).toLocaleDateString(),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => `₦${Number(row.getValue("amount")).toLocaleString()}`,
  },
  {
    accessorKey: "settledAmount",
    header: "Settled",
    cell: ({ row }) => {
      const v = row.getValue("settledAmount") as string | null;
      return v ? `₦${Number(v).toLocaleString()}` : "—";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <LoanStatusBadge status={row.getValue("status")} />,
  },
];
