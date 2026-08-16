"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Landmark,
  Mail,
  MapPin,
  Trash2,
  UserRound,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InlineMessage } from "@/app/(hq)/_components/rbac/shared";
import { AddBranchManagerDialog } from "@/app/(hq)/_components/rbac/AddBranchManagerDialog";
import { useBranchDetailQuery } from "@/hooks/rbac/useBranchDetailQuery";
import { useBranchConfigurationQuery } from "@/hooks/rbac/useBranchConfigurationQuery";
import { useDeleteBranchMutation } from "@/hooks/rbac/useDeleteBranchMutation";
import { useBranchStatusMutation } from "@/hooks/rbac/useBranchStatusMutation";
import { useUnassignBranchManagerMutation } from "@/hooks/rbac/useUnassignBranchManagerMutation";
import type { RbacBranch, RbacBranchStatus } from "@/types/rbac";

const STATUS_OPTIONS: { value: RbacBranchStatus; label: string; description: string }[] = [
  { value: "ACTIVE", label: "Active", description: "Branch is open and accepting accounts" },
  { value: "PENDING_ACTIVATION", label: "Pending activation", description: "Branch is set up but not yet trading" },
  { value: "SUSPENDED", label: "Suspended", description: "Operations paused; data is preserved" },
  { value: "CLOSED", label: "Closed", description: "Permanent - branch stops accepting new accounts" },
];

const STATUS_META: Record<RbacBranchStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  PENDING_ACTIVATION: { label: "Pending activation", className: "border-amber-200 bg-amber-50 text-amber-700" },
  SUSPENDED: { label: "Suspended", className: "border-orange-200 bg-orange-50 text-orange-700" },
  CLOSED: { label: "Closed", className: "border-slate-200 bg-slate-100 text-slate-600" },
};

function getManagerName(branch: RbacBranch) {
  const manager = branch.manager;
  const fullName = manager?.fullName?.trim();
  if (fullName) return fullName;
  const personalName = [manager?.firstName, manager?.middleName, manager?.lastName]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .trim();
  return personalName || branch.managerId || "Unassigned";
}

function getBranchAddress(branch: RbacBranch) {
  const parts = [branch.addressLabel, branch.city, branch.state, branch.country]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.trim());
  return parts.length > 0 ? parts.join(", ") : branch.location || "Location unavailable";
}

function formatCurrency(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(normalized);
}

