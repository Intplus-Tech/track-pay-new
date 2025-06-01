"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
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
import { Separator } from "../ui/separator";

const branchData = [
  {
    id: "LN-8589",
    location: "HQ",
    manager: "Adeola Bello",
    activeLoans: 1242,
    status: "Active",
    enabled: true,
  },
  {
    id: "LN-1908",
    location: "Lagos Main",
    manager: "Chike Obi",
    activeLoans: 872,
    status: "Active",
    enabled: true,
  },
  {
    id: "LN-1933",
    location: "Abuja",
    manager: "Fatima Yusuf",
    activeLoans: 23,
    status: "Active",
    enabled: true,
  },
  {
    id: "LN-1898",
    location: "Lekki",
    manager: "Emeka Okoro",
    activeLoans: 87,
    status: "Close",
    enabled: false,
  },
];

export function BranchConfiguration() {
  const [branches, setBranches] = useState(branchData);

  const toggleBranch = (index: number) => {
    setBranches((prev) =>
      prev.map((branch, i) =>
        i === index ? { ...branch, enabled: !branch.enabled } : branch,
      ),
    );
  };

  return (
    <Card className="w-full border-none shadow-none pt-2 px-0">
      <CardHeader>
        <CardTitle>Branch Configuration</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <Table className="border">
          <TableHeader>
            <TableRow className="border rounded">
              <TableHead>Branch ID</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Active Loans</TableHead>
              <TableHead>Branch Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.map((branch, index) => (
              <TableRow key={branch.id}>
                <TableCell className="font-medium">{branch.id}</TableCell>
                <TableCell>{branch.location}</TableCell>
                <TableCell>{branch.manager}</TableCell>
                <TableCell>{branch.activeLoans.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      branch.status === "Active" ? "default" : "destructive"
                    }
                  >
                    {branch.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={branch.enabled}
                    onCheckedChange={() => toggleBranch(index)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
