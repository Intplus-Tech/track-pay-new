"use client";

import { useState } from "react";
import { LoanStatusBadge } from "@/components/loan/LoanStatusBadge";
import { DataTable } from "@/components/data-table/DataTable";
import { scheduleColumns } from "@/components/data-table/columns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpcomingScheduleQuery } from "@/hooks/loan/useUpcomingScheduleQuery";
import { useScheduleQuery } from "@/hooks/loan/useScheduleQuery";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { LoanScheduleInstalment } from "@/types/loan";

interface SchedulePanelProps {
  portfolioId: string;
}

function InstalmentRow({ instalment }: { instalment: LoanScheduleInstalment }) {
  const isOverdue = instalment.status === "OVERDUE";
  return (
    <div
      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
        isOverdue ? "bg-destructive/5 border border-destructive/20" : "bg-muted/40"
      }`}
    >
      <div>
        <span className="font-medium">
          #{instalment.instalmentNumber}
        </span>
        <span className="ml-2 text-muted-foreground">
          {new Date(instalment.dueDate).toLocaleDateString()}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm">
          ₦{Number(instalment.amount).toLocaleString()}
        </span>
        <LoanStatusBadge status={instalment.status} />
      </div>
    </div>
  );
}

export function SchedulePanel({ portfolioId }: SchedulePanelProps) {
  const [showFull, setShowFull] = useState(false);

  const upcomingQuery = useUpcomingScheduleQuery(portfolioId, 3);
  const fullQuery = useScheduleQuery(portfolioId);

  const upcoming = Array.isArray(upcomingQuery.data) ? upcomingQuery.data : [];
  const full = Array.isArray(fullQuery.data) ? fullQuery.data : [];

  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <header className="border-b p-4">
        <h2 className="text-base font-semibold leading-none tracking-tight">
          Instalment Schedule
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upcoming payments and full repayment timeline.
        </p>
      </header>

      <div className="p-4 space-y-3">
        {/* Upcoming instalments */}
        {upcomingQuery.isPending ? (
          <>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </>
        ) : upcomingQuery.isError ? (
          <p className="text-sm text-destructive">{upcomingQuery.error.message}</p>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming instalments.</p>
        ) : (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Upcoming
            </p>
            {upcoming.map((inst) => (
              <InstalmentRow key={inst.instalmentNumber} instalment={inst} />
            ))}
          </>
        )}

        {/* Toggle full schedule */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => setShowFull((v) => !v)}
        >
          {showFull ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" /> Hide Full Schedule
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" /> View Full Schedule
            </>
          )}
        </Button>

        {showFull && (
          <div className="mt-3">
            {fullQuery.isPending ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : fullQuery.isError ? (
              <p className="text-sm text-destructive">{fullQuery.error.message}</p>
            ) : (
              <DataTable
                columns={scheduleColumns}
                data={full}
                searchConfig={{ enabled: false }}
                durationConfig={{ enabled: false }}
                exportConfig={{ enabled: false, options: [] }}
                paginationConfig={{ enabled: true, pageSizeOptions: [10, 20] }}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
