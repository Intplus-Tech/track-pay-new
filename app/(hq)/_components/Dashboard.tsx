"use client";

import { useState } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { useBranchesQuery } from "@/hooks/rbac/useBranchesQuery";
import { useDashboardPerformanceChartQuery } from "@/hooks/useDashboardPerformanceChartQuery";
import { useDashboardTodayQuery } from "@/hooks/useDashboardTodayQuery";
import { useDashboardOverviewQuery } from "@/hooks/useDashboardOverviewQuery";
import {
  AlertTriangle,
  CheckCircle2,
  Link2,
  Square,
} from "lucide-react";
import type {
  DashboardMetric,
  DashboardPerformanceChartFilters,
} from "@/types/dashboard";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: string;
  trendTone?: "positive" | "alert" | "neutral";
  valueTone?: "default" | "success" | "danger";
}

function formatAmount(value: string) {
  return value.startsWith("N") ? value : `N${value}`;
}

function buildStatCards(overview?: {
  overallLoan: DashboardMetric;
  activeLoan: DashboardMetric;
  overdue: DashboardMetric;
  recentLoans: unknown[];
}): StatCard[] {
  if (!overview) {
    return [];
  }

  return [
    {
      title: "TOTAL LOAN PORTFOLIO",
      value: formatAmount(overview.overallLoan.value),
      subtitle: `${overview.overallLoan.count} loans in the portfolio`,
      icon: Square,
      trend: `${overview.overallLoan.changePercent >= 0 ? "+" : ""}${overview.overallLoan.changePercent}%`,
      trendTone: overview.overallLoan.changePercent >= 0 ? "positive" : "alert",
      valueTone: "default",
    },
    {
      title: "ACTIVE LOANS",
      value: formatAmount(overview.activeLoan.value),
      subtitle: `${overview.activeLoan.count} active loans`,
      icon: CheckCircle2,
      valueTone: "success",
    },
    {
      title: "OVERDUE LOANS",
      value: formatAmount(overview.overdue.value),
      subtitle: `${overview.overdue.count} overdue loans`,
      icon: AlertTriangle,
      trend: overview.overdue.count > 0 ? "Requires attention" : "Up to date",
      trendTone: overview.overdue.count > 0 ? "alert" : "positive",
      valueTone: "danger",
    },
    {
      title: "RECENT LOAN ACTIVITY",
      value: `${overview.recentLoans.length}`,
      subtitle: "Loans in the latest activity feed",
      icon: Link2,
      trend: "Live data",
      trendTone: "neutral",
      valueTone: "default",
    },
  ];
}

