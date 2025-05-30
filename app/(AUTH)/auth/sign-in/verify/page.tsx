import { VerificationForm } from "@/app/(AUTH)/_components/VerificationForm";
import Logo from "@/components/Logo";
import React from "react";

const page = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 items-center h-full z-10 container mx-auto">
      <div className="flex-col w-fit ml-[20%] hidden lg:flex">
        <Logo width={120} height={120} priority />
        <h1 className="font-bold text-[87px] text-primary">TrackPay</h1>
        <p className="text-white">Loan Reconcilation System</p>
      </div>
      <div className="flex items-center justify-center size-full">
        <VerificationForm email="jonsnow@gmail.com" />
      </div>
    </div>
  );
};

export default page;
