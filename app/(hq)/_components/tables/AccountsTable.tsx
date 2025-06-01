import React from "react";
import { sampleLoanData } from "@/data/sample-data";
import { DataTable } from "@/components/data-table/DataTable";
import { loanColumns } from "@/components/data-table/columns";

const AccountsTable = () => {
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

  return (
    <div>
      <DataTable
        columns={loanColumns}
        data={sampleLoanData}
        searchConfig={{
          enabled: true,
          placeholder: "Search Loans",
        }}
        // filterConfig={loanFilterConfig}
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
  );
};

export default AccountsTable;
