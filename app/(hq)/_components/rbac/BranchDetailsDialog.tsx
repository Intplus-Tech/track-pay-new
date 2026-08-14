"use client";

import { Building2, Landmark, Mail, MapPin, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RbacBranch } from "@/types/rbac";

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

interface BranchDetailsDialogProps {
  branch: RbacBranch | null;
  onOpenChange: (open: boolean) => void;
  onAddManager: (branch: RbacBranch) => void;
}

export function BranchDetailsDialog({ branch, onOpenChange, onAddManager }: BranchDetailsDialogProps) {
  const managerName = branch ? getManagerName(branch) : "Unassigned";
  const hasManager = Boolean(branch?.managerId || branch?.manager);

  return (
    <Dialog open={Boolean(branch)} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate">{branch?.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {branch?.code || "No branch code"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {branch ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Location</p>
                <p className="mt-2 flex items-start gap-2 text-sm font-medium text-slate-800">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  {branch.location || "Location unavailable"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Branch type</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-800">
                  {branch.isHeadOffice ? <Landmark className="size-4 text-blue-600" /> : <Building2 className="size-4 text-slate-400" />}
                  {branch.isHeadOffice ? "Head office" : "Branch"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Branch manager</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <UserRound className="size-4 text-slate-400" />
                    {managerName}
                  </p>
                  {branch.manager?.email ? (
                    <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="size-3.5" />
                      {branch.manager.email}
                    </p>
                  ) : null}
                </div>
                <Badge variant="outline" className={hasManager ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
                  {hasManager ? "Assigned" : "Unassigned"}
                </Badge>
              </div>
              {!hasManager ? (
                <Button
                  type="button"
                  className="mt-4 w-full bg-[#075ee8] hover:bg-[#0452cc]"
                  onClick={() => onAddManager(branch)}
                >
                  <UserRound className="size-4" />
                  Add branch manager
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}