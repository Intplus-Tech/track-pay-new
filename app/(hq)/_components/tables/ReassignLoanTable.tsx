import React from "react";
import { staffLoanPerformanceData } from "@/data/sample-data";
import { DataTable } from "@/components/data-table/DataTable";
import { loanOfficerColumns } from "@/components/data-table/columns";

const ReassignLoanTable = () => {

  return (
    <DataTable
      columns={loanOfficerColumns}
      data={staffLoanPerformanceData}
      durationConfig={{
        enabled: false
      }}
      searchConfig={{
        enabled: true,
        placeholder: "Search Loans",
      }}
      exportConfig={{
        enabled: true,
        options: ["excel"],
      }}
      paginationConfig={{
        enabled: true,
        pageSizeOptions: [5, 10, 15, 40, 50],
      }}
    />
  );
};

export default ReassignLoanTable;
