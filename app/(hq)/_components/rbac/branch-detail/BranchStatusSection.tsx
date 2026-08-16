"use client";

import { useState } from "react";
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
import { useBranchStatusMutation } from "@/hooks/rbac/useBranchStatusMutation";
import type { RbacBranch, RbacBranchStatus } from "@/types/rbac";
import { STATUS_META, STATUS_OPTIONS } from "./constants";
import { Section } from "./shared";

export function BranchStatusSection({
  branch,
  onStatusChanged,
}: {
  branch: RbacBranch;
  onStatusChanged: () => void;
}) {
  const statusMutation = useBranchStatusMutation();

  const [pendingStatus, setPendingStatus] = useState<RbacBranchStatus | "">("");
  const [statusReason, setStatusReason] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const branchStatus = (branch.status ?? "ACTIVE") as RbacBranchStatus;
  const statusMeta = STATUS_META[branchStatus] ?? STATUS_META.ACTIVE;

  return (
    <Section title="Status">
      <div className="space-y-2 py-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className={`${statusMeta.className} text-[11px]`}>
            {branch.statusLabel || statusMeta.label}
          </Badge>
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
                className="h-6 px-2 text-[11px] text-primary hover:bg-primary/10"
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
                    onStatusChanged();
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
        <p className="text-[11px] leading-5 text-muted-foreground">
          {STATUS_OPTIONS.find((o) => o.value === branchStatus)?.description}
        </p>
      </div>
    </Section>
  );
}
