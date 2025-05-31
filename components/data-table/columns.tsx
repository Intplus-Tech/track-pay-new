"use client"

import { ColumnDef } from "@tanstack/react-table"
import { LoanData, UserData } from "@/types/data-table"
import { StatusBadge } from "./StatusBadge"
import { RowActions, DropdownMenuItem, DropdownMenuSeparator } from "./RowActions"
import { Separator } from "../ui/separator"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

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
]

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
]

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
]