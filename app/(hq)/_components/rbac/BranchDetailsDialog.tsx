"use client";

import { useState } from "react";
import { Building2, Landmark, Mail, MapPin, Trash2, UserRound } from "lucide-react";
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
import { useDeleteBranchMutation } from "@/hooks/rbac/useDeleteBranchMutation";
import { useBranchStatusMutation } from "@/hooks/rbac/useBranchStatusMutation";
import { useUnassignBranchManagerMutation } from "@/hooks/rbac/useUnassignBranchManagerMutation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RbacBranch, RbacBranchStatus } from "@/types/rbac";

const STATUS_OPTIONS: { value: RbacBranchStatus; label: string; description: string }[] = [
  { value: "ACTIVE", label: "Active", description: "Branch is open and accepting accounts" },
  { value: "PENDING_ACTIVATION", label: "Pending activation", description: "Branch is set up but not yet trading" },
  { value: "SUSPENDED", label: "Suspended", description: "Operations paused; data is preserved" },
  { value: "CLOSED", label: "Closed", description: "Permanent ΓÇö branch stops accepting new accounts" },
];

function getManagerName(branch: RbacBranch) {
  const manager = branch.manager;
  const fullName = manager?.fullName?.trim();
  if (fullName) {
    return fullName;
  }

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
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  const normalized = typeof value === "string" ? Number(value) : Number(value);

  if (!Number.isFinite(normalized)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(normalized);
}

function formatCollectionRate(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Not available";
  }

  return `${value.toFixed(1)}%`;
}

interface BranchDetailsDialogProps {
  branch: RbacBranch | null;
  onOpenChange: (open: boolean) => void;
  onAddManager: (branch: RbacBranch) => void;
}

