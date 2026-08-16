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

function getBranchLocation(branch: RbacBranch) {
  const segments = [branch.addressLabel, branch.city, branch.state, branch.country]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.trim());

  if (segments.length > 0) {
    return segments.join(", ");
  }

  return branch.location || "Location unavailable";
}

function getBranchTypeLabel(branch: RbacBranch) {
  return branch.type ? branch.type.replace("_", " ") : "Not specified";
}

function getBranchStatus(branch: RbacBranch) {
  return branch.status ?? (branch.isActive === false ? "CLOSED" : "ACTIVE");
}

function StatusBadge({ status }: { status: "ACTIVE" | "PENDING_ACTIVATION" | "SUSPENDED" | "CLOSED" }) {
  const statusMeta = {
    ACTIVE: { label: "Active", icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    PENDING_ACTIVATION: { label: "Pending activation", icon: XCircle, className: "border-amber-200 bg-amber-50 text-amber-700" },
    SUSPENDED: { label: "Suspended", icon: XCircle, className: "border-orange-200 bg-orange-50 text-orange-700" },
    CLOSED: { label: "Closed", icon: XCircle, className: "border-slate-200 bg-slate-100 text-slate-600" },
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
    <section className="min-h-full space-y-5 bg-[#f7f9fd] -m-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950">Branch Matrix</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your institution&apos;s branch network.</p>
        </div>
        <Button
          type="button"
          onClick={() => setCreateDialogOpen(true)}
          className="hidden h-10 rounded-lg bg-[#075ee8] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#0452cc] sm:inline-flex"
        >
          <Building2 className="size-4" />
          Create New Branch
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, state..."
            aria-label="Search branches"
            className="h-10 rounded-lg border-slate-200 pl-10 text-xs"
          />
        </div>
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredBranches.map((branch) => {
            const status = getBranchStatus(branch);
            return (
              <article
                key={branch.id || branch._id || branch.name}
                className="flex min-h-[230px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold uppercase text-slate-950">{branch.name}</h2>
                    <p className="mt-1 truncate text-xs text-slate-500">{branch.code || "No branch code"}</p>
                  </div>
                  {branch.isHeadOffice ? (
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-[10px] text-blue-700">
                      <Landmark />
                      Head office
                    </Badge>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4 px-4 py-4">
                  <div className="space-y-3 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
                      <span className="line-clamp-2">{getBranchLocation(branch)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <UserRound className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
                      <span className="line-clamp-2">{getManagerName(branch)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-500">
                      <div>
                        <div className="font-medium text-slate-400">Type</div>
                        <div>{getBranchTypeLabel(branch)}</div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-400">Region</div>
                        <div>{branch.regionalZone || "Not specified"}</div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-400">Country</div>
                        <div>{branch.country || "Not specified"}</div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-400">Parent</div>
                        <div>{branch.parentBranchId || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <StatusBadge status={status} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[11px] text-blue-700 hover:bg-blue-50 hover:text-blue-800"
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
        <p className="text-xs text-slate-500">
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
