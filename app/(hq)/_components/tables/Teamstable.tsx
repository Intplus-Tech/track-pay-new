import React from "react";
import { sampleUserData } from "@/data/sample-data";
import { DataTable } from "@/components/data-table/DataTable";
import { userColumns } from "@/components/data-table/columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddTeamMemberForm } from "@/components/forms/AddTeamMemberForm";

const Teamstable = () => {
  // const userFilterConfig = {
  //   enabled: true,
  //   filters: [
  //     {
  //       id: "branches",
  //       label: "All Branches",
  //       values: [
  //         { label: "Lagos Mainland", value: "lagos" },
  //         { label: "Abuja", value: "abuja" },
  //         { label: "Kano", value: "kano" },
  //         { label: "Opebi", value: "opebi" },
  //       ],
  //     },
  //     {
  //       id: "officers",
  //       label: "Loan Officers",
  //       values: [
  //         { label: "Akin", value: "akin" },
  //         { label: "Kingsley", value: "kingsley" },
  //         { label: "Habeeb", value: "habeeb" },
  //         { label: "Benedicta", value: "benedicta" },
  //       ],
  //     },
  //   ],
  // };

  return (
    <div className="relative">
      <Dialog>
        <DialogTrigger asChild>
          <span className="absolute top-0.5 bg-background p-2 rounded-full capitalize">
            <Button className="bg-primary/10 text-foreground hover:text-white rounded-full">
              Add new team
            </Button>
          </span>
        </DialogTrigger>
        <DialogContent className=" xl:min-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Add new team member</DialogTitle>
          <AddTeamMemberForm />
        </DialogContent>
      </Dialog>
      <DataTable
        columns={userColumns}
        data={sampleUserData}
        searchConfig={{
          enabled: true,
          placeholder: "Search Officers",
        }}
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
  );
};

export default Teamstable;
