export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: (params?: unknown) =>
    [...dashboardKeys.all, "overview", params ?? {}] as const,
  performanceChart: (params?: unknown) =>
    [...dashboardKeys.all, "performance-chart", params ?? {}] as const,
  today: (params?: unknown) => [...dashboardKeys.all, "today", params ?? {}] as const,
};