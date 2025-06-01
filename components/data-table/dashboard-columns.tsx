"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StatusBadge } from "./StatusBadge"

export interface DashboardData {
  id: string
  time: string
  loanId: string
  loanee: string
  branchOfficer: string
  amountPaid: number
  outstandingLoan: number
  status: 'On-Time' | 'Partial' | 'Overdue'
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const dashboardColumns: ColumnDef<DashboardData>[] = [
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
]