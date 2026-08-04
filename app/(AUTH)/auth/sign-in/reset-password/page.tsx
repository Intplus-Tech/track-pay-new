import { ResetPasswordForm } from "@/app/(AUTH)/_components/ResetPasswordForm";
import {
  AUTH_PASSWORD_RESET_COOKIE,
  decodeSessionValue,
  PendingPasswordResetSession,
} from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const cookieStore = await cookies();
  const pendingReset = decodeSessionValue<PendingPasswordResetSession>(
    cookieStore.get(AUTH_PASSWORD_RESET_COOKIE)?.value,
  );

  if (!pendingReset?.authUserId || !pendingReset?.token) {
    redirect("/auth/sign-in/forgot-password");
  }

  return (
    <div className="size-full flex items-center justify-center">
      <ResetPasswordForm />
    </div>
  );
};

export default page;
