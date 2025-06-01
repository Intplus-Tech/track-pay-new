"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { TableFilters } from "./TableFilters";
import { ExportButton } from "./ExportButton";
import { DataTableProps } from "@/types/data-table";

export function DataTable<TData, TValue>({
  columns,
  data,
  searchConfig = { enabled: true, placeholder: "Search..." },
  filterConfig,
  durationConfig = { enabled: false },
  exportConfig,
  paginationConfig = { enabled: true, pageSizeOptions: [10, 20, 30, 40, 50] },
  rowActions,
  title,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [filteredData, setFilteredData] = useState<TData[]>(data);

  // Apply custom filters to data
  useEffect(() => {
    let filtered = [...data];

    // Apply selected filters
    Object.entries(selectedFilters).forEach(([filterId, selectedValues]) => {
      if (selectedValues.length > 0) {
        filtered = filtered.filter((row: any) => {
          // For branch/officer filter, check if the branchOfficer field contains any of the selected values
          if (filterId === "branches") {
            return selectedValues.some(
              (value) =>
                row.branchOfficer?.includes(value.split("/")[1]) || // Check by officer name
                row.branchOfficer?.includes(value.split("/")[0]) || // Check by branch name
                row.branchOfficer === value, // Exact match
            );
          }
          // Add other filter logic here as needed
          return true;
        });
      }
    });

    setFilteredData(filtered);
  }, [data, selectedFilters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const handleFilterChange = (filterId: string, values: string[]) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterId]: values,
    }));
  };

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}`);
    // Additional export logic can be added here if needed
  };

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="flex items-center md:justify-end mb-4 -z-20">
        <div className="flex flex-col md:flex-row md:items-center gap-2 p-2 rounded-full md:border bg-background">
          {searchConfig.enabled && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchConfig.placeholder}
                value={globalFilter ?? ""}
                onChange={(event) =>
                  setGlobalFilter(String(event.target.value))
                }
                className="pl-8 max-w-sm rounded-full bg-primary/10"
              />
            </div>
          )}
          {filterConfig?.enabled && (
            <TableFilters
              filters={filterConfig.filters}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
            />
          )}
          {durationConfig?.enabled && (
            <Select defaultValue="24">
              <SelectTrigger className="w-[140px] h-8 rounded-full bg-primary/10">
                <SelectValue placeholder="Time filter" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                <SelectItem value="24">Last 24 Hours</SelectItem>
                <SelectItem value="48">48 Hours</SelectItem>
                <SelectItem value="week">1 Week</SelectItem>
              </SelectContent>
            </Select>
          )}
          {exportConfig?.enabled && (
            <ExportButton
              options={exportConfig.options}
              onExport={handleExport}
              data={table.getFilteredRowModel().rows.map((row) => row.original)}
              filename={
                title?.toLowerCase().replace(/\s+/g, "-") || "table-export"
              }
            />
          )}
        </div>
      </div>

      {/* Table */}
      <Table className="bg-gray-50">
        <TableHeader className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="font-medium text-gray-900"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="space-y-4">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-gray-50 mb-4"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {paginationConfig.enabled && (
        <div className="flex flex-col-reverse md:flex-row items-center justify-between space-x-2 py-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top" className="bg-white border shadow-lg">
                {paginationConfig.pageSizeOptions?.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from(
                { length: Math.min(5, table.getPageCount()) },
                (_, i) => {
                  const pageIndex = table.getState().pagination.pageIndex;
                  const start = Math.max(0, pageIndex - 2);
                  const actualIndex = start + i;

                  if (actualIndex >= table.getPageCount()) return null;

                  return (
                    <Button
                      key={actualIndex}
                      variant={
                        actualIndex === pageIndex ? "default" : "outline"
                      }
                      className="h-8 w-8 p-0"
                      onClick={() => table.setPageIndex(actualIndex)}
                    >
                      {actualIndex + 1}
                    </Button>
                  );
                },
              )}
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
