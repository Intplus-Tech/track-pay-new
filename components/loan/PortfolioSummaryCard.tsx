"use client";

import { LoanStatusBadge } from "@/components/loan/LoanStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolioDetailsQuery } from "@/hooks/loan/usePortfolioDetailsQuery";
import { CalendarClock, TrendingDown, BadgeCheck, Wallet } from "lucide-react";

interface PortfolioSummaryCardProps {
  portfolioId: string;
  nextDueDate?: string | null;
}
export function PortfolioSummaryCard({ portfolioId, nextDueDate }: PortfolioSummaryCardProps) {
  const detailsQuery = usePortfolioDetailsQuery(portfolioId);

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

  if (!d) return null;

  const s = d.schedule;

  const cards = [
    {
      icon: <Wallet className="h-5 w-5" />,
      iconBg: "bg-primary/10 text-primary",
      label: "PRINCIPAL",
      value: `₦${Number(d.originalAmount).toLocaleString()}`,
      sub: null, // Removed as it's no longer provided
    },
    {
      icon: <TrendingDown className="h-5 w-5" />,
      iconBg: "bg-destructive/10 text-destructive",
      label: "OUTSTANDING",
      value: `₦${Number(d.outstanding).toLocaleString()}`,
      sub: `of ₦${Number(s.totalDue).toLocaleString()} expected`,
    },
    {
      icon: <BadgeCheck className="h-5 w-5" />,
      iconBg: "bg-emerald-500/10 text-emerald-500",
      label: "TOTAL REPAID",
      value: `₦${Number(d.paidToDate).toLocaleString()}`,
      sub: s
        ? `${s.paidInstallments} of ${s.totalInstallments} instalments`
        : null,
    },
    {
      icon: <CalendarClock className="h-5 w-5" />,
      iconBg: "bg-amber-500/10 text-amber-500",
      label: "NEXT DUE",
      value: s?.nextDueDate || nextDueDate
        ? new Date((s?.nextDueDate || nextDueDate)!).toLocaleDateString()
        : "—",
      sub: s?.overdueInstallments
        ? `${s.overdueInstallments} overdue instalment${s.overdueInstallments > 1 ? "s" : ""}`
        : null,
      subClassName: s?.overdueInstallments ? "text-destructive" : undefined,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status badge */}
      <div className="flex items-center gap-3">
        <LoanStatusBadge status={d.status} />
        {s?.totalInstallments ? (
          <span className="text-sm text-muted-foreground">
            {s.totalInstallments}-month tenure
          </span>
        ) : null}
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
