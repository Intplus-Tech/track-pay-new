export interface DashboardMetric {
  value: string;
  previousValue: string;
  changePercent: number;
  count: number;
}

export interface DashboardOverview {
  overallLoan: DashboardMetric;
  activeLoan: DashboardMetric;
  overdue: DashboardMetric;
  recentLoans: unknown[];
}

export interface DashboardPerformancePoint {
  label: string;
  monthStart: string;
  disbursed: string;
  collected: string;
}

export interface DashboardPerformanceChartFilters {
  branchId?: string;
  loanOfficerId?: string;
  recentLimit?: number;
  endDate?: string;
}

export interface DashboardToday {
  totalDueToday: string;
  collectedToday: string;
  clientsDueToday: number;
  overdueAccounts: number;
}