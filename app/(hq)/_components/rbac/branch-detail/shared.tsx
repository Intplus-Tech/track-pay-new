"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** One-shot copy-to-clipboard icon button. */
export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy to clipboard"
      className="inline-flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  );
}

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-xs">
      <span className="shrink-0 font-medium text-muted-foreground">{label}</span>
      <span className="text-right text-foreground break-words max-w-[60%]">
        {value ?? <span className="text-muted-foreground">-</span>}
      </span>
    </div>
  );
}

export function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
        {action}
      </div>
      <div className="divide-y divide-border/60 px-4">{children}</div>
    </div>
  );
}
