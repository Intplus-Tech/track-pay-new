import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AUTH_ACCESS_TOKEN_COOKIE,
  decodeSessionValue,
  type AuthUser,
  AUTH_USER_COOKIE,
} from "@/lib/auth";
import { getBackendJson, readBackendBody } from "@/lib/backend";
import { getAuthHeaders } from "@/lib/api-auth";
import type { LoanOfficerSnapshot } from "@/types/loan-officer";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getSnapshot(id: string, accessToken: string): Promise<LoanOfficerSnapshot | null> {
  const response = await getBackendJson(`/loan-officers/${id}/snapshot`, {
    headers: getAuthHeaders(accessToken),
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Unable to load officer snapshot.");

  const body = await readBackendBody<LoanOfficerSnapshot>(response);
  // readBackendBody can return a string when content-type isn’t JSON
  if (!body || typeof body !== "object") return null;
  return body as LoanOfficerSnapshot;
}

export default async function OfficerSnapshotPage({ params }: PageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    notFound();
  }

  let snapshot: LoanOfficerSnapshot | null = null;
  let fetchError: string | null = null;

  try {
    snapshot = await getSnapshot(id, accessToken);
  } catch (error) {
    fetchError = error instanceof Error ? error.message : "Unknown error";
  }

  if (!snapshot && !fetchError) {
    notFound();
  }

  const capacityPct = snapshot
    ? Math.min(
        100,
        Math.round((snapshot.capacity.assigned / snapshot.capacity.max) * 100),
      )
    : 0;

  const overdue = snapshot?.problemLoans.filter((l) => l.type === "overdue") ?? [];
  const partial = snapshot?.problemLoans.filter((l) => l.type === "partial") ?? [];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/home/loan-officer"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Loan Officers
      </Link>

      {fetchError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
          {fetchError}
        </div>
      ) : snapshot ? (
        <>
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {snapshot.officerName ?? "Officer"} — Portfolio Snapshot
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Live capacity, collection, and problem-loan data.
            </p>
          </div>

          {/* KPI cards */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {/* Assigned loans */}
            <article className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {capacityPct}% capacity
                </span>
              </div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground">
                ASSIGNED LOANS
              </p>
              <p className="mt-1 text-3xl font-bold leading-none tracking-tight">
                {snapshot.capacity.assigned}
                <span className="ml-1 text-lg font-normal text-muted-foreground">
                  / {snapshot.capacity.max}
                </span>
              </p>
              {/* Capacity bar */}
              <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={[
                    "h-full rounded-full transition-all",
                    capacityPct >= 90
                      ? "bg-destructive"
                      : capacityPct >= 70
                      ? "bg-amber-500"
                      : "bg-emerald-500",
                  ].join(" ")}
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
            </article>

            {/* Collected */}
            <article className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {snapshot.currentMonth.percentage.toFixed(1)}% of target
                </span>
              </div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground">
                COLLECTED THIS MONTH
              </p>
              <p className="mt-1 text-3xl font-bold leading-none tracking-tight text-emerald-600 dark:text-emerald-500">
                ₦{Number(snapshot.currentMonth.collected).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Target: ₦{Number(snapshot.currentMonth.target).toLocaleString()}
              </p>
            </article>

            {/* Problem loans */}
            <article className="rounded-xl border bg-card p-5 shadow-sm sm:col-span-2 xl:col-span-1">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                {snapshot.problemLoans.length > 0 && (
                  <span className="text-xs font-medium text-destructive">
                    Requires attention
                  </span>
                )}
              </div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground">
                PROBLEM LOANS
              </p>
              <p className="mt-1 text-3xl font-bold leading-none tracking-tight text-destructive">
                {snapshot.problemLoans.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {overdue.length} overdue · {partial.length} partial payments
              </p>
            </article>
          </section>

          {/* Problem loans detail */}
          {snapshot.problemLoans.length > 0 && (
            <section className="rounded-xl border bg-card shadow-sm">
              <header className="border-b p-4">
                <h2 className="text-base font-semibold leading-none tracking-tight">
                  Problem Loans
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Loans requiring immediate follow-up.
                </p>
              </header>

              <div className="divide-y">
                {overdue.length > 0 && (
                  <div className="p-4">
                    <Badge variant="destructive" className="mb-3">
                      Overdue
                    </Badge>
                    <ul className="space-y-2">
                      {overdue.map((loan) => (
                        <li
                          key={loan.portfolioId}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>{loan.loaneeName ?? loan.portfolioId}</span>
                          {loan.daysOverdue != null && (
                            <span className="text-xs font-medium text-destructive">
                              {loan.daysOverdue}d overdue
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {partial.length > 0 && (
                  <div className="p-4">
                    <Badge className="mb-3">Partial Payments</Badge>
                    <ul className="space-y-2">
                      {partial.map((loan) => (
                        <li
                          key={loan.portfolioId}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>{loan.loaneeName ?? loan.portfolioId}</span>
                          {loan.balance && (
                            <span className="text-xs font-mono text-muted-foreground">
                              ₦{Number(loan.balance).toLocaleString()} bal.
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}
