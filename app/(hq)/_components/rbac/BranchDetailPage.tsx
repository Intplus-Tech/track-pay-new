"use client";

import { useState } from "react";
import { InlineMessage } from "@/app/(hq)/_components/rbac/shared";
import { AddBranchManagerDialog } from "@/app/(hq)/_components/rbac/AddBranchManagerDialog";
import { EditBranchDialog } from "@/app/(hq)/_components/rbac/EditBranchDialog";
import { useBranchDetailQuery } from "@/hooks/rbac/useBranchDetailQuery";
import { useBranchConfigurationQuery } from "@/hooks/rbac/useBranchConfigurationQuery";
import { useBranchesQuery } from "@/hooks/rbac/useBranchesQuery";
import type { RbacBranch } from "@/types/rbac";

import { BranchHeader } from "./branch-detail/BranchHeader";
import { BranchStats } from "./branch-detail/BranchStats";
import { BranchLocation } from "./branch-detail/BranchLocation";
import { BranchStatusSection } from "./branch-detail/BranchStatusSection";
import { BranchAudit } from "./branch-detail/BranchAudit";
import { BranchManagerSection } from "./branch-detail/BranchManagerSection";
import { BranchTransactions } from "./branch-detail/BranchTransactions";

export default function BranchDetailPage({ branchId }: { branchId: string }) {
  const branchQuery = useBranchDetailQuery(branchId);
  const branchesQuery = useBranchesQuery();
  const { data: branchConfiguration = [] } = useBranchConfigurationQuery();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addManagerOpen, setAddManagerOpen] = useState(false);

  const rawBranch = branchQuery.data ?? null;

  const branch: RbacBranch | null = (() => {
    if (!rawBranch) return null;
    const configMatch = branchConfiguration.find((item) => {
      const r = item as Record<string, unknown>;
      const cBranchId = typeof r.branchId === "string" ? r.branchId : undefined;
      const cId = typeof r.id === "string" ? r.id : undefined;
      return Boolean(
        (cBranchId && (cBranchId === rawBranch.id || cBranchId === rawBranch._id)) ||
        (cId && (cId === rawBranch.id || cId === rawBranch._id)),
      );
    });
    if (!configMatch) return rawBranch;
    const r = configMatch as Record<string, unknown>;
    return {
      ...rawBranch,
      location: typeof r.location === "string" ? r.location : rawBranch.location,
      regionalZone: typeof r.regionalZone === "string" ? r.regionalZone : rawBranch.regionalZone,
      managerId: typeof r.managerId === "string" ? r.managerId : rawBranch.managerId,
      managerName: typeof r.managerName === "string" ? r.managerName : rawBranch.managerName,
      activeOfficers: typeof r.activeOfficers === "number" ? r.activeOfficers : rawBranch.activeOfficers,
      activeLoans: typeof r.activeLoans === "number" ? r.activeLoans : rawBranch.activeLoans,
      totalExposure:
        typeof r.totalExposure === "string" || typeof r.totalExposure === "number"
          ? r.totalExposure
          : rawBranch.totalExposure,
      collectionRate: typeof r.collectionRate === "number" ? r.collectionRate : rawBranch.collectionRate,
      status: typeof r.status === "string" ? (r.status as RbacBranch["status"]) : rawBranch.status,
      statusLabel: typeof r.statusLabel === "string" ? r.statusLabel : rawBranch.statusLabel,
    } satisfies RbacBranch;
  })();

  const parentBranchLabel =
    branch?.parentBranchId && branchesQuery.data
      ? branchesQuery.data.find((candidate) => candidate.id === branch.parentBranchId || candidate._id === branch.parentBranchId)?.name ??
      branch.parentBranchId
      : branch?.parentBranchId ?? "No parent branch";

  return (
    <>
      <div className="min-h-full bg-surface-tint -m-6 p-4 sm:p-6 space-y-4">
        <BranchHeader
          branch={branch}
          onEditClick={() => setEditDialogOpen(true)}
        />

        {branchQuery.isLoading ? <InlineMessage tone="info" message="Loading branch..." /> : null}
        {branchQuery.isError ? (
          <InlineMessage
            tone="error"
            message={branchQuery.error instanceof Error ? branchQuery.error.message : "Unable to load branch."}
          />
        ) : null}

        {branch ? (
          <div className="space-y-3">
            <BranchStats branch={branch} />

            <BranchLocation branch={branch} parentBranchLabel={parentBranchLabel} />

            <div className="grid gap-3 md:grid-cols-2">
              <BranchManagerSection
                branch={branch}
                onAssignClick={() => setAddManagerOpen(true)}
                onUnassigned={() => branchQuery.refetch()}
              />
              <BranchAudit branch={branch} />
            </div>

            <BranchTransactions branchId={branchId} />
          </div>
        ) : null}
      </div>

      <EditBranchDialog
        open={editDialogOpen}
        onOpenChange={(nextOpen) => {
          setEditDialogOpen(nextOpen);
          if (!nextOpen) {
            void branchQuery.refetch();
          }
        }}
        branch={branch}
      />

      <AddBranchManagerDialog
        branch={addManagerOpen ? branch : null}
        onOpenChange={(open) => {
          if (!open) setAddManagerOpen(false);
        }}
        onCreated={async () => {
          await branchQuery.refetch();
        }}
      />
    </>
  );
}
