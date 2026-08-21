import Settings from "@/components/settings/Settings";
import React from "react";
import { cookies } from "next/headers";
import { AUTH_USER_COOKIE, decodeSessionValue, AuthUser } from "@/lib/auth";

const page = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(AUTH_USER_COOKIE)?.value;
  const user = decodeSessionValue<AuthUser>(userCookie);

  return (
    <div className="flex w-full">
      <Settings initial2fa={user?.twoFactorEnabled ?? false} />
    </div>
  );
};

export default page;
