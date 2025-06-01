import { PageProps } from "@/types";
import React from "react";
import AccountsTable from "../../_components/tables/AccountsTable";

const page = async ({ params }: PageProps) => {
  // const { id } = await params;

  return (
    <div>
      <AccountsTable />
    </div>
  );
};

export default page;
