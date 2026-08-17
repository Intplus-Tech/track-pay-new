"use client";

import { Mail, UserRound } from "lucide-react";
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
import { useUnassignBranchManagerMutation } from "@/hooks/rbac/useUnassignBranchManagerMutation";
import type { RbacBranch } from "@/types/rbac";
import { Section } from "./shared";
import { getManagerName } from "./utils";

export function BranchManagerSection({
  branch,
  onAssignClick,
  onUnassigned,
}: {
  branch: RbacBranch;
  onAssignClick: () => void;
  onUnassigned: () => void;
}) {
  const unassignManagerMutation = useUnassignBranchManagerMutation();

  const managerName = branch.managerName || getManagerName(branch);
  const hasManager = Boolean(branch.managerId || branch.manager);

  return (
    <Section
      title="Branch manager"
      action={
        hasManager ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                Unassign
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Unassign {managerName}?</AlertDialogTitle>
                <AlertDialogDescription>
                  The manager will lose the branch manager role. Their user account and branch membership will remain unchanged.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={unassignManagerMutation.isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={unassignManagerMutation.isPending}
                  onClick={async (event) => {
                    event.preventDefault();
                    const id = branch.id || branch._id;
                    if (!id) return;
                    await unassignManagerMutation.mutateAsync({
                      branchId: id,
                      removeFromBranch: false,
                    });
                    onUnassigned();
                  }}
                >
                  {unassignManagerMutation.isPending ? "Unassigning..." : "Unassign manager"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px] text-blue-600 hover:bg-blue-50"
            onClick={onAssignClick}
          >
            Assign
          </Button>
        )
      }
    >
      <div className="space-y-2 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <UserRound className="size-3.5 text-muted-foreground shrink-0" />
          <span>{managerName}</span>
        </div>
        {branch.manager?.email ? (
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Mail className="size-3 shrink-0" />
            {branch.manager.email}
          </p>
        ) : null}
        {/* {hasManager ? (
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[10px]">
            Assigned
          </Badge>
        ) : null} */}
      </div>
    </Section>
  );
}
