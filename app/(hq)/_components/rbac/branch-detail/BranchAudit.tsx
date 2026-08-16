import type { RbacBranch } from "@/types/rbac";
import { CopyButton, Section } from "./shared";
import { truncateId } from "./utils";

export function BranchAudit({ branch }: { branch: RbacBranch }) {
  return (
    <Section title="Audit & timestamps">
      <div className="grid gap-2 py-3 md:grid-cols-2">
        {/* <div className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-[0.12em] text-muted-foreground">Branch ID</span>
          <span className="flex items-center gap-1.5 text-sm text-foreground font-mono">
            {truncateId(branch.id || branch._id || "")}
            <CopyButton value={branch.id || branch._id || ""} />
          </span>
        </div> */}
        <div className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-[0.12em] text-slate-400">Created</span>
          <span className="text-sm text-slate-700">
            {branch.createdAt ? new Date(branch.createdAt).toLocaleString() : "-"}
          </span>
        </div>
        <div className="flex flex-col gap-1 text-xs">
          <span className="font-semibold uppercase tracking-[0.12em] text-slate-400">Updated</span>
          <span className="text-sm text-slate-700">
            {branch.updatedAt ? new Date(branch.updatedAt).toLocaleString() : "-"}
          </span>
        </div>
      </div>
    </Section>
  );
}
