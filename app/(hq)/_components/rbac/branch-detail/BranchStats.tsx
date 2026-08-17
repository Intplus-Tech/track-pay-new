import type { RbacBranch } from "@/types/rbac";
import { formatCollectionRate, formatCurrency } from "./utils";

export function BranchStats({ branch }: { branch: RbacBranch }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[
        { label: "Total exposure", value: formatCurrency(branch.totalExposure), tone: "bg-card" },
        {
          label: "Active loans",
          value: typeof branch.activeLoans === "number" ? String(branch.activeLoans) : "-",
          tone: "bg-card",
        },
        { label: "Collection rate", value: formatCollectionRate(branch.collectionRate), tone: "bg-card" },
        {
          label: "Active officers",
          value: typeof branch.activeOfficers === "number" ? String(branch.activeOfficers) : "-",
          tone: "bg-card",
        },
      ].map((item) => (
        <div key={item.label} className={`rounded-xl border border-border ${item.tone} px-3 py-2.5 shadow-sm`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
