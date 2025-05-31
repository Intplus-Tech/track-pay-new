"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import {
  loanColumns,
  userColumns,
  loaneeAccountColumns,
} from "@/components/data-table/columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  loaneeAccountData,
  sampleLoanData,
  sampleUserData,
} from "@/data/sample-data";

const Sampletable = () => {
  const [activeTable, setActiveTable] = useState("loans");

  const loanFilterConfig = {
    enabled: true,
    filters: [
      {
        id: "branches",
        label: "All Loan Officers",
        values: [
          { label: "Akin (Lagos Mainland)", value: "Lagos Mainland/Akin" },
          { label: "Kingsley (Abuja)", value: "Abuja/Kingsley" },
          { label: "Habeeb (Kano)", value: "Kano/Habeeb" },
          { label: "Opebi", value: "Opebi/Benedicta" },
        ],
      },
    ],
  };

  const userFilterConfig = {
    enabled: true,
    filters: [
      {
        id: "branches",
        label: "All Branches",
        values: [
          { label: "Lagos Mainland", value: "lagos" },
          { label: "Abuja", value: "abuja" },
          { label: "Kano", value: "kano" },
          { label: "Opebi", value: "opebi" },
        ],
      },
      {
        id: "officers",
        label: "Loan Officers",
        values: [
          { label: "Akin", value: "akin" },
          { label: "Kingsley", value: "kingsley" },
          { label: "Habeeb", value: "habeeb" },
          { label: "Benedicta", value: "benedicta" },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            DataVerse Table Kit
          </h1>
          <p className="text-gray-600">
            Dynamic, reusable data tables with filtering, search, and export
            capabilities
          </p>
        </div>

        <Tabs
          value={activeTable}
          onValueChange={setActiveTable}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="loans">Loan Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="accounts">Loanee Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="loans" className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">
                Loan Management Table
              </h2>
              <p className="text-gray-600 mb-6">
                Full-featured table with search, filtering, export, and row
                actions
              </p>
              <DataTable
                columns={loanColumns}
                data={sampleLoanData}
                searchConfig={{
                  enabled: true,
                  placeholder: "Search Loans",
                }}
                filterConfig={loanFilterConfig}
                exportConfig={{
                  enabled: true,
                  options: ["excel"],
                }}
                paginationConfig={{
                  enabled: true,
                  pageSizeOptions: [10, 20, 30, 40, 50],
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">
                User Management Table
              </h2>
              <p className="text-gray-600 mb-6">
                Employee data with role-based filtering and actions
              </p>
              <DataTable
                columns={userColumns}
                data={sampleUserData}
                searchConfig={{
                  enabled: true,
                  placeholder: "Search Officers",
                }}
                filterConfig={userFilterConfig}
                exportConfig={{
                  enabled: true,
                  options: ["excel", "csv"],
                }}
                paginationConfig={{
                  enabled: true,
                  pageSizeOptions: [10, 20, 30],
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Loanee Accounts</h2>
              <p className="text-gray-600 mb-6">
                Account management with creation and status tracking
              </p>
              <DataTable
                columns={loaneeAccountColumns}
                data={loaneeAccountData}
                searchConfig={{
                  enabled: true,
                  placeholder: "Search Loanee",
                }}
                exportConfig={{
                  enabled: true,
                  options: ["pdf", "excel"],
                }}
                paginationConfig={{
                  enabled: true,
                  pageSizeOptions: [10, 20, 30, 40, 50],
                }}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Features Demonstrated</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Dynamic Filtering
              </h4>
              <p className="text-sm text-blue-700">
                Branch and officer-based filtering with multi-select options
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Global Search</h4>
              <p className="text-sm text-green-700">
                Search across all table columns with real-time filtering
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">
                Export Options
              </h4>
              <p className="text-sm text-purple-700">
                PDF, Excel, and CSV export capabilities
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">
                Status Badges
              </h4>
              <p className="text-sm text-yellow-700">
                Color-coded status indicators with proper styling
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Row Actions</h4>
              <p className="text-sm text-red-700">
                Configurable dropdown menus for each row
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-900 mb-2">
                Responsive Design
              </h4>
              <p className="text-sm text-indigo-700">
                Mobile-friendly layout with proper spacing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sampletable;
