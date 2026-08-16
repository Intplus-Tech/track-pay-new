"use client";

import { useRouter } from "next/navigation";
import { Building2, Landmark, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeleteBranchMutation } from "@/hooks/rbac/useDeleteBranchMutation";
import type { RbacBranch } from "@/types/rbac";
import { STATUS_META } from "./constants";

export function BranchHeader({
  branch,
  onEditClick,
}: {
  branch: RbacBranch | null;
  onEditClick: () => void;
}) {
  const router = useRouter();
  const deleteBranchMutation = useDeleteBranchMutation();

  const branchStatus = (branch?.status ?? "ACTIVE") as keyof typeof STATUS_META;
  const statusMeta = STATUS_META[branchStatus] ?? STATUS_META.ACTIVE;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {branch?.isHeadOffice ? <Landmark className="size-4" /> : <Building2 className="size-4" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h1 className="text-sm font-bold uppercase tracking-tight text-card-foreground truncate">
              {branch?.name ?? "Branch detail"}
            </h1>
            {branch?.isHeadOffice ? (
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-[10px] text-primary">
                <Landmark />
                Head office
              </Badge>
            ) : null}
            {branch ? (
              <Badge variant="outline" className={`${statusMeta.className} text-[10px]`}>
                {branch.statusLabel || statusMeta.label}
              </Badge>
            ) : null}
          </div>
          {branch?.code ? (
            <p className="text-[11px] text-muted-foreground">{branch.code}</p>
          ) : null}
        </div>
      </div>

      {branch ? (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEditClick}
            className="h-8 px-3 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
          >
            Edit branch
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 shrink-0 text-red-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {branch.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the branch from the branch matrix. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteBranchMutation.isError ? (
                <p className="text-sm text-red-600">{deleteBranchMutation.error.message}</p>
              ) : null}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteBranchMutation.isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={deleteBranchMutation.isPending}
                  onClick={async (event) => {
                    event.preventDefault();
                    await deleteBranchMutation.mutateAsync(branch.id || branch._id || "");
                    router.push("/home/branch-matrix");
                  }}
                >
                  {deleteBranchMutation.isPending ? "Deleting..." : "Delete branch"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : null}
    </div>
  );
}
