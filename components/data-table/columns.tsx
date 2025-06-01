"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LoanData, StaffLoanPerformance, UserData } from "@/types/data-table";
import { StatusBadge } from "./StatusBadge";
import {
  RowActions,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./RowActions";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { PortfolioCard } from "../PortfolioCard";
import { formatCurrency } from "@/lib/utils";
import ReassignLoanTable from "@/app/(hq)/_components/tables/ReassignLoanTable";
import { DialogClose } from "@radix-ui/react-dialog";
import { Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";

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

export const loanOfficerColumns: ColumnDef<StaffLoanPerformance>[] = [
  {
    accessorKey: "employeeId",
    header: "Employee ID",
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "branch",
    header: "Branch",
  },
  {
    accessorKey: "activeLoan",
    header: "Active Loans",
  },
  {
    accessorKey: "collectionRate",
    header: "Collection rate",
  },
  {
    accessorKey: "overdueRate",
    header: "Overdue Rate",
    cell: ({ row }) => formatCurrency(row.getValue("overdueRate")),
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
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant={"ghost"}
              size={"sm"}
              className="px-2 text-sm font-normal w-full text-left flex items-center justify-start"
            >
              View Portfolio
            </Button>
          </DialogTrigger>
          <DialogContent className="">
            <DialogTitle className="sr-only">
              Empolyee portfolio information
            </DialogTitle>
            <PortfolioCard {...portfolioData} />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant={"ghost"}
              size={"sm"}
              className="px-2 text-sm font-normal w-full text-left flex items-center justify-start"
            >
              Reassign Loans
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-transparent border-none">
            <DialogTitle className="sr-only">
              Reassign Employee loads
            </DialogTitle>
            <div className="p-6 rounded-md bg-background max-h-[90vh] overflow-y-auto w-fit mx-auto">
              <div className="flex items-center justify-end w-full">
                <DialogClose>
                  <X />
                </DialogClose>
              </div>
              <ReassignLoanTable />
            </div>
          </DialogContent>
        </Dialog>
        <DropdownMenuItem>Mark as Unavailable</DropdownMenuItem>
      </RowActions>
    ),
  },
];
