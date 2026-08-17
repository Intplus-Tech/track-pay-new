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
      <div className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-elevated-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            {/* <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {eyebrow}
            </p> */}
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              {description ? (
                <div className="max-w-3xl text-sm leading-6 text-muted-foreground">
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
          className="border-border bg-card shadow-elevated-md"
        >
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {item.label}
            </p>
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {item.value}
            </p>
            <p className="text-sm text-muted-foreground">{item.note}</p>
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
    <Card className="border-border bg-card shadow-elevated-md">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
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
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border bg-muted text-muted-foreground",
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
      className="rounded-full bg-brand px-5 text-white hover:bg-brand-hover"
    >
      {label}
    </Button>
  );
}