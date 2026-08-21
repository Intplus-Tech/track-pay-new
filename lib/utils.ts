import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: string | number | null | undefined, fallback = "₦0.00") {
  if (value === null || value === undefined || value === "") return fallback;

  // Strip any existing "N" or non-numeric characters if it's a string, then parse
  const numericValue = typeof value === "string" ? Number(value.replace(/[^0-9.-]+/g, "")) : value;

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function formatCollectionRate(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0.0%"
  }

  return `${(value * 100).toFixed(1)}%`
}

export const zodAmount = z.string()
  .min(1, "Amount is required")
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount (e.g. 5000 or 5000.50)");