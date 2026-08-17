"use client";

import { useState } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="space-y-4">
      <section className="rounded-xl border bg-card text-card-foreground p-3 shadow-sm">
        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedFilters({
              branchId: draftFilters.branchId === "all" ? undefined : draftFilters.branchId || undefined,
              loanOfficerId: draftFilters.loanOfficerId || undefined,
              recentLimit: draftFilters.recentLimit
                ? Number(draftFilters.recentLimit)
                : undefined,
              endDate: draftFilters.endDate || undefined,
            });
          }}
        >
          <Select
            value={draftFilters.branchId}
            onValueChange={(value) =>
              setDraftFilters((current) => ({ ...current, branchId: value }))
            }
          >
            <SelectTrigger aria-label="Filter by branch">
              <SelectValue placeholder="All branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches</SelectItem>
              {branchesQuery.data?.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={draftFilters.loanOfficerId}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, loanOfficerId: event.target.value }))
            }
            placeholder="Loan officer ID"
            aria-label="Filter by loan officer ID"
          />
          <Input
            type="date"
            value={draftFilters.endDate}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, endDate: event.target.value }))
            }
            aria-label="Chart end date"
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
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Apply
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraftFilters({ branchId: "", loanOfficerId: "", recentLimit: "", endDate: "" });
                setAppliedFilters({});
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </section>
      {overviewQuery.isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {overviewQuery.error.message}
        </div>
      ) : null}
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          if (!card) {
            return (
              <Skeleton
                key={`dashboard-card-skeleton-${index}`}
                className="h-[120px] rounded-xl border shadow-sm"
              />
            );
          }

        const Icon = card.icon;

        return (
        <article
          key={card.title}
          className="rounded-xl border bg-card text-card-foreground p-4 shadow-sm"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div
              className={[
                "flex size-8 items-center justify-center rounded-lg",
                card.valueTone === "success" && "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
                card.valueTone === "danger" && "bg-destructive/10 text-destructive",
                card.valueTone === "default" && "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              <Icon className="size-4" />
            </div>
            {card.trend ? (
              <span
                className={[
                  "text-xs font-medium",
                  card.trendTone === "positive" && "text-emerald-500 dark:text-emerald-400",
                  card.trendTone === "alert" && "text-destructive",
                  card.trendTone === "neutral" && "text-muted-foreground",
                ].join(" ")}
              >
                {card.trend}
              </span>
            ) : null}
          </div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            {card.title}
          </p>
          <p
            className={[
              "mt-1 text-2xl font-bold leading-none tracking-tight",
              card.valueTone === "success" && "text-emerald-600 dark:text-emerald-500",
              card.valueTone === "danger" && "text-destructive",
              card.valueTone === "default" && "text-foreground",
            ].join(" ")}
          >
            {card.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{card.subtitle}</p>
        </article>
        );
        })}
      </section>

      <section className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <header className="border-b p-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            Today&apos;s Collection Position
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Collection activity and accounts requiring attention today.
          </p>
        </header>
        {todayQuery.isError ? (
          <div className="px-4 py-6 text-sm text-destructive">{todayQuery.error.message}</div>
        ) : todayQuery.isPending ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton
                key={`today-card-skeleton-${index}`}
                className="h-24 rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "TOTAL DUE TODAY",
                value: formatAmount(todayQuery.data.totalDueToday),
                tone: "text-foreground",
              },
              {
                label: "COLLECTED TODAY",
                value: formatAmount(todayQuery.data.collectedToday),
                tone: "text-emerald-600 dark:text-emerald-500",
              },
              {
                label: "CLIENTS DUE TODAY",
                value: todayQuery.data.clientsDueToday.toLocaleString(),
                tone: "text-foreground",
              },
              {
                label: "OVERDUE ACCOUNTS",
                value: todayQuery.data.overdueAccounts.toLocaleString(),
                tone: todayQuery.data.overdueAccounts > 0 ? "text-destructive" : "text-foreground",
              },
            ].map((card) => (
              <article key={card.label} className="rounded-lg border bg-muted/50 p-4">
                <p className="text-xs font-medium tracking-wide text-muted-foreground">{card.label}</p>
                <p className={`mt-1.5 text-xl font-bold ${card.tone}`}>{card.value}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <header className="border-b p-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            Loan Performance
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monthly disbursements compared with collections over the last twelve months.
          </p>
        </header>
        {performanceChartQuery.isError ? (
          <div className="px-4 py-6 text-sm text-destructive">{performanceChartQuery.error.message}</div>
        ) : performanceChartQuery.isPending ? (
          <Skeleton className="m-4 h-[280px] rounded-lg" />
        ) : (
          <ChartContainer
            config={{
              disbursedValue: { label: "Disbursed", color: "var(--color-primary)" },
              collectedValue: { label: "Collected", color: "#10b981" },
            }}
            className="h-[280px] w-full p-4"
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
