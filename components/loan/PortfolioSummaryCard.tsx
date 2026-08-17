"use client";

import { LoanStatusBadge } from "@/components/loan/LoanStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolioDetailsQuery } from "@/hooks/loan/usePortfolioDetailsQuery";
import { useScheduleSummaryQuery } from "@/hooks/loan/useScheduleSummaryQuery";
import { CalendarClock, TrendingDown, BadgeCheck, Wallet } from "lucide-react";

interface PortfolioSummaryCardProps {
  portfolioId: string;
}

export function PortfolioSummaryCard({ portfolioId }: PortfolioSummaryCardProps) {
  const detailsQuery = usePortfolioDetailsQuery(portfolioId);
  const summaryQuery = useScheduleSummaryQuery(portfolioId);

  if (detailsQuery.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (detailsQuery.isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
        {detailsQuery.error.message}
      </div>
    );
  }

  const d = detailsQuery.data;
  const s = summaryQuery.data;

  if (!d) return null;

  const cards = [
    {
      icon: <Wallet className="h-5 w-5" />,
      iconBg: "bg-primary/10 text-primary",
      label: "PRINCIPAL",
      value: `₦${Number(d.principal).toLocaleString()}`,
      sub: d.interestType ? `${d.interestType} · ${d.interestRate ?? "—"}%` : null,
    },
    {
      icon: <TrendingDown className="h-5 w-5" />,
      iconBg: "bg-destructive/10 text-destructive",
      label: "OUTSTANDING",
      value: `₦${Number(d.outstandingBalance).toLocaleString()}`,
      sub: `of ₦${Number(d.totalExpected).toLocaleString()} expected`,
    },
    {
      icon: <BadgeCheck className="h-5 w-5" />,
      iconBg: "bg-emerald-500/10 text-emerald-500",
      label: "TOTAL REPAID",
      value: `₦${Number(d.totalRepaid).toLocaleString()}`,
      sub: s
        ? `${s.settledInstalments} of ${s.totalInstalments} instalments`
        : null,
    },
    {
      icon: <CalendarClock className="h-5 w-5" />,
      iconBg: "bg-amber-500/10 text-amber-500",
      label: "NEXT DUE",
      value: d.nextDueDate
        ? new Date(d.nextDueDate).toLocaleDateString()
        : "—",
      sub: s?.overdueInstalments
        ? `${s.overdueInstalments} overdue instalment${s.overdueInstalments > 1 ? "s" : ""}`
        : null,
      subClassName: s?.overdueInstalments ? "text-destructive" : undefined,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status badge */}
      <div className="flex items-center gap-3">
        <LoanStatusBadge status={d.status} />
        {d.tenureMonths && (
          <span className="text-sm text-muted-foreground">
            {d.tenureMonths}-month tenure
          </span>
        )}
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold leading-none tracking-tight">
              {card.value}
            </p>
            {card.sub && (
              <p
                className={`mt-1 text-xs text-muted-foreground ${card.subClassName ?? ""}`}
              >
                {card.sub}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
