"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { DataTable } from "@/components/data-table/DataTable";
import { chartData, dashboardData } from "@/data/dashboard-data";
import { dashboardColumns } from "@/components/data-table/dashboard-columns";

const Dashboard = () => {
  const chartConfig = {
    approved: {
      label: "Approved",
      color: "#10b981",
    },
    disbursed: {
      label: "Disbursed",
      color: "#f59e0b",
    },
    overdue: {
      label: "Overdue",
      color: "#ef4444",
    },
  };

  return (
    <div className="">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-primary text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              Overall Loan
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs">₦</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg  lg:text-2xl font-bold mb-1">
              ₦230,221,100.45
            </div>
            <div className="text-blue-100 text-sm">Than last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center justify-between text-gray-700">
              Active Loan
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-xs text-red-600">₦</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg  lg:text-2xl font-bold mb-1 text-gray-900">
              ₦230,221,100.45
            </div>
            <div className="text-gray-500 text-sm">Than last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center justify-between text-gray-700">
              Overdue
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-xs text-red-600">₦</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg  lg:text-2xl font-bold mb-1 text-gray-900">
              ₦230,221,100.45
            </div>
            <div className="text-gray-500 text-sm">Than last month</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Loan Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke="var(--color-approved)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-approved)", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="disbursed"
                  stroke="var(--color-disbursed)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-disbursed)", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="overdue"
                  stroke="var(--color-overdue)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-overdue)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="relative">
          <p className="absolute top-3 left-8 text-xl xl:text-2xl font-semibold">
            Recent Transactions
          </p>
          <DataTable
            columns={dashboardColumns}
            data={dashboardData}
            searchConfig={{
              enabled: true,
              placeholder: "Search transactions...",
            }}
            paginationConfig={{
              enabled: true,
              pageSizeOptions: [10, 20, 30],
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
