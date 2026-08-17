"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import {
  portfolioColumns,
  type PortfolioTableMeta,
} from "@/components/data-table/columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CreatePortfolioForm } from "@/components/forms/CreatePortfolioForm";
import { ApplyPaymentForm } from "@/components/forms/ApplyPaymentForm";
import { usePortfolioListQuery } from "@/hooks/loan/usePortfolioListQuery";
import { useDeletePortfolioMutation } from "@/hooks/loan/useDeletePortfolioMutation";
import {
  DEFAULT_PORTFOLIO_LIST_QUERY,
  type LoanPortfolio,
  type PortfolioListQuery,
} from "@/types/loan";
import { PlusCircle } from "lucide-react";

interface PortfolioTableProps {
  /** When provided, filters by loanee and pre-fills the create form */
  loaneeId?: string;
}

export default function PortfolioTable({ loaneeId }: PortfolioTableProps) {
  const router = useRouter();

  const [query, setQuery] = useState<PortfolioListQuery>({
    ...DEFAULT_PORTFOLIO_LIST_QUERY,
    ...(loaneeId ? { loaneeId } : {}),
  });
  const [draftSearch, setDraftSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [paymentPortfolio, setPaymentPortfolio] = useState<LoanPortfolio | null>(null);

  const portfoliosQuery = usePortfolioListQuery(query);
  const deleteMutation = useDeletePortfolioMutation();

  const portfolios = portfoliosQuery.data?.data ?? [];
  const totalPages = Math.ceil(
    (portfoliosQuery.data?.total ?? 0) / query.limit,
  );

  const handleViewDetail = (portfolio: LoanPortfolio) => {
    if (loaneeId) {
      router.push(`/home/loan-ledger/${loaneeId}/${portfolio.id || portfolio._id}`);
    } else {
      router.push(`/home/loan-ledger/${portfolio.loaneeId}/${portfolio.id || portfolio._id}`);
    }
  };

  const handleDelete = (portfolio: LoanPortfolio) => {
    if (!confirm("Delete this portfolio? This action cannot be undone.")) return;
    deleteMutation.mutate((portfolio.id || portfolio._id)!);
  };

  const tableMeta: PortfolioTableMeta = {
    onViewDetail: handleViewDetail,
    onApplyPayment: (portfolio) => setPaymentPortfolio(portfolio),
    onDelete: handleDelete,
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-xl border bg-card p-3 shadow-sm">
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery((q) => ({ ...q, search: draftSearch, page: 1 }));
          }}
        >
          <Input
            placeholder="Search portfolios…"
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            aria-label="Search portfolios"
            className="flex-1 min-w-[180px]"
          />

          <Select
            value={query.status}
            onValueChange={(v) =>
              setQuery((q) => ({
                ...q,
                status: v as PortfolioListQuery["status"],
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-36" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="ONTIME">On Time</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button type="submit">Apply</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraftSearch("");
                setQuery({
                  ...DEFAULT_PORTFOLIO_LIST_QUERY,
                  ...(loaneeId ? { loaneeId } : {}),
                });
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </div>

      {portfoliosQuery.isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
          {portfoliosQuery.error.message}
        </div>
      )}

      <div>
        {portfoliosQuery.isPending ? (
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <Card className="relative px-4">
            <Button
              onClick={() => setCreateOpen(true)}
              className="absolute top-4 right-4"
              size="sm"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Portfolio
            </Button>
            <DataTable
              columns={portfolioColumns}
              data={portfolios}
              meta={tableMeta}
              searchConfig={{ enabled: false }}
              durationConfig={{ enabled: false }}
              exportConfig={{ enabled: false, options: [] }}
              paginationConfig={{ enabled: true, pageSizeOptions: [10, 20, 50] }}
            />
          </Card>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {query.page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={query.page <= 1}
              onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={query.page >= totalPages}
              onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create portfolio dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">New Loan Portfolio</DialogTitle>
          <CreatePortfolioForm
            loaneeId={loaneeId}
            onSuccess={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Apply payment dialog */}
      {paymentPortfolio && (
        <Dialog
          open={!!paymentPortfolio}
          onOpenChange={(open) => { if (!open) setPaymentPortfolio(null); }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="sr-only">Apply Payment</DialogTitle>
            <ApplyPaymentForm
              portfolioId={(paymentPortfolio.id || paymentPortfolio._id)!}
              onSuccess={() => setPaymentPortfolio(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