export function BranchDetailsDialog({ branch, onOpenChange, onAddManager }: BranchDetailsDialogProps) {
  const managerName = branch ? (branch.managerName || getManagerName(branch)) : "Unassigned";
  const hasManager = Boolean(branch?.managerId || branch?.manager);
  const deleteBranchMutation = useDeleteBranchMutation();
  const unassignManagerMutation = useUnassignBranchManagerMutation();
  const statusMutation = useBranchStatusMutation();
  const [pendingStatus, setPendingStatus] = useState<RbacBranchStatus | "">("");
  const [statusReason, setStatusReason] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const configCards = branch
    ? [
      { label: "Total exposure", value: formatCurrency(branch.totalExposure) },
      {
        label: "Active loans",
        value:
          typeof branch.activeLoans === "number"
            ? String(branch.activeLoans)
            : "Not specified",
      },
      {
        label: "Collection rate",
        value: formatCollectionRate(branch.collectionRate),
      },
      {
        label: "Active officers",
        value:
          typeof branch.activeOfficers === "number"
            ? String(branch.activeOfficers)
            : "Not specified",
      },
    ]
    : [];

  return (
    <Dialog open={Boolean(branch)} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden bg-card p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
          <div className="flex items-start gap-3 pr-6">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate">{branch?.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {branch?.code || "No branch code"}
              </DialogDescription>
            </div>
            {branch ? (
              <Badge variant="outline" className="ml-auto shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700">
                {branch.statusLabel || branch.status || "Active"}
              </Badge>
            ) : null}
          </div>
        </DialogHeader>

        {branch ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-5">
              <div className="grid gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-4">
                {configCards.map((item) => (
                  <div key={item.label} className="min-w-0 border-b border-border/60 px-2 py-2 last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{item.label}</p>
                    <p className="mt-2 break-words text-lg font-semibold tracking-tight text-foreground">{item.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Branch performance</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted p-4">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Location</p>
                  <p className="mt-2 flex items-start gap-2 text-sm font-medium text-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    {getBranchAddress(branch)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted p-4">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Branch type</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    {branch.isHeadOffice ? <Landmark className="size-4 text-primary" /> : <Building2 className="size-4 text-muted-foreground" />}
                    {branch.type ? branch.type.replace("_", " ") : branch.isHeadOffice ? "Head office" : "Branch"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4 text-sm sm:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Status</p>
                      <p className="mt-2 font-medium text-foreground">{branch.statusLabel || branch.status || "ACTIVE"}</p>
                    </div>
                    <AlertDialog open={statusDialogOpen} onOpenChange={(open) => { setStatusDialogOpen(open); if (!open) { setPendingStatus(""); setStatusReason(""); } }}>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="h-8 text-xs">
                          Change status
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
                            <Select value={pendingStatus} onValueChange={(v) => setPendingStatus(v as RbacBranchStatus)}>
                              <SelectTrigger id="branch-status-select">
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                              <SelectContent className="bg-card">
                                {STATUS_OPTIONS.filter((o) => o.value !== branch.status).map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    <span className="font-medium">{opt.label}</span>
                                    <span className="ml-2 text-xs text-muted-foreground">{opt.description}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="branch-status-reason">Reason <span className="text-muted-foreground">(optional)</span></Label>
                            <Input
                              id="branch-status-reason"
                              placeholder="e.g. Consolidating operations into Lagos Mainland"
                              value={statusReason}
                              onChange={(e) => setStatusReason(e.target.value)}
                            />
                          </div>
                          {statusMutation.isError ? (
                            <p className="text-sm text-destructive">{statusMutation.error.message}</p>
                          ) : null}
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={statusMutation.isPending}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={statusMutation.isPending || !pendingStatus}
                            onClick={async (event) => {
                              event.preventDefault();
                              const branchId = branch.id || branch._id;
                              if (!branchId || !pendingStatus) return;
                              await statusMutation.mutateAsync({
                                branchId,
                                status: pendingStatus,
                                reason: statusReason.trim() || undefined,
                              });
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
                  </div>
                </div>
                <div className="rounded-xl border border-border p-4 text-sm">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Regional zone</p>
                  <p className="mt-2 font-medium text-foreground">{branch.regionalZone || "Not specified"}</p>
                </div>
                <div className="rounded-xl border border-border p-4 text-sm">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">City</p>
                  <p className="mt-2 font-medium text-foreground">{branch.city || "Not specified"}</p>
                </div>
                <div className="rounded-xl border border-border p-4 text-sm">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Country</p>
                  <p className="mt-2 font-medium text-foreground">{branch.country || "Not specified"}</p>
                </div>
                <div className="rounded-xl border border-border p-4 text-sm sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Parent branch</p>
                  <p className="mt-2 font-medium text-foreground">{branch.parentBranchId || "Not assigned"}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Branch manager</p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <UserRound className="size-4 text-muted-foreground" />
                      {managerName}
                    </p>
                    {branch.manager?.email ? (
                      <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="size-3.5" />
                        {branch.manager.email}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={hasManager ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
                      {hasManager ? "Assigned" : "Unassigned"}
                    </Badge>
                    {hasManager ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive">
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
                                const branchId = branch.id || branch._id;
                                if (!branchId) {
                                  return;
                                }
                                await unassignManagerMutation.mutateAsync({ branchId, removeFromBranch: false });
                                onOpenChange(false);
                              }}
                            >
                              {unassignManagerMutation.isPending ? "Unassigning..." : "Unassign manager"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : null}
                  </div>
                </div>
                {!hasManager ? (
                  <Button
                    type="button"
                    className="mt-4 w-full bg-brand hover:bg-brand-hover"
                    onClick={() => onAddManager(branch)}
                  >
                    <UserRound className="size-4" />
                    Add branch manager
                  </Button>
                ) : null}
              </div>

            </div>
          </div>
        ) : null}

        <DialogFooter className="shrink-0 border-t border-border px-6 py-4 sm:justify-between">
          {branch ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="size-4" />
                  Delete branch
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
                  <p className="text-sm text-destructive">{deleteBranchMutation.error.message}</p>
                ) : null}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteBranchMutation.isPending}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={deleteBranchMutation.isPending}
                    onClick={async (event) => {
                      event.preventDefault();
                      await deleteBranchMutation.mutateAsync(branch.id || branch._id || "");
                      onOpenChange(false);
                    }}
                  >
                    {deleteBranchMutation.isPending ? "Deleting..." : "Delete branch"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}