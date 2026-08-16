"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBranchConfigurationQuery } from "@/hooks/rbac/useBranchConfigurationQuery";
import { Separator } from "../ui/separator";

function normalizeBranchConfigStatus(value: unknown) {
  if (typeof value === "string") {
    return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return "Unknown";
}

export function BranchConfiguration() {
  const { data, isLoading, isError } = useBranchConfigurationQuery();

  const branches = Array.isArray(data) ? data : [];

  return (
    <Card className="w-full border-none shadow-none pt-2 px-0">
      <CardHeader>
        <CardTitle>Branch Configuration</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        {isLoading ? (
          <div className="px-4 py-6 text-sm text-slate-500">Loading branch configuration...</div>
        ) : isError ? (
          <div className="px-4 py-6 text-sm text-red-600">Unable to load branch configuration.</div>
        ) : branches.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500">No branch configuration data available.</div>
        ) : (
          <Table className="border">
            <TableHeader>
              <TableRow className="border rounded">
                <TableHead>Branch</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Active Loans</TableHead>
                <TableHead>Branch Status</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch, index) => {
                const branchRecord = branch as Record<string, unknown>;
                const branchId =
                  (typeof branchRecord.id === "string" && branchRecord.id) ||
                  (typeof branchRecord._id === "string" && branchRecord._id) ||
                  `branch-${index + 1}`;
                const branchName = typeof branchRecord.name === "string" ? branchRecord.name : "Unnamed branch";
                const location =
                  typeof branchRecord.location === "string"
                    ? branchRecord.location
                    : typeof branchRecord.city === "string"
                      ? branchRecord.city
                      : "Not available";
                const managerValue = branchRecord.manager;
                const managerName =
                  typeof managerValue === "string"
                    ? managerValue
                    : managerValue && typeof managerValue === "object"
                      ? (
                        (managerValue as Record<string, unknown>).fullName ||
                        [
                          (managerValue as Record<string, unknown>).firstName,
                          (managerValue as Record<string, unknown>).middleName,
                          (managerValue as Record<string, unknown>).lastName,
                        ]
                          .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
                          .join(" ") ||
                        "Unassigned"
                      )
                      : "Unassigned";
                const activeLoans = typeof branchRecord.activeLoans === "number" ? branchRecord.activeLoans : 0;
                const status = normalizeBranchConfigStatus(branchRecord.status ?? branchRecord.branchStatus);
                const type = normalizeBranchConfigStatus(branchRecord.type);

                return (
                  <TableRow key={branchId}>
                    <TableCell className="font-medium">{branchName}</TableCell>
                    <TableCell>{location}</TableCell>
                    <TableCell>{managerName}</TableCell>
                    <TableCell>{activeLoans.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={status === "Active" ? "default" : "outline"}>{status}</Badge>
                    </TableCell>
                    <TableCell>{type}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
