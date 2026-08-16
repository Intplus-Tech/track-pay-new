import type { RbacBranch } from "@/types/rbac";
import { formatCollectionRate, formatCurrency } from "./utils";

export function BranchStats({ branch }: { branch: RbacBranch }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[
        { label: "Total exposure", value: formatCurrency(branch.totalExposure), tone: "bg-white" },
        {
          label: "Active loans",
          value: typeof branch.activeLoans === "number" ? String(branch.activeLoans) : "-",
          tone: "bg-white",
        },
        { label: "Collection rate", value: formatCollectionRate(branch.collectionRate), tone: "bg-white" },
        {
          label: "Active officers",
          value: typeof branch.activeOfficers === "number" ? String(branch.activeOfficers) : "-",
          tone: "bg-white",
        },
      ].map((item) => (
        <div key={item.label} className={`rounded-xl border border-slate-200 ${item.tone} px-3 py-2.5 shadow-sm`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {item.label}
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
