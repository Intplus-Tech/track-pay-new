import { PageProps } from "@/types";
import React from "react";
import AccountsTable from "../../_components/tables/AccountsTable";
import LoanOfficerTable from "../../_components/tables/LoanOfficertable";

const page = async ({ params }: PageProps) => {
  // const { id } = await params;

  return (
    <div>
      <LoanOfficerTable />
    </div>
  );
};

export default page;
