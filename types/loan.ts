import type { RbacPaginationResponse } from "./rbac";

// ─── Shared enums ─────────────────────────────────────────────────────────────

export type PortfolioStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PARTIAL"
  | "OVERDUE"
  | "ONTIME"
  | "CLOSED";

export type InterestType = "FIXED" | "FLOAT" | "REDUCING";

export type RepaymentStatus = "RECEIVED" | "APPLIED" | "REVERSED";

export type InstalmentStatus = "SETTLED" | "UNSETTLED" | "OVERDUE";

// ─── Loanee ───────────────────────────────────────────────────────────────────

export interface Loanee {
  _id: string;
  id: string;
  loaneeNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  middleName?: string | null;
  phoneNumber?: string | null;
  photoUrl?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  loanPortfolios?: any | null;
  branchId?: string | null;
  photoUploadId?: string | null;
}

export type LoaneeListResponse = RbacPaginationResponse<Loanee>;

export interface LoaneeListQuery {
  page: number;
  limit: number;
  order: "ASC" | "DESC";
  loaneeNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export const DEFAULT_LOANEE_LIST_QUERY: LoaneeListQuery = {
  page: 1,
  limit: 20,
  order: "ASC",
};

export interface CreateLoaneeDto {
  loaneeNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  middleName?: string;
  phoneNumber?: string;
  photoUrl?: string;
}

/** UpdateLoaneeDto fields are unconfirmed — treat as partial of create fields */
export interface UpdateLoaneeDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  middleName?: string;
  phoneNumber?: string;
  photoUrl?: string;
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export interface LoanPortfolio {
  _id: string;
  id: string;
  loaneeId: string;
  loanId?: string | null;
  accountNumber?: string | null;
  principal: string;
  tenureMonths: number;
  interestRate: string;
  interestType?: InterestType | null;
  status: PortfolioStatus;
  nextDueDate?: string | null;
  loanOfficerId?: string | null;
  branchId?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  /** Joined loanee name — may be present on list responses */
  loaneeName?: string | null;
  /** Populated loanee object from detailed fetches */
  loanee?: Loanee | null;
  /** Populated loan officer object from detailed fetches */
  loanOfficer?: any | null;
}

export type PortfolioListResponse = RbacPaginationResponse<LoanPortfolio>;

export interface PortfolioListQuery {
  page: number;
  limit: number;
  search: string;
  status: PortfolioStatus | "all";
  order: "ASC" | "DESC";
  loaneeId?: string;
  loanOfficerId?: string;
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const DEFAULT_PORTFOLIO_LIST_QUERY: PortfolioListQuery = {
  page: 1,
  limit: 20,
  search: "",
  status: "all",
  order: "ASC",
};

export interface CreateLoanPortfolioDto {
  loaneeId: string;
  principal: string;
  tenureMonths: number;
  interestRate: string;
  status?: PortfolioStatus;
  interestType?: InterestType;
  loanOfficerId?: string;
  nextDueDate?: string;
}

export interface UpdateLoanPortfolioDto {
  status?: PortfolioStatus;
}

/** Response from GET /loan/portfolios/{id}/details */
export interface PortfolioDetails {
  portfolioId: string;
  loanId: string;
  loaneeName: string;
  originalAmount: string;
  paidToDate: string;
  outstanding: string;
  status: PortfolioStatus;
  schedule: {
    totalInstallments: number;
    paidInstallments: number;
    remainingInstallments: number;
    overdueInstallments: number;
    progressLabel: string;
    progressPercent: number;
    totalDue: string;
    totalPaid: string;
    totalOutstanding: string;
    nextDueDate: string | null;
    nextDueAmount: string | null;
    overdueDays: number;
  };
  payments: PortfolioPaymentSummaryRow[];
}

export interface PortfolioPaymentSummaryRow {
  date: string;
  amount: string;
  status: RepaymentStatus;
}

// ─── Repayment ────────────────────────────────────────────────────────────────

export interface LoanRepayment {
  _id: string;
  id: string;
  portfolioId: string;
  amount: string;
  currency?: string | null;
  status: RepaymentStatus;
  paidAt?: string | null;
  provider?: string | null;
  providerReference?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type RepaymentListResponse = RbacPaginationResponse<LoanRepayment>;

export interface CreateLoanRepaymentDto {
  portfolioId: string;
  amount: string;
  currency?: string;
  paidAt?: string;
  provider?: string;
  providerReference?: string;
}

export interface ApplyPaymentDto {
  amount: string;
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export interface LoanScheduleInstalment {
  _id?: string;
  id?: string;
  portfolioId?: string;
  instalmentNumber: number;
  dueDate: string;
  amount: string;
  status: InstalmentStatus;
  settledAt?: string | null;
  settledAmount?: string | null;
}

export type LoanScheduleListResponse = LoanScheduleInstalment[];

export interface LoanScheduleSummary {
  portfolioId: string;
  totalInstalments: number;
  settledInstalments: number;
  unsettledInstalments: number;
  overdueInstalments: number;
  totalAmount: string;
  totalSettled: string;
  totalOutstanding: string;
  nextDueDate?: string | null;
  /** Oldest overdue instalment age in days */
  overdueAgeDays?: number | null;
}