const Dashboard = () => {
  const [draftFilters, setDraftFilters] = useState({
    branchId: "",
    loanOfficerId: "",
    recentLimit: "",
    endDate: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<DashboardPerformanceChartFilters>({});
  const overviewQuery = useDashboardOverviewQuery(appliedFilters);
  const branchesQuery = useBranchesQuery();
  const performanceChartQuery = useDashboardPerformanceChartQuery(appliedFilters);
  const todayQuery = useDashboardTodayQuery(appliedFilters);
  const statCards = buildStatCards(overviewQuery.data);
  const cards: Array<StatCard | undefined> = overviewQuery.isPending
    ? Array.from({ length: 4 }, () => undefined)
    : statCards;
  const performanceData = performanceChartQuery.data?.map((point) => ({
    ...point,
    disbursedValue: Number(point.disbursed),
    collectedValue: Number(point.collected),
  })) ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
        <form
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedFilters({
              branchId: draftFilters.branchId || undefined,
              loanOfficerId: draftFilters.loanOfficerId || undefined,
              recentLimit: draftFilters.recentLimit
                ? Number(draftFilters.recentLimit)
                : undefined,
              endDate: draftFilters.endDate || undefined,
            });
          }}
        >
          <select
            value={draftFilters.branchId}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, branchId: event.target.value }))
            }
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#1156e8]"
            aria-label="Filter by branch"
          >
            <option value="">All branches</option>
            {branchesQuery.data?.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <Input
            value={draftFilters.loanOfficerId}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, loanOfficerId: event.target.value }))
            }
            placeholder="Loan officer ID"
            aria-label="Filter by loan officer ID"
            className="h-10 border-slate-300 shadow-none"
          />
          <Input
            type="date"
            value={draftFilters.endDate}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, endDate: event.target.value }))
            }
            aria-label="Chart end date"
            className="h-10 border-slate-300 shadow-none"
          />
          <Input
            type="number"
            min="1"
            value={draftFilters.recentLimit}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, recentLimit: event.target.value }))
            }
            placeholder="Recent limit"
            aria-label="Recent activity limit"
            className="h-10 border-slate-300 shadow-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="h-10 flex-1 rounded-md bg-[#1156e8] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d43b2]"
            >
              Apply
            </button>
            <button
              type="button"
              className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              onClick={() => {
                setDraftFilters({ branchId: "", loanOfficerId: "", recentLimit: "", endDate: "" });
                setAppliedFilters({});
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </section>
      {overviewQuery.isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {overviewQuery.error.message}
        </div>
      ) : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          if (!card) {
            return (
              <article
                key={`dashboard-card-skeleton-${index}`}
                className="h-[156px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            );
          }

          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div
                  className={[
                    "flex size-9 items-center justify-center rounded-lg",
                    card.valueTone === "success" && "bg-emerald-50 text-emerald-600",
                    card.valueTone === "danger" && "bg-rose-50 text-rose-600",
                    card.valueTone === "default" && "bg-slate-100 text-slate-700",
                  ].join(" ")}
                >
                  <Icon className="size-4" />
                </div>
                {card.trend ? (
                  <span
                    className={[
                      "text-xs font-semibold",
                      card.trendTone === "positive" && "text-emerald-500",
                      card.trendTone === "alert" && "text-rose-500",
                      card.trendTone === "neutral" && "text-blue-500",
                    ].join(" ")}
                  >
                    {card.trend}
                  </span>
                ) : null}
              </div>
              <p className="text-[0.73rem] font-semibold tracking-[0.06em] text-slate-500">
                {card.title}
              </p>
              <p
                className={[
                  "mt-1 text-[1.9rem] font-bold leading-none tracking-[-0.02em]",
                  card.valueTone === "success" && "text-emerald-600",
                  card.valueTone === "danger" && "text-rose-600",
                  card.valueTone === "default" && "text-slate-900",
                ].join(" ")}
              >
                {card.value}
              </p>
              <p className="mt-2 text-xs text-slate-500">{card.subtitle}</p>
            </article>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
        <header className="border-b border-slate-200 p-4">
          <h2 className="text-[1.9rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
            Today&apos;s Collection Position
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Collection activity and accounts requiring attention today.
          </p>
        </header>
        {todayQuery.isError ? (
          <div className="px-4 py-8 text-sm text-rose-700">{todayQuery.error.message}</div>
        ) : todayQuery.isPending ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={`today-card-skeleton-${index}`}
                className="h-28 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "TOTAL DUE TODAY",
                value: formatAmount(todayQuery.data.totalDueToday),
                tone: "text-slate-900",
              },
              {
                label: "COLLECTED TODAY",
                value: formatAmount(todayQuery.data.collectedToday),
                tone: "text-emerald-600",
              },
              {
                label: "CLIENTS DUE TODAY",
                value: todayQuery.data.clientsDueToday.toLocaleString(),
                tone: "text-slate-900",
              },
              {
                label: "OVERDUE ACCOUNTS",
                value: todayQuery.data.overdueAccounts.toLocaleString(),
                tone: todayQuery.data.overdueAccounts > 0 ? "text-rose-600" : "text-slate-900",
              },
            ].map((card) => (
              <article key={card.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-[0.06em] text-slate-500">{card.label}</p>
                <p className={`mt-2 text-2xl font-bold ${card.tone}`}>{card.value}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
        <header className="border-b border-slate-200 p-4">
          <h2 className="text-[1.9rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
            Loan Performance
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Monthly disbursements compared with collections over the last twelve months.
          </p>
        </header>
        {performanceChartQuery.isError ? (
          <div className="px-4 py-8 text-sm text-rose-700">{performanceChartQuery.error.message}</div>
        ) : performanceChartQuery.isPending ? (
          <div className="m-4 h-[320px] animate-pulse rounded-xl bg-slate-100" />
        ) : (
          <ChartContainer
            config={{
              disbursedValue: { label: "Disbursed", color: "#1156e8" },
              collectedValue: { label: "Collected", color: "#10b981" },
            }}
            className="h-[320px] w-full p-4"
          >
            <LineChart data={performanceData} margin={{ top: 12, right: 12, left: 12, bottom: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `N${Number(value).toLocaleString()}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="disbursedValue"
                name="Disbursed"
                stroke="var(--color-disbursedValue)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="collectedValue"
                name="Collected"
                stroke="var(--color-collectedValue)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </section>

    </div>
  );
};

export default Dashboard;
