import type { NormalizedEntity, RbacPaginationResponse } from "./rbac";

export type AvailabilityStatus = "ACTIVE" | "UNAVAILABLE";

// ─── List / directory ──────────────────────────────────────────────────────────

export interface LoanOfficerBranchSummary {
  id: string;
  name: string;
}

export interface LoanOfficer extends NormalizedEntity {
  fullName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  email: string;
  employeeId?: string | null;
  phoneNumber?: string | null;
  availabilityStatus?: AvailabilityStatus | null;
  maxAssignedLoans?: number | null;
  monthlyCollectionTarget?: string | null;
  branchId?: string | null;
  branch?: LoanOfficerBranchSummary | null;
  /** Live portfolio figures returned by the list endpoint */
  activeLoans?: number | null;
  collectionRate?: number | null;
  overdueRate?: number | null;
}

export type LoanOfficerListResponse = RbacPaginationResponse<LoanOfficer>;

// ─── Snapshot ─────────────────────────────────────────────────────────────────

export interface LoanOfficerCapacity {
  assigned: number;
  max: number;
}

export interface LoanOfficerMonthlyCollections {
  collected: string;
  target: string;
  percentage: number;
}

export interface LoanOfficerProblemLoan {
  portfolioId: string;
  loaneeName?: string | null;
  type: "overdue" | "partial";
  /** Days overdue (present when type === "overdue") */
  daysOverdue?: number | null;
  /** Outstanding balance (present when type === "partial") */
  balance?: string | null;
}

export interface LoanOfficerSnapshot {
  officerId: string;
  officerName?: string | null;
  capacity: LoanOfficerCapacity;
  currentMonth: LoanOfficerMonthlyCollections;
  problemLoans: LoanOfficerProblemLoan[];
}

// ─── Officer loans (assigned book) ────────────────────────────────────────────

export interface OfficerLoan {
  portfolioId: string;
  loanId?: string | null;
  loaneeName?: string | null;
  principal?: string | null;
  status?: string | null;
  nextDueDate?: string | null;
}

export type OfficerLoansResponse = RbacPaginationResponse<OfficerLoan>;

// ─── Query filter shapes ───────────────────────────────────────────────────────

export interface LoanOfficerListQuery {
  page: number;
  limit: number;
  search: string;
  branchId: string;
  availabilityStatus: "all" | AvailabilityStatus;
  order: "ASC" | "DESC";
}

export const DEFAULT_LOAN_OFFICER_LIST_QUERY: LoanOfficerListQuery = {
  page: 1,
  limit: 20,
  search: "",
  branchId: "all",
  availabilityStatus: "all",
  order: "ASC",
};

// ─── Mutation payloads ────────────────────────────────────────────────────────

export interface CreateLoanOfficerPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  middleName?: string;
  employeeId?: string;
  phoneNumber?: string;
  branchId?: string;
  maxAssignedLoans?: number;
  monthlyCollectionTarget?: string;
}

export interface ReassignLoansPayload {
  targetOfficerId: string;
  portfolioIds: string[];
  reason?: string;
}

export interface UpdateAvailabilityPayload {
  availabilityStatus: AvailabilityStatus;
  reason?: string;
}
