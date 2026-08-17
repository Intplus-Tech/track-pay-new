import type { RbacBranchStatus } from "@/types/rbac";

export const STATUS_OPTIONS: { value: RbacBranchStatus; label: string; description: string }[] = [
  { value: "ACTIVE", label: "Active", description: "Branch is open and accepting accounts" },
  { value: "PENDING_ACTIVATION", label: "Pending activation", description: "Branch is set up but not yet trading" },
  { value: "SUSPENDED", label: "Suspended", description: "Operations paused; data is preserved" },
  { value: "CLOSED", label: "Closed", description: "Permanent - branch stops accepting new accounts" },
];

export const STATUS_META: Record<RbacBranchStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  PENDING_ACTIVATION: { label: "Pending activation", className: "border-amber-200 bg-amber-50 text-amber-700" },
  SUSPENDED: { label: "Suspended", className: "border-orange-200 bg-orange-50 text-orange-700" },
  CLOSED: { label: "Closed", className: "border-border bg-muted text-muted-foreground" },
};
