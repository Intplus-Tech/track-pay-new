"use client";

import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Link2,
  Search,
  Square,
} from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: string;
  trendTone?: "positive" | "alert" | "neutral";
  valueTone?: "default" | "success" | "danger";
}

interface BranchRow {
  branch: string;
  zone: string;
  manager: string;
  activeLoanees: string;
  disbursedVolume: string;
  collectionRate: number;
  overdueMilestones: number;
}

const statCards: StatCard[] = [
  {
    title: "TOTAL PORTFOLIO VALUE",
    value: "N45,230,000.00",
    subtitle: "Aggregated Principal Balance",
    icon: Square,
    trend: "+2.4%",
    trendTone: "positive",
    valueTone: "default",
  },
  {
    title: "COLLECTION RATE",
    value: "96.4%",
    subtitle: "Institutional Success Index",
    icon: CheckCircle2,
    valueTone: "success",
  },
  {
    title: "PORTFOLIO AT RISK (PAR 30)",
    value: "N2,100,000.00",
    subtitle: "Outstanding Overdue 30+ Days",
    icon: AlertTriangle,
    trend: "High Risk",
    trendTone: "alert",
    valueTone: "danger",
  },
  {
    title: "SQUADCO WALLET",
    value: "N12,450,000.00",
    subtitle: "Settlement Account Balance",
    icon: Link2,
    trend: "Live Mirror",
    trendTone: "neutral",
    valueTone: "default",
  },
];

const branchRows: BranchRow[] = [
  {
    branch: "Lagos Mainland",
    zone: "Zone A-01",
    manager: "Babajide Sanwo",
    activeLoanees: "1,245",
    disbursedVolume: "N12.4M",
    collectionRate: 98.2,
    overdueMilestones: 0,
  },
  {
    branch: "Abuja FCT",
    zone: "Zone C-04",
    manager: "Amina Dikko",
    activeLoanees: "892",
    disbursedVolume: "N9.8M",
    collectionRate: 95.4,
    overdueMilestones: 2,
  },
  {
    branch: "Port Harcourt",
    zone: "Zone S-09",
    manager: "Ifeanyi Okowa",
    activeLoanees: "750",
    disbursedVolume: "N7.2M",
    collectionRate: 88.7,
    overdueMilestones: 12,
  },
  {
    branch: "Kano City",
    zone: "Zone N-12",
    manager: "Rabiu Kwankwaso",
    activeLoanees: "1,102",
    disbursedVolume: "N8.5M",
    collectionRate: 92.1,
    overdueMilestones: 0,
  },
  {
    branch: "Enugu Metro",
    zone: "Zone E-02",
    manager: "Uchenna Nnaji",
    activeLoanees: "450",
    disbursedVolume: "N4.1M",
    collectionRate: 96.8,
    overdueMilestones: 1,
  },
];

function collectionBarTone(rate: number) {
  return rate < 90 ? "bg-amber-500" : "bg-emerald-500";
}

function milestoneTone(count: number) {
  if (count >= 10) {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-500";
}

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div
                  className={[
                    "flex size-9 items-center justify-center rounded-lg",
                    card.valueTone === "success" && "bg-emerald-50 text-emerald-600",
                    card.valueTone === "danger" && "bg-rose-50 text-rose-600",
                    card.valueTone === "default" && "bg-slate-100 text-slate-700",
                  ].join(" ")}
                >
                  <Icon className="size-4" />
                </div>
                {card.trend ? (
                  <span
                    className={[
                      "text-xs font-semibold",
                      card.trendTone === "positive" && "text-emerald-500",
                      card.trendTone === "alert" && "text-rose-500",
                      card.trendTone === "neutral" && "text-blue-500",
                    ].join(" ")}
                  >
                    {card.trend}
                  </span>
                ) : null}
              </div>
              <p className="text-[0.73rem] font-semibold tracking-[0.06em] text-slate-500">
                {card.title}
              </p>
              <p
                className={[
                  "mt-1 text-[1.9rem] font-bold leading-none tracking-[-0.02em]",
                  card.valueTone === "success" && "text-emerald-600",
                  card.valueTone === "danger" && "text-rose-600",
                  card.valueTone === "default" && "text-slate-900",
                ].join(" ")}
              >
                {card.value}
              </p>
              <p className="mt-2 text-xs text-slate-500">{card.subtitle}</p>
            </article>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
        <header className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-[1.9rem] font-semibold leading-none tracking-[-0.03em] text-slate-900">
            Branch Performance Rankings
          </h2>
          <label className="relative w-full max-w-[300px]">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search portfolio..."
              className="h-10 rounded-full border-slate-300 bg-white pl-9 text-sm shadow-none placeholder:text-slate-400"
            />
          </label>
        </header>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-bold tracking-wide text-slate-500">
                <th className="px-6 py-4">BRANCH NAME</th>
                <th className="px-6 py-4">OPERATING MANAGER</th>
                <th className="px-6 py-4">ACTIVE LOANEES</th>
                <th className="px-6 py-4">DISBURSED VOLUME</th>
                <th className="px-6 py-4">COLLECTION RATE</th>
                <th className="px-6 py-4">OVERDUE</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {branchRows.map((branch) => (
                <tr key={branch.branch} className="border-t border-slate-200 align-top">
                  <td className="px-6 py-4">
                    <p className="text-base font-semibold leading-5 text-slate-900">{branch.branch}</p>
                    <p className="mt-1 text-xs text-slate-500">{branch.zone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{branch.manager}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{branch.activeLoanees}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{branch.disbursedVolume}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-14 rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${collectionBarTone(branch.collectionRate)}`}
                          style={{ width: `${branch.collectionRate}%` }}
                        />
                      </div>
                      <span
                        className={`text-sm font-semibold ${branch.collectionRate < 90 ? "text-amber-500" : "text-emerald-500"}`}
                      >
                        {branch.collectionRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${milestoneTone(
                        branch.overdueMilestones,
                      )}`}
                    >
                      {branch.overdueMilestones} {branch.overdueMilestones === 1 ? "Milestone" : "Milestones"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      className="text-sm font-semibold text-[#1156e8] transition-colors hover:text-[#0d43b2]"
                    >
                      View Branch Ledger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-500">Showing 5 of 24 Branches</p>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-full text-slate-900"
            >
              1
            </button>
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            >
              2
            </button>
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            >
              3
            </button>
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default Dashboard;
