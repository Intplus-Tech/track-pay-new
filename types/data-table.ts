import { ColumnDef } from "@tanstack/react-table";
import { ReactNode } from "react";

export interface FilterOption {
  id: string;
  label: string;
  values: { label: string; value: string }[];
}

export interface SearchConfig {
  enabled: boolean;
  placeholder?: string;
}

export interface FilterConfig {
  enabled: boolean;
  filters: FilterOption[];
}

export interface DurationConfig {
  enabled: boolean;
}

export interface ExportConfig {
  enabled: boolean;
  options: ("pdf" | "excel" | "csv")[];
}

export interface PaginationConfig {
  enabled: boolean;
  pageSizeOptions?: number[];
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchConfig?: SearchConfig;
  filterConfig?: FilterConfig;
  durationConfig?: DurationConfig;
  exportConfig?: ExportConfig;
  paginationConfig?: PaginationConfig;
  rowActions?: (row: TData) => ReactNode;
  title?: string;
}

export interface LoanData {
  id: string;
  time: string;
  loanId: string;
  loanee: string;
  fullName?: string;
  branchOfficer: string;
  amountPaid: number;
  outstandingLoan: number;
  principal?: number;
  accountCreated?: string;
  status: "On-Time" | "Partial" | "Overdue" | "Active" | "Failed";
}

export interface UserData {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  role: string;
  password: string;
}

export type StaffLoanPerformance = {
  employeeId: string;
  fullName: string;
  branch: string;
  activeLoan: number;
  collectionRate: string;
  overdueRate: string;
  status: "Active" | "Unavailable";
};
