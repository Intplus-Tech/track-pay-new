"use client";

import * as React from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AttachmentProps {
  label: string;
  description: string;
  value?: string;
  previewUrl?: string | null;
  fileName?: string | null;
  isUploading?: boolean;
  accept?: string;
  onSelect: (file: File | null) => void | Promise<void>;
  onRemove?: () => void;
  className?: string;
}

export function Attachment({
  label,
  description,
  value,
  previewUrl,
  fileName,
  isUploading = false,
  accept = "image/*",
  onSelect,
  onRemove,
  className,
}: AttachmentProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-slate-50 p-4", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-400">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt={fileName ?? label} className="size-full object-cover" />
            ) : (
              <Upload className="size-5" />
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-slate-900">{label}</p>
            <p className="text-sm text-slate-500">{description}</p>
            {fileName ? <p className="truncate text-sm text-slate-700">{fileName}</p> : null}
            {value ? <p className="break-all text-xs uppercase tracking-[0.14em] text-slate-500">Upload ID: {value}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              void onSelect(file);
              event.target.value = "";
            }}
          />
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={isUploading}>
            {isUploading ? "Uploading..." : previewUrl || value ? "Replace" : "Upload"}
          </Button>
          {onRemove ? (
            <Button type="button" variant="ghost" size="icon" onClick={onRemove} disabled={isUploading || (!previewUrl && !value)}>
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
