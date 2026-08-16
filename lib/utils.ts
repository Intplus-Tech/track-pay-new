import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: string | number | null | undefined) {
  const numericValue = typeof value === "string" ? Number(value) : value ?? 0

  if (!Number.isFinite(numericValue)) {
    return "$0.00"
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)
}

export function formatCollectionRate(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0.0%"
  }

  return `${(value * 100).toFixed(1)}%`
}
