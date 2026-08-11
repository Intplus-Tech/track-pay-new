"use client";

import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ManagementPageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            {/* <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {eyebrow}
            </p> */}
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">
                {title}
              </h1>
              {description ? (
                <div className="max-w-3xl text-sm leading-6 text-slate-600">
                  {description}
                </div>
              ) : null}
            </div>
          </div>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function StatsGrid({
  items,
}: {
  items: Array<{ label: string; value: string; note: string }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card
          key={item.label}
          className="border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
        >
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {item.label}
            </p>
            <p className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              {item.value}
            </p>
            <p className="text-sm text-slate-500">{item.note}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
            {title}
          </h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function InlineMessage({
  tone,
  message,
}: {
  tone: "error" | "info";
  message: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      {message}
    </div>
  );
}

export function PrimaryAction({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className="rounded-full bg-[#1038f0] px-5 text-white hover:bg-[#0d2fd0]"
    >
      {label}
    </Button>
  );
}