import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_ACCESS_TOKEN_COOKIE, AUTH_USER_COOKIE, decodeSessionValue, type AuthUser } from "@/lib/auth";
import { getBackendJson, readBackendBody } from "@/lib/backend";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  Hash,
  Target,
  Banknote,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EditProfileModal } from "./_components/EditProfileModal";

export const dynamic = "force-dynamic";

interface ProfileResponse {
  _id: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email: string;
  phoneNumber?: string;
  employeeId?: string;
  twoFactorEnabled?: boolean;
  availabilityStatus?: string;
  photoUrl?: string;
  createdAt?: string;
  maxAssignedLoans?: number;
  monthlyCollectionTarget?: string | number;
  portfolioAssignments?: any | null;
  role?: {
    _id: string;
    name: string;
  };
  branch?: {
    _id: string;
    name: string;
    code?: string;
    location?: string;
  };
}

async function getProfile(accessToken: string, userId?: string): Promise<ProfileResponse | null> {
  try {
    const res = await getBackendJson("/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await readBackendBody<ProfileResponse | string | null>(res);


    if (res.status === 401 && userId) {
      // /auth/me rejected this token — fall back to /users/:id which uses the same token
      const fallbackRes = await getBackendJson(`/api/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const fallbackData = await readBackendBody<ProfileResponse | string | null>(fallbackRes);

      if (!fallbackRes.ok || !fallbackData || typeof fallbackData === "string") {
        return null;
      }
      return fallbackData;
    }

    if (!res.ok) {
      return null;
    }
    if (!data || typeof data === "string") {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}


export default async function ProfilePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    redirect("/auth/sign-in");
  }

  // Decode the user cookie to get the userId for the /users/:id fallback
  const currentUser = decodeSessionValue<AuthUser>(cookieStore.get(AUTH_USER_COOKIE)?.value);

  const profile = await getProfile(accessToken, currentUser?.id ?? undefined);


  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold text-foreground">Unable to load profile</h2>
        <p className="mt-2 text-sm text-muted-foreground">Please try refreshing the page or logging in again.</p>
      </div>
    );
  }

  const displayName =
    [profile.firstName, profile.middleName, profile.lastName]
      .filter((part): part is string => Boolean(part))
      .join(" ")
      .trim() || profile.email.split("@")[0] || "TrackPay User";

  const initials =
    profile.firstName && profile.lastName
      ? `${profile.firstName[0]}${profile.lastName[0]}`
      : displayName.substring(0, 2).toUpperCase() || "U";

  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "Unknown";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account information and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Basic Info */}
        <Card className="md:col-span-1 shadow-sm border-border">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 mb-4 border-4 border-card shadow-md">
              <AvatarImage src={profile.photoUrl} alt={displayName} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground mt-1">{profile.role?.name || "No Role Assigned"}</p>

            <div className="flex gap-2 mt-4">
              <Badge variant={profile.availabilityStatus === "ACTIVE" ? "default" : "secondary"} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                {profile.availabilityStatus === "ACTIVE" ? "Available" : "Unavailable"}
              </Badge>
              {profile.twoFactorEnabled && (
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                  <Shield className="w-3 h-3 mr-1" />
                  2FA Active
                </Badge>
              )}
            </div>

            <Separator className="my-6" />

            <div className="w-full space-y-4 text-left">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
                <span className="text-muted-foreground">Joined {joinDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Detailed Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-4 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Personal Information
              </CardTitle>
              <EditProfileModal profile={profile} />
            </CardHeader>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">First Name</dt>
                  <dd className="mt-1 text-sm text-foreground font-medium">{profile.firstName || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Name</dt>
                  <dd className="mt-1 text-sm text-foreground font-medium">{profile.lastName || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Middle Name</dt>
                  <dd className="mt-1 text-sm text-foreground font-medium">{profile.middleName || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Phone Number</dt>
                  <dd className="mt-1 flex items-center text-sm text-foreground font-medium">
                    <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                    {profile.phoneNumber || "Not provided"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Email Address</dt>
                  <dd className="mt-1 flex items-center text-sm text-foreground font-medium">
                    <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                    {profile.email}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="pb-4 border-b border-border/60">
              <CardTitle className="text-lg flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-primary" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center">
                    <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
                    Employee ID
                  </dt>
                  <dd className="mt-1 text-sm text-foreground font-medium">{profile.employeeId || "Not assigned"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                    Branch
                  </dt>
                  <dd className="mt-1 text-sm text-foreground font-medium">{profile.branch?.name || "Head Office"}</dd>
                </div>
                {profile.branch?.location && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                      Location
                    </dt>
                    <dd className="mt-1 text-sm text-foreground font-medium">{profile.branch.location}</dd>
                  </div>
                )}
                {profile.maxAssignedLoans !== undefined && profile.maxAssignedLoans !== null && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground flex items-center">
                      <Target className="w-4 h-4 mr-2 text-muted-foreground" />
                      Max Assigned Loans
                    </dt>
                    <dd className="mt-1 text-sm text-foreground font-medium">{profile.maxAssignedLoans}</dd>
                  </div>
                )}
                {profile.monthlyCollectionTarget !== undefined && profile.monthlyCollectionTarget !== null && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground flex items-center">
                      <Banknote className="w-4 h-4 mr-2 text-muted-foreground" />
                      Monthly Collection Target
                    </dt>
                    <dd className="mt-1 text-sm text-foreground font-medium">{profile.monthlyCollectionTarget}</dd>
                  </div>
                )}
                {profile.portfolioAssignments !== undefined && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                      Portfolio Assignments
                    </dt>
                    <dd className="mt-1 text-sm text-foreground font-medium">
                      {profile.portfolioAssignments === null ? "None" : JSON.stringify(profile.portfolioAssignments)}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="pb-4 border-b border-border/60">
              <CardTitle className="text-lg flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Two-Factor Authentication (2FA)</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
                {profile.twoFactorEnabled ? (
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 px-3 py-1">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-border text-muted-foreground bg-muted px-3 py-1">
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Disabled
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
