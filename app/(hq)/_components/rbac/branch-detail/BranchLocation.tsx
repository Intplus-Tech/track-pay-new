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
            <span className="font-semibold uppercase tracking-widest text-muted-foreground">Address</span>
            <span className="text-sm text-foreground">{getBranchAddress(branch)}</span>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-widest text-muted-foreground">City</span>
            <span className="text-sm text-foreground">{branch.city || "-"}</span>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-widest text-muted-foreground">State</span>
            <span className="text-sm text-foreground">{branch.state || "-"}</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-widest text-muted-foreground">Country</span>
            <span className="text-sm text-foreground">{branch.country || "-"}</span>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-widest text-muted-foreground">Regional zone</span>
            <span className="text-sm text-foreground">{branch.regionalZone || "-"}</span>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-widest text-muted-foreground">Branch type</span>
            <span className="text-sm text-foreground">
              {branch.type ? branch.type.replace("_", " ") : branch.isHeadOffice ? "Head office" : "Branch"}
            </span>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-widest text-muted-foreground">Parent branch</span>
            <span className="text-sm text-foreground">{parentBranchLabel}</span>
          </div>
          {branch.latitude != null && branch.longitude != null ? (
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-semibold uppercase tracking-widest text-muted-foreground">Coordinates</span>
              <span className="flex items-center gap-1 text-sm text-foreground">
                <MapPin className="size-3 text-muted-foreground shrink-0" />
                {branch.latitude}, {branch.longitude}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
