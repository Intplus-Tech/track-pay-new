"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Landmark, MapPin, Search, UserRound, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { InlineMessage } from "@/app/(hq)/_components/rbac/shared";
import { CreateBranchDialog } from "@/app/(hq)/_components/rbac/CreateBranchDialog";
import { useBranchesQuery } from "@/hooks/rbac/useBranchesQuery";
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

/**
 * Normalises a raw location string from the backend:
 * – Adds a space after every comma that isn't already followed by one.
 * – Converts the result to Title Case, handling camelCase boundaries
 *   (e.g. "Lagos MainLand" → "Lagos Mainland").
 */
function formatLocationString(raw: string): string {
  // Insert space after commas where missing
  const spaced = raw.replace(/,(?!\s)/g, ", ");
  // Split on camelCase boundaries so "MainLand" → "Main Land"
  const separated = spaced.replace(/([a-z])([A-Z])/g, "$1 $2");
  // Title-case each word
  return separated
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getBranchLocation(branch: RbacBranch) {
  const segments = [branch.addressLabel, branch.city, branch.state, branch.country]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => formatLocationString(value.trim()));

  if (segments.length > 0) {
    return segments.join(", ");
  }

  const fallback = branch.location;
  return fallback ? formatLocationString(fallback) : "Location unavailable";
}

function getBranchTypeLabel(branch: RbacBranch) {
  return branch.type ? branch.type.replace(/_/g, " ") : null;
}

/** Returns value if it is a non-empty, meaningful string; otherwise "—". */
function nullish(value: string | null | undefined): string {
  if (!value) return "\u2014";
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "Not specified" || trimmed === "N/A") return "\u2014";
  return trimmed;
}

function getBranchStatus(branch: RbacBranch) {
  return branch.status ?? (branch.isActive === false ? "CLOSED" : "ACTIVE");
}

function StatusBadge({ status }: { status: "ACTIVE" | "PENDING_ACTIVATION" | "SUSPENDED" | "CLOSED" }) {
  const statusMeta = {
    ACTIVE: { label: "Active", icon: CheckCircle2, className: "border-primary/30 bg-primary/10 text-primary" },
    PENDING_ACTIVATION: { label: "Pending activation", icon: XCircle, className: "border-destructive/30 bg-destructive/10 text-destructive" },
    SUSPENDED: { label: "Suspended", icon: XCircle, className: "border-destructive/20 bg-destructive/10 text-destructive" },
    CLOSED: { label: "Closed", icon: XCircle, className: "border-border bg-muted text-muted-foreground" },
  } satisfies Record<string, { label: string; icon: typeof CheckCircle2; className: string }>;

  const meta = statusMeta[status] ?? statusMeta.CLOSED;
  const Icon = meta.icon;

  return (
    <Badge variant="outline" className={meta.className}>
      <Icon />
      {meta.label}
    </Badge>
  );
}

const BranchMatrixPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: branches = [], isLoading, isError, refetch } = useBranchesQuery();

  const filteredBranches = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return branches;
    }

    return branches.filter((branch) =>
      [branch.name, branch.code, branch.location, branch.managerId, getManagerName(branch)]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedSearch)),
    );
  }, [branches, search]);

  return (
    <section className="min-h-full space-y-5 -m-6 p-4 sm:p-6">
      <p className="text-sm text-muted-foreground">Manage your institution&apos;s branch network.</p>
      <div className="flex items-center justify-between bg-background p-4 rounded-md border">
        <div className="relative flex gap-2 items-center w-1/2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, state..."
            aria-label="Search branches"
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Building2 />
          Create New Branch
        </Button>
      </div>

      {isLoading ? (
        <InlineMessage tone="info" message="Loading branches..." />
      ) : isError ? (
        <InlineMessage tone="error" message="Unable to load branches. Please try again." />
      ) : branches.length === 0 ? (
        <InlineMessage tone="info" message="No branches are available yet." />
      ) : filteredBranches.length === 0 ? (
        <InlineMessage tone="info" message={`No branches match “${search}”.`} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3  xl:grid-cols-3">
          {filteredBranches.map((branch) => {
            const status = getBranchStatus(branch);
            return (
              <article
                key={branch.id || branch._id || branch.name}
                className="flex min-h-[230px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-5">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold uppercase text-card-foreground">{branch.name}</h2>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{branch.code || "No branch code"}</p>
                  </div>
                  {branch.isHeadOffice ? (
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-[10px] text-primary">
                      <Landmark />
                      Head office
                    </Badge>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4 px-4 py-4">
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-3.5 shrink-0" />
                      <span className="line-clamp-2">{getBranchLocation(branch)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <UserRound className="mt-0.5 size-3.5 shrink-0" />
                      <span className="line-clamp-2">{getManagerName(branch)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-muted-foreground">
                      <div>
                        <div className="font-medium">Type</div>
                        <div>{nullish(getBranchTypeLabel(branch))}</div>
                      </div>
                      <div>
                        <div className="font-medium">Region</div>
                        <div>{nullish(branch.regionalZone)}</div>
                      </div>
                      <div>
                        <div className="font-medium">Country</div>
                        <div>{nullish(branch.country)}</div>
                      </div>
                      <div>
                        <div className="font-medium">Parent</div>
                        <div>{nullish(branch.parentBranchId)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <StatusBadge status={status} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[11px] text-primary hover:bg-primary/10 hover:text-primary"
                      onClick={() => router.push(`/home/branch-matrix/${branch.id || branch._id}`)}
                    >
                      View details
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!isLoading && !isError && filteredBranches.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Showing {filteredBranches.length} of {branches.length} {branches.length === 1 ? "branch" : "branches"}
        </p>
      ) : null}

      <CreateBranchDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={async () => {
          await refetch();
        }}
      />
    </section>
  );
};

export default BranchMatrixPage;
