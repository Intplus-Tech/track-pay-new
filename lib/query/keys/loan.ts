export const loanKeys = {
  all: ["loan"] as const,

  // Loanees
  loanees: () => [...loanKeys.all, "loanees"] as const,
  loaneeList: (params?: unknown) =>
    [...loanKeys.loanees(), "list", params ?? {}] as const,
  loaneeDetail: (id: string) =>
    [...loanKeys.loanees(), "detail", id] as const,

  // Portfolios
  portfolios: () => [...loanKeys.all, "portfolios"] as const,
  portfolioList: (params?: unknown) =>
    [...loanKeys.portfolios(), "list", params ?? {}] as const,
  portfolioDetail: (id: string) =>
    [...loanKeys.portfolios(), "detail", id] as const,
  portfolioDetails: (id: string) =>
    [...loanKeys.portfolios(), "details", id] as const,

  // Repayments
  repayments: () => [...loanKeys.all, "repayments"] as const,
  repaymentList: (portfolioId: string) =>
    [...loanKeys.repayments(), "portfolio", portfolioId] as const,
  repaymentDetail: (id: string) =>
    [...loanKeys.repayments(), "detail", id] as const,

  // Schedules
  schedules: () => [...loanKeys.all, "schedules"] as const,
  schedule: (portfolioId: string) =>
    [...loanKeys.schedules(), "full", portfolioId] as const,
  upcomingSchedule: (portfolioId: string) =>
    [...loanKeys.schedules(), "upcoming", portfolioId] as const,
  scheduleSummary: (portfolioId: string) =>
    [...loanKeys.schedules(), "summary", portfolioId] as const,
};
