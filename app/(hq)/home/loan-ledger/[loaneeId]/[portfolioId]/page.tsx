import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { AUTH_ACCESS_TOKEN_COOKIE } from "@/lib/auth";
import { getBackendJson, readBackendBody } from "@/lib/backend";
import { getAuthHeaders } from "@/lib/api-auth";
import { PortfolioSummaryCard } from "@/components/loan/PortfolioSummaryCard";
import { SchedulePanel } from "@/components/loan/SchedulePanel";
import { RepaymentPanel } from "@/components/loan/RepaymentPanel";
import type { LoanPortfolio } from "@/types/loan";

interface PageProps {
  params: Promise<{ loaneeId: string; portfolioId: string }>;
}

async function getPortfolio(
  id: string,
  accessToken: string,
): Promise<LoanPortfolio | null> {
  const response = await getBackendJson(`/loan/portfolios/${id}`, {
    headers: getAuthHeaders(accessToken),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Unable to load portfolio.");
  const body = await readBackendBody<any>(response);
  if (!body || typeof body !== "object") return null;
  return (body.data ?? body) as LoanPortfolio;
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  const { loaneeId, portfolioId } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) notFound();

  let portfolio: LoanPortfolio | null = null;
  let fetchError: string | null = null;

  try {
    portfolio = await getPortfolio(portfolioId, accessToken);
  } catch (error) {
    fetchError = error instanceof Error ? error.message : "Unknown error";
  }

  if (!portfolio && !fetchError) notFound();

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/home/loan-ledger/${loaneeId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Loanee
      </Link>

      {fetchError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
          {fetchError}
        </div>
      ) : portfolio ? (
        <>
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Portfolio Detail
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {portfolio.accountNumber
                ? `Account ${portfolio.accountNumber} · `
                : ""}
              ID: <span className="font-mono">{portfolioId}</span>
            </p>
          </div>

          {/* Summary KPI cards — client component (fetches /details and /summary) */}
          <PortfolioSummaryCard portfolioId={portfolioId} />

          {/* Schedule panel */}
          <SchedulePanel portfolioId={portfolioId} />

          {/* Repayments panel */}
          <RepaymentPanel portfolioId={portfolioId} />
        </>
      ) : null}
    </div>
  );
}
