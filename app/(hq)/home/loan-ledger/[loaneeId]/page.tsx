import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, Mail, Phone, Hash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AUTH_ACCESS_TOKEN_COOKIE } from "@/lib/auth";
import { getBackendJson, readBackendBody } from "@/lib/backend";
import { getAuthHeaders } from "@/lib/api-auth";
import PortfolioTable from "@/components/loan/PortfolioTable";
import type { Loanee } from "@/types/loan";

interface PageProps {
  params: Promise<{ loaneeId: string }>;
}

async function getLoanee(id: string, accessToken: string): Promise<Loanee | null> {
  const response = await getBackendJson(`/loan/loanees/${id}`, {
    headers: getAuthHeaders(accessToken),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Unable to load loanee.");
  const body = await readBackendBody<any>(response);
  if (!body || typeof body !== "object") return null;
  return (body.data ?? body) as Loanee;
}

export default async function LoaneeDetailPage({ params }: PageProps) {
  const { loaneeId } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) notFound();

  let loanee: Loanee | null = null;
  let fetchError: string | null = null;

  try {
    loanee = await getLoanee(loaneeId, accessToken);
  } catch (error) {
    fetchError = error instanceof Error ? error.message : "Unknown error";
  }

  if (!loanee && !fetchError) notFound();

  const name = loanee
    ? [loanee.firstName, loanee.middleName, loanee.lastName]
        .filter(Boolean)
        .join(" ")
    : "Loanee";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/home/loan-ledger"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Loan Ledger
      </Link>

      {fetchError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
          {fetchError}
        </div>
      ) : loanee ? (
        <>
          {/* Profile Card */}
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center bg-card border rounded-xl p-6 shadow-sm">
            <Avatar className="h-16 w-16 border shadow-sm">
              {loanee.photoUrl && <AvatarImage src={loanee.photoUrl} alt={name} />}
              <AvatarFallback className="text-lg bg-primary/10 text-primary font-medium">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{name}</h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5">
                  <Hash className="h-4 w-4" />
                  <span>{loanee.loaneeNumber}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  <span>{loanee.email}</span>
                </div>
                {loanee.phoneNumber && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    <span>{loanee.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Portfolios */}
          <section className="space-y-2">
            <h2 className="text-base font-semibold leading-none tracking-tight">
              Loan Portfolios
            </h2>
            <p className="text-sm text-muted-foreground">
              All active and closed loan portfolios for this loanee.
            </p>
            <PortfolioTable loaneeId={loaneeId} />
          </section>
        </>
      ) : null}
    </div>
  );
}
