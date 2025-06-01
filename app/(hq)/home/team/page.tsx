import { PageProps } from "@/types";
import React from "react";
import Teamstable from "../../_components/tables/Teamstable";

const page = async ({ params }: PageProps) => {
  // const { id } = await params;

  return (
    <div>
      <Teamstable />
    </div>
  );
};

export default page;