function formatCollectionRate(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${value.toFixed(1)}%`;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-xs">
      <span className="shrink-0 font-medium text-slate-500">{label}</span>
      <span className="text-right text-slate-800 break-words max-w-[60%]">
        {value ?? <span className="text-slate-400">-</span>}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
        {action}
      </div>
      <div className="divide-y divide-slate-100 px-4">{children}</div>
    </div>
  );
}

export default function BranchDetailPage({ branchId }: { branchId: string }) {
  const router = useRouter();
  const branchQuery = useBranchDetailQuery(branchId);
  const { data: branchConfiguration = [] } = useBranchConfigurationQuery();
  const deleteBranchMutation = useDeleteBranchMutation();
  const unassignManagerMutation = useUnassignBranchManagerMutation();
  const statusMutation = useBranchStatusMutation();

  const [pendingStatus, setPendingStatus] = useState<RbacBranchStatus | "">("");
  const [statusReason, setStatusReason] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
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

  const managerName = branch ? (branch.managerName || getManagerName(branch)) : "Unassigned";
  const hasManager = Boolean(branch?.managerId || branch?.manager);
  const branchStatus = (branch?.status ?? "ACTIVE") as RbacBranchStatus;
  const statusMeta = STATUS_META[branchStatus] ?? STATUS_META.ACTIVE;

  return (
    <>
      <div className="min-h-full bg-[#f7f9fd] -m-6 p-4 sm:p-6 space-y-4">

        {/* Page header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push("/home/branch-matrix")}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 shrink-0"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                {branch?.isHeadOffice ? <Landmark className="size-4" /> : <Building2 className="size-4" />}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h1 className="text-sm font-bold uppercase tracking-tight text-slate-950 truncate">
                    {branch?.name ?? "Branch detail"}
                  </h1>
                  {branch?.isHeadOffice ? (
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-[10px] text-blue-700">
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
                  <p className="text-[11px] text-slate-400">{branch.code}</p>
                ) : null}
              </div>
            </div>
          </div>

          {branch ? (
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
          ) : null}
        </div>

        {branchQuery.isLoading ? <InlineMessage tone="info" message="Loading branch..." /> : null}
        {branchQuery.isError ? (
          <InlineMessage
            tone="error"
            message={branchQuery.error instanceof Error ? branchQuery.error.message : "Unable to load branch."}
          />
        ) : null}

        {branch ? (
          <div className="grid gap-3 lg:grid-cols-3">

            {/* Left column: stats + location + audit */}
            <div className="space-y-3 lg:col-span-2">

              {/* Stats bar */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: "Total exposure", value: formatCurrency(branch.totalExposure) },
                  {
                    label: "Active loans",
                    value: typeof branch.activeLoans === "number" ? String(branch.activeLoans) : "-",
                  },
                  { label: "Collection rate", value: formatCollectionRate(branch.collectionRate) },
                  {
                    label: "Active officers",
                    value: typeof branch.activeOfficers === "number" ? String(branch.activeOfficers) : "-",
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Location */}
              <Section title="Location">
                <Row label="Address" value={getBranchAddress(branch)} />
                <Row label="City" value={branch.city} />
                <Row label="State" value={branch.state} />
                <Row label="Country" value={branch.country} />
                <Row label="Regional zone" value={branch.regionalZone} />
                <Row
                  label="Branch type"
                  value={
                    branch.type
                      ? branch.type.replace("_", " ")
                      : branch.isHeadOffice
                        ? "Head office"
                        : "Branch"
                  }
                />
                <Row label="Parent branch" value={branch.parentBranchId} />
                {branch.latitude != null && branch.longitude != null ? (
                  <Row
                    label="Coordinates"
                    value={
                      <span className="flex items-center gap-1 justify-end">
                        <MapPin className="size-3 text-slate-400 shrink-0" />
                        {branch.latitude}, {branch.longitude}
                      </span>
                    }
                  />
                ) : null}
              </Section>

              {/* Audit */}
              <Section title="Audit & timestamps">
                <Row label="Branch ID" value={branch.id || branch._id} />
                <Row
                  label="Created"
                  value={branch.createdAt ? new Date(branch.createdAt).toLocaleString() : undefined}
                />
                <Row
                  label="Updated"
                  value={branch.updatedAt ? new Date(branch.updatedAt).toLocaleString() : undefined}
                />
              </Section>
            </div>

            {/* Right column: status + manager */}
            <div className="space-y-3">

              {/* Status */}
              <Section
                title="Status"
                action={
                  <AlertDialog
                    open={statusDialogOpen}
                    onOpenChange={(open) => {
                      setStatusDialogOpen(open);
                      if (!open) {
                        setPendingStatus("");
                        setStatusReason("");
                      }
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[11px] text-blue-600 hover:bg-blue-50"
                      >
                        Change
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Change branch status</AlertDialogTitle>
                        <AlertDialogDescription>
                          Update the operating state of {branch.name}. The change will be recorded on the audit trail.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-4 py-1">
                        <div className="space-y-2">
                          <Label htmlFor="branch-status-select">New status</Label>
                          <Select
                            value={pendingStatus}
                            onValueChange={(v) => setPendingStatus(v as RbacBranchStatus)}
                          >
                            <SelectTrigger id="branch-status-select">
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {STATUS_OPTIONS.filter((o) => o.value !== branch.status).map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  <span className="font-medium">{opt.label}</span>
                                  <span className="ml-2 text-xs text-slate-400">{opt.description}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="branch-status-reason">
                            Reason <span className="text-slate-400">(optional)</span>
                          </Label>
                          <Input
                            id="branch-status-reason"
                            placeholder="e.g. Consolidating operations"
                            value={statusReason}
                            onChange={(e) => setStatusReason(e.target.value)}
                          />
                        </div>
                        {statusMutation.isError ? (
                          <p className="text-sm text-red-600">{statusMutation.error.message}</p>
                        ) : null}
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={statusMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={statusMutation.isPending || !pendingStatus}
                          onClick={async (event) => {
                            event.preventDefault();
                            const id = branch.id || branch._id;
                            if (!id || !pendingStatus) return;
                            await statusMutation.mutateAsync({
                              branchId: id,
                              status: pendingStatus,
                              reason: statusReason.trim() || undefined,
                            });
                            await branchQuery.refetch();
                            setStatusDialogOpen(false);
                            setPendingStatus("");
                            setStatusReason("");
                          }}
                        >
                          {statusMutation.isPending ? "Updating..." : "Update status"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                }
              >
                <div className="py-2 space-y-1">
                  <Badge variant="outline" className={`${statusMeta.className} text-[11px]`}>
                    {branch.statusLabel || statusMeta.label}
                  </Badge>
                  <p className="text-[11px] text-slate-500">
                    {STATUS_OPTIONS.find((o) => o.value === branchStatus)?.description}
                  </p>
                </div>
              </Section>

              {/* Branch manager */}
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
                              await branchQuery.refetch();
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
                      onClick={() => setAddManagerOpen(true)}
                    >
                      Assign
                    </Button>
                  )
                }
              >
                <div className="py-2 space-y-1.5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    <UserRound className="size-3.5 text-slate-400 shrink-0" />
                    {managerName}
                  </p>
                  {branch.manager?.email ? (
                    <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Mail className="size-3 shrink-0" />
                      {branch.manager.email}
                    </p>
                  ) : null}
                  <Badge
                    variant="outline"
                    className={
                      hasManager
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]"
                        : "border-amber-200 bg-amber-50 text-amber-700 text-[10px]"
                    }
                  >
                    {hasManager ? "Assigned" : "Unassigned"}
                  </Badge>
                </div>
              </Section>
            </div>
          </div>
        ) : null}
      </div>

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
