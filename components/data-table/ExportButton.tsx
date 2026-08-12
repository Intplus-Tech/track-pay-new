import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportButtonProps {
  options: ("pdf" | "excel" | "csv")[];
  onExport: (format: string) => void;
  data: any[];
  filename?: string;
}

export function ExportButton({
  options,
  onExport,
  data,
  filename = "export",
}: ExportButtonProps) {
  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle values that contain commas or quotes
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    if (!data || data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const handleExport = (format: string) => {


    switch (format) {
      case "csv":
        exportToCSV();
        break;
      case "excel":
        exportToExcel();
        break;
      case "pdf":
        // PDF export would require additional library like jsPDF

        break;
      default:
        break;
    }

    onExport(format);
  };

  const getIcon = (option: string) => {
    if (option === "excel" || option === "csv") {
      return <FileSpreadsheet className="mr-2 h-4 w-4" />;
    }
    return null;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-full bg-primary/10 font-normal"
        >
          Export
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white border shadow-lg">
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => handleExport(option)}
            className="capitalize cursor-pointer"
          >
            {getIcon(option)}
            {option === "excel" ? "Excel" : option.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
