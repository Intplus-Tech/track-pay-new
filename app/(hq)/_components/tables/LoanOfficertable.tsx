"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import {
  loanOfficerColumns,
  type LoanOfficerTableMeta,
} from "@/components/data-table/columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateLoanOfficerForm } from "@/components/forms/CreateLoanOfficerForm";
import { ReassignLoansDialog } from "@/components/loan-officers/ReassignLoansDialog";
import { useLoanOfficersQuery } from "@/hooks/loan-officers/useLoanOfficersQuery";
import { useUpdateAvailabilityMutation } from "@/hooks/loan-officers/useUpdateAvailabilityMutation";
import { useBranchesQuery } from "@/hooks/rbac/useBranchesQuery";
import { queryJson } from "@/lib/query/fetcher";
import {
  DEFAULT_LOAN_OFFICER_LIST_QUERY,
  type LoanOfficer,
  type LoanOfficerListQuery,
  type OfficerLoan,
  type OfficerLoansResponse,
} from "@/types/loan-officer";
import { UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function LoanOfficerTable() {
  const router = useRouter();

  const [query, setQuery] = useState<LoanOfficerListQuery>(
    DEFAULT_LOAN_OFFICER_LIST_QUERY,
  );
  const [draftSearch, setDraftSearch] = useState("");

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [reassignOfficer, setReassignOfficer] = useState<LoanOfficer | null>(null);
  const [reassignLoans, setReassignLoans] = useState<OfficerLoan[]>([]);
  const [reassignLoansLoading, setReassignLoansLoading] = useState(false);

  // Data
  const officersQuery = useLoanOfficersQuery(query);
  const branchesQuery = useBranchesQuery();
  const availabilityMutation = useUpdateAvailabilityMutation();

  const officers = officersQuery.data?.data ?? [];
  const totalPages = Math.ceil(
    (officersQuery.data?.total ?? 0) / query.limit,
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const applySearch = () => {
    setQuery((q) => ({ ...q, search: draftSearch, page: 1 }));
  };

  const handleViewSnapshot = (officer: LoanOfficer) => {
    router.push(`/home/loan-officer/${officer.id}`);
  };

  const handleReassign = async (officer: LoanOfficer) => {
    setReassignOfficer(officer);
    setReassignLoans([]);
    setReassignLoansLoading(true);
    try {
      const data = await queryJson<OfficerLoansResponse>(
        `/api/loan-officers/${officer.id}/loans?limit=200`,
        "Unable to load officer loans.",
      );
      setReassignLoans(data?.data ?? []);
    } catch {
      setReassignLoans([]);
    } finally {
      setReassignLoansLoading(false);
    }
  };

  const handleToggleAvailability = (officer: LoanOfficer) => {
    const next =
      officer.availabilityStatus === "ACTIVE" ? "UNAVAILABLE" : "ACTIVE";
    availabilityMutation.mutate({
      officerId: officer.id ?? "",
      payload: { availabilityStatus: next },
    });
  };

  const tableMeta: LoanOfficerTableMeta = {
    onViewSnapshot: handleViewSnapshot,
    onReassign: handleReassign,
    onToggleAvailability: handleToggleAvailability,
    updatingAvailabilityId: availabilityMutation.isPending
      ? availabilityMutation.variables?.officerId
      : null,
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-xl border bg-card p-3 shadow-sm">
        <form
          className="flex items-center gap-2 "
          onSubmit={(e) => {
            e.preventDefault();
            applySearch();
          }}
        >
          <Input
            placeholder="Search officers…"
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            aria-label="Search loan officers"
            className="lg:col-span-2"
          />

          <Select
            value={query.branchId}
            onValueChange={(v) =>
              setQuery((q) => ({ ...q, branchId: v, page: 1 }))
            }
          >
            <SelectTrigger aria-label="Filter by branch">
              <SelectValue placeholder="All branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches</SelectItem>
              {branchesQuery.data?.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={query.availabilityStatus}
            onValueChange={(v) =>
              setQuery((q) => ({
                ...q,
                availabilityStatus: v as LoanOfficerListQuery["availabilityStatus"],
                page: 1,
              }))
            }
          >
            <SelectTrigger aria-label="Filter by availability">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Apply
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraftSearch("");
                setQuery(DEFAULT_LOAN_OFFICER_LIST_QUERY);
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </div>

      {/* Error */}
      {officersQuery.isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
          {officersQuery.error.message}
        </div>
      )}

      {/* Table */}
      <div>
        {officersQuery.isPending ? (
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <Card className="relative px-4">
            <Button
              onClick={() => setCreateOpen(true)}
              className="absolute"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Officer
            </Button>
            <DataTable
              columns={loanOfficerColumns}
              data={officers}
              meta={tableMeta}
              searchConfig={{ enabled: false }}
              durationConfig={{ enabled: false }}
              exportConfig={{ enabled: true, options: ["excel"] }}
              paginationConfig={{
                enabled: true,
                pageSizeOptions: [10, 20, 50],
              }}
            />
          </Card>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {query.page} of {totalPages}
          </span>
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

      {/* Create officer dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Add New Loan Officer</DialogTitle>
          <CreateLoanOfficerForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Reassign dialog */}
      {reassignOfficer && (
        <ReassignLoansDialog
          open={!!reassignOfficer}
          onOpenChange={(open) => {
            if (!open) setReassignOfficer(null);
          }}
          sourceOfficer={reassignOfficer}
          loans={reassignLoans}
          loansLoading={reassignLoansLoading}
        />
      )}
    </div>
  );
}
