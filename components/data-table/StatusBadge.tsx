import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "On-Time" | "Partial" | "Overdue" | "Active" | "Failed";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "On-Time":
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Overdue":
      case "Failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "Unavailable":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getStatusStyles(status),
        className,
      )}
    >
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          status === "On-Time" || status === "Active"
            ? "bg-green-500"
            : status === "Partial"
              ? "bg-yellow-500"
              : "bg-red-500",
        )}
      />
      {status}
    </span>
  );
}
