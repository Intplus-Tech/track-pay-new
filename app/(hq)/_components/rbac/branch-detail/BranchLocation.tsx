import { MapPin } from "lucide-react";
import type { RbacBranch } from "@/types/rbac";
import { Section } from "./shared";
import { getBranchAddress } from "./utils";

export function BranchLocation({
  branch,
  parentBranchLabel,
}: {
  branch: RbacBranch;
  parentBranchLabel: string;
}) {
  return (
    <Section title="Location">
      <div className="grid gap-3 py-3 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-[0.12em] text-slate-400">Address</span>
            <span className="text-sm text-slate-700">{getBranchAddress(branch)}</span>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-[0.12em] text-slate-400">City</span>
            <span className="text-sm text-slate-700">{branch.city || "-"}</span>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-[0.12em] text-slate-400">State</span>
            <span className="text-sm text-slate-700">{branch.state || "-"}</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-[0.12em] text-slate-400">Country</span>
            <span className="text-sm text-slate-700">{branch.country || "-"}</span>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-[0.12em] text-slate-400">Regional zone</span>
            <span className="text-sm text-slate-700">{branch.regionalZone || "-"}</span>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-[0.12em] text-slate-400">Branch type</span>
            <span className="text-sm text-slate-700">
              {branch.type ? branch.type.replace("_", " ") : branch.isHeadOffice ? "Head office" : "Branch"}
            </span>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-[0.12em] text-slate-400">Parent branch</span>
            <span className="text-sm text-slate-700">{parentBranchLabel}</span>
          </div>
          {branch.latitude != null && branch.longitude != null ? (
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-semibold uppercase tracking-[0.12em] text-slate-400">Coordinates</span>
              <span className="flex items-center gap-1 text-sm text-slate-700">
                <MapPin className="size-3 text-slate-400 shrink-0" />
                {branch.latitude}, {branch.longitude}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
