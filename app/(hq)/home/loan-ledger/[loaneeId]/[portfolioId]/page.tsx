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
import type { LoanPortfolio, PortfolioDetails } from "@/types/loan";

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

async function getPortfolioDetails(
  id: string,
  accessToken: string,
): Promise<PortfolioDetails | null> {
  const response = await getBackendJson(`/loan/portfolios/${id}/details`, {
    headers: getAuthHeaders(accessToken),
  });
  if (response.status === 404) return null;
  if (!response.ok) return null;
  const body = await readBackendBody<any>(response);
  if (!body || typeof body !== "object") return null;
  return (body.data ?? body) as PortfolioDetails;
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  const { loaneeId, portfolioId } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) notFound();

  let portfolio: LoanPortfolio | null = null;
  let details: PortfolioDetails | null = null;
  let fetchError: string | null = null;

  try {
    [portfolio, details] = await Promise.all([
      getPortfolio(portfolioId, accessToken),
      getPortfolioDetails(portfolioId, accessToken),
    ]);
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
          <div className="flex items-center gap-4">
            {portfolio.loanee ? (
              portfolio.loanee.photoUrl ? (
                <img
                  src={portfolio.loanee.photoUrl}
                  alt={`${portfolio.loanee.firstName} ${portfolio.loanee.lastName}`}
                  className="h-16 w-16 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-border"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                  <span className="text-xl font-semibold">
                    {portfolio.loanee.firstName?.[0]}
                    {portfolio.loanee.lastName?.[0]}
                  </span>
                </div>
              )
            ) : null}
            
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {portfolio.loanee
                  ? `${portfolio.loanee.firstName} ${portfolio.loanee.lastName}'s Portfolio`
                  : details?.loaneeName
                    ? `${details.loaneeName}'s Portfolio`
                    : "Portfolio Detail"}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {(portfolio.loanId || details?.loanId) && (
                  <span>Loan {portfolio.loanId || details?.loanId}</span>
                )}
                {portfolio.accountNumber && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span>Account {portfolio.accountNumber}</span>
                  </>
                )}
                <span className="text-muted-foreground/50">•</span>
                <span>
                  ID: <span className="font-mono">{portfolioId}</span>
                </span>

                {portfolio.loanOfficer && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span>
                      Officer:{" "}
                      <span className="font-medium text-foreground">
                        {portfolio.loanOfficer.fullName ||
                          `${portfolio.loanOfficer.firstName} ${portfolio.loanOfficer.lastName}`}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Summary KPI cards — client component (fetches /details and /summary) */}
          <PortfolioSummaryCard
            portfolioId={portfolioId}
            nextDueDate={portfolio.nextDueDate}
          />

          {/* Schedule panel */}
          <SchedulePanel portfolioId={portfolioId} />

          {/* Repayments panel */}
          <RepaymentPanel portfolioId={portfolioId} />
        </>
      ) : null}
    </div>
  );
}
