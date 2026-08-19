import type { RbacBranch } from "@/types/rbac";

export function getManagerName(branch: RbacBranch) {
  const manager = branch.manager;
  const fullName = manager?.fullName?.trim();
  if (fullName) return fullName;
  const personalName = [manager?.firstName, manager?.middleName, manager?.lastName]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .trim();
  return personalName || branch.managerId || "Unassigned";
}

export function getBranchAddress(branch: RbacBranch) {
  const parts = [branch.addressLabel, branch.city, branch.state, branch.country]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.trim());
  return parts.length > 0 ? parts.join(", ") : branch.location || "Location unavailable";
}



export function formatCollectionRate(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${value.toFixed(1)}%`;
}

/** Truncates a long ID to `prefix…suffix` format for display. */
export function truncateId(id: string, prefixLen = 8, suffixLen = 4): string {
  if (id.length <= prefixLen + suffixLen + 1) return id;
  return `${id.slice(0, prefixLen)}…${id.slice(-suffixLen)}`;
}
