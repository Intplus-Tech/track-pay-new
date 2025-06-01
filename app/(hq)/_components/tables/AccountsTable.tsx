import React from "react";
import { sampleLoanData } from "@/data/sample-data";
import { DataTable } from "@/components/data-table/DataTable";
import { loanColumns } from "@/components/data-table/columns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateSingleAccount } from "@/components/forms/CreateSingleAccount";
import { BulkUpload } from "@/components/forms/BulkUpload";

const AccountsTable = () => {

  return (
    <div className="relative">
      <div className="absolute top-0.5 flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <span className="bg-background border p-2 rounded-full capitalize">
              <Button className="bg-primary/10 text-foreground hover:text-white rounded-full">
                Create Single Account
              </Button>
            </span>
          </DialogTrigger>
          <DialogContent className=" max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">Create single Account</DialogTitle>
            <CreateSingleAccount />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <span className="bg-background border p-2 rounded-full capitalize">
              <Button className="bg-primary/10 text-foreground hover:text-white rounded-full">
                Create Bulk Account
              </Button>
            </span>
          </DialogTrigger>
          <DialogContent className=" max-h-[90vh] overflow-y-auto">
            <DialogTitle className="sr-only">Create Bulk Account</DialogTitle>
            <BulkUpload />
          </DialogContent>
        </Dialog>
      </div>
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
