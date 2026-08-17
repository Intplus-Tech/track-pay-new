"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import {
  loaneeColumns,
  type LoaneeTableMeta,
} from "@/components/data-table/columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateLoaneeForm } from "@/components/forms/CreateLoaneeForm";
import { EditLoaneeForm } from "@/components/forms/EditLoaneeForm";
import { useLoaneeListQuery } from "@/hooks/loan/useLoaneeListQuery";
import { useDeleteLoaneeMutation } from "@/hooks/loan/useDeleteLoaneeMutation";
import {
  DEFAULT_LOANEE_LIST_QUERY,
  type Loanee,
  type LoaneeListQuery,
} from "@/types/loan";
import { UserPlus, X, Loader2 } from "lucide-react";

export default function LoaneeTable() {
  const router = useRouter();

  const [query, setQuery] = useState<LoaneeListQuery>(DEFAULT_LOANEE_LIST_QUERY);
  const [draftFilters, setDraftFilters] = useState<Partial<LoaneeListQuery>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loaneeToEdit, setLoaneeToEdit] = useState<Loanee | null>(null);
  const [loaneeToDelete, setLoaneeToDelete] = useState<Loanee | null>(null);

  const loaneesQuery = useLoaneeListQuery(query);
  const deleteMutation = useDeleteLoaneeMutation();

  const loanees = loaneesQuery.data?.data ?? [];
  const totalPages = Math.ceil(
    (loaneesQuery.data?.total ?? 0) / query.limit,
  );

  const applySearch = () => {
    setQuery((q) => ({ ...q, ...draftFilters, page: 1 }));
  };

  const handleViewPortfolios = (loanee: Loanee) => {
    router.push(`/home/loan-ledger/${loanee.id || loanee._id}`);
  };

  const handleDelete = (loanee: Loanee) => {
    setLoaneeToDelete(loanee);
  };

  const handleEdit = (loanee: Loanee) => {
    setLoaneeToEdit(loanee);
    setEditOpen(true);
  };

  const tableMeta: LoaneeTableMeta = {
    onEdit: handleEdit,
    onViewPortfolios: handleViewPortfolios,
    onDelete: handleDelete,
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            applySearch();
          }}
        >
          <div className="grid lg:grid-cols-6 sm:grid-cols-3 grid-cols-1 gap-2">
            <Input
              placeholder="Loanee Number"
              value={draftFilters.loaneeNumber ?? ""}
              onChange={(e) => setDraftFilters({ ...draftFilters, loaneeNumber: e.target.value })}
              aria-label="Filter by Loanee Number"
            // className="w-fit"
            />
            <Input
              placeholder="First Name"
              value={draftFilters.firstName ?? ""}
              onChange={(e) => setDraftFilters({ ...draftFilters, firstName: e.target.value })}
              aria-label="Filter by First Name"
            // className="w-fit"
            />
            <Input
              placeholder="Last Name"
              value={draftFilters.lastName ?? ""}
              onChange={(e) => setDraftFilters({ ...draftFilters, lastName: e.target.value })}
              aria-label="Filter by Last Name"
            // className="w-fit"
            />
            <Input
              placeholder="Email"
              value={draftFilters.email ?? ""}
              onChange={(e) => setDraftFilters({ ...draftFilters, email: e.target.value })}
              aria-label="Filter by Email"
            // className="w-fit"
            />
            <Input
              placeholder="Phone Number"
              value={draftFilters.phoneNumber ?? ""}
              onChange={(e) => setDraftFilters({ ...draftFilters, phoneNumber: e.target.value })}
              aria-label="Filter by Phone Number"
            // className="w-fit"
            />
            <div className="flex gap-2 w-full ">
              <Button className="w-full max-w-[80%]" type="submit">Apply Filters</Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setDraftFilters({});
                  setQuery(DEFAULT_LOANEE_LIST_QUERY);
                }}
              >
                <X />
              </Button>
            </div>
          </div>
        </form>
      </div>

      {loaneesQuery.isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
          {loaneesQuery.error.message}
        </div>
      )}

      <div>
        {loaneesQuery.isPending ? (
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
              className="absolute top-4 right-4"
              size="sm"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              New Loanee
            </Button>
            <DataTable
              columns={loaneeColumns}
              data={loanees}
              meta={tableMeta}
              searchConfig={{ enabled: false }}
              durationConfig={{ enabled: false }}
              exportConfig={{ enabled: false, options: [] }}
              paginationConfig={{
                enabled: true,
                pageSizeOptions: [10, 20, 50],
              }}
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Add New Loanee</DialogTitle>
          <CreateLoaneeForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(open) => {
        setEditOpen(open);
        if (!open) setLoaneeToEdit(null);
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Edit Loanee</DialogTitle>
          {loaneeToEdit && (
            <EditLoaneeForm loanee={loaneeToEdit} onSuccess={() => setEditOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!loaneeToDelete} onOpenChange={(open) => !open && setLoaneeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete loanee <strong>{loaneeToDelete?.firstName} {loaneeToDelete?.lastName}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <Button
              variant={"destructive"}
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (loaneeToDelete) {
                  deleteMutation.mutate((loaneeToDelete.id || loaneeToDelete._id)!, {
                    onSuccess: () => {
                      setLoaneeToDelete(null);
                    },
                  });
                }
              }}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
