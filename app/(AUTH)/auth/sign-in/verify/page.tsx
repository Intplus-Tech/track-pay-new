import { VerificationForm } from "@/app/(AUTH)/_components/VerificationForm";
import Logo from "@/components/Logo";
import {
  AUTH_PENDING_COOKIE,
  decodeSessionValue,
  PendingAuthSession,
} from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const cookieStore = await cookies();
  const pending = decodeSessionValue<PendingAuthSession>(
    cookieStore.get(AUTH_PENDING_COOKIE)?.value,
  );

  if (!pending?.authUserId) {
    redirect("/auth/sign-in");
  }

  const email = pending.email || "your email address";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 items-center h-full z-10 container mx-auto">
      <div className="flex-col w-fit ml-[20%] hidden lg:flex">
        <Logo width={120} height={120} priority />
        <h1 className="font-bold text-hero text-primary">TrackPay</h1>
        <p className="text-white">Loan Reconcilation System</p>
      </div>
      <div className="flex items-center justify-center size-full">
        <VerificationForm email={email} />
      </div>
    </div>
  );
};

export default page;
