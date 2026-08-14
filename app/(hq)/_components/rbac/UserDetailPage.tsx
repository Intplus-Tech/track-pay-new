"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { InlineMessage, ManagementPageShell, Panel } from "./shared";
import { useBranchesQuery } from "@/hooks/rbac/useBranchesQuery";
import { useActivateUserMutation } from "@/hooks/rbac/useActivateUserMutation";
import { useDeactivateUserMutation } from "@/hooks/rbac/useDeactivateUserMutation";
import { useDeleteUserMutation } from "@/hooks/rbac/useDeleteUserMutation";
import { useRolesQuery } from "@/hooks/rbac/useRolesQuery";
import { useUserDetailQuery } from "@/hooks/rbac/useUserDetailQuery";
import { EditUserDialog } from "./EditUserDialog";
import { UserModulePermissionsSection } from "./UserModulePermissionsSection";

function fieldValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Not set";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function fieldCard({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-900">{fieldValue(value)}</p>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Panel title={title} description={description}>
      {children}
    </Panel>
  );
}

function renderDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function UserDetailPage({ userId }: { userId: string }) {
  const router = useRouter();
  const userQuery = useUserDetailQuery(userId);
  const rolesQuery = useRolesQuery();
  const branchesQuery = useBranchesQuery();
  const deleteUserMutation = useDeleteUserMutation();
  const activateUserMutation = useActivateUserMutation();
  const deactivateUserMutation = useDeactivateUserMutation();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const user = userQuery.data;
  const photoUrl = user?.photoUrl?.trim() || null;
  const role = user?.role ?? null;
  const branch = user?.branch ?? null;

  async function onDeactivate() {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast.success("User deleted successfully.");
      router.push("/home/user-management");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete user.");
    }
  }

  async function onToggleActive() {
    if (!user) {
      return;
    }

    try {
      if (user.isActive) {
        await deactivateUserMutation.mutateAsync({ id: userId });
        toast.success("User deactivated successfully.");
      } else {
        await activateUserMutation.mutateAsync({ id: userId });
        toast.success("User activated successfully.");
      }
      await userQuery.refetch();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Unable to ${user.isActive ? "deactivate" : "activate"} user.`,
      );
    }
  }

  return (
    <ManagementPageShell
      eyebrow="RBAC workspace"
      title={
        user ? (
          <div className="flex min-w-0 items-start gap-4">
            <Avatar className="size-24">
              {photoUrl ? <AvatarImage src={photoUrl} alt={user.name} /> : null}
              <AvatarFallback >
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="break-words">{user.name}</span>
                <Badge variant={user.isActive ? "default" : "outline"}>{user.isActive ? "Active" : "Inactive"}</Badge>
                <Badge variant={user.isDeleted ? "destructive" : "outline"}>{user.isDeleted ? "Deleted" : "Available"}</Badge>
              </div>
              <div className="break-all text-sm font-normal leading-6 text-slate-600">{user.email}</div>
            </div>
          </div>
        ) : (
          "User detail"
        )
      }
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setEditDialogOpen(true)} disabled={!user}>
            Edit profile
          </Button>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
            <span className="text-sm font-medium text-slate-600">
              {activateUserMutation.isPending || deactivateUserMutation.isPending
                ? "Updating..."
                : user?.isActive
                  ? "Active"
                  : "Inactive"}
            </span>
            <Switch
              checked={user?.isActive ?? false}
              onCheckedChange={() => void onToggleActive()}
              disabled={activateUserMutation.isPending || deactivateUserMutation.isPending || !user}
            />
          </div>
          <Button variant="destructive" onClick={() => void onDeactivate()} disabled={deleteUserMutation.isPending || !user}>
            {deleteUserMutation.isPending ? "Deleting..." : "Delete user"}
          </Button>
        </div>
      }
    >
      {userQuery.isLoading ? <InlineMessage tone="info" message="Loading user detail..." /> : null}
      {userQuery.error ? (
        <InlineMessage
          tone="error"
          message={userQuery.error instanceof Error ? userQuery.error.message : "Unable to load user detail."}
        />
      ) : null}

      {user ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
            {[
              // { key: "mongoId", label: "Mongo ID", value: user._id ?? user.id },
              { key: "employeeId", label: "Employee ID", value: user.employeeId },
              { key: "firstName", label: "First name", value: user.firstName },
              { key: "middleName", label: "Middle name", value: user.middleName },
              { key: "lastName", label: "Last name", value: user.lastName },
              { key: "phoneNumber", label: "Phone", value: user.phoneNumber },
              // { key: "photoUrl", label: "Photo URL", value: user.photoUrl },
              // { key: "photoUploadId", label: "Photo upload ID", value: user.photoUploadId },
              { key: "monthlyCollectionTarget", label: "Monthly target", value: user.monthlyCollectionTarget },
              { key: "maxAssignedLoans", label: "Max assigned loans", value: user.maxAssignedLoans },
              { key: "portfolioAssignments", label: "Portfolio assignments", value: Array.isArray(user.portfolioAssignments) ? user.portfolioAssignments.length : null },
            ].map((item) => (
              <div key={item.key}>{fieldCard(item)}</div>
            ))}
          </div>

          <Section title="Identity and timestamps" description="Account lifecycle and audit markers.">
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
              {[
                // { key: "internalId", label: "Internal ID", value: user.id },
                { key: "createdAt", label: "Created at", value: renderDate(user.createdAt) },
                { key: "updatedAt", label: "Updated at", value: renderDate(user.updatedAt) },
                { key: "deletedAt", label: "Deleted at", value: renderDate(user.deletedAt) },
                { key: "active", label: "Active", value: user.isActive },
                { key: "deleted", label: "Deleted", value: user.isDeleted },
                { key: "twoFactorEnabled", label: "2FA enabled", value: user.twoFactorEnabled },
              ].map((item) => (
                <div key={item.key}>{fieldCard(item)}</div>
              ))}
            </div>
          </Section>

          <Section title="Organization" description="Role and branch context.">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Role</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { key: "roleName", label: "Role name", value: role?.name },
                    { key: "isActive", label: "Active", value: role?.isActive },
                    // { key: "roleId", label: "Role ID", value: role?._id ?? user.roleId },
                    { key: "roleDescription", label: "Description", value: role?.description },
                    { key: "rolePermissionCount", label: "Permission count", value: role?.permissionIds?.length ?? 0 },
                  ].map((item) => (
                    <div key={item.key}>{fieldCard(item)}</div>
                  ))}
                </div>
              </div>
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Branch</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { key: "branchName", label: "Branch name", value: branch?.name },
                    // { key: "branchId", label: "Branch ID", value: branch?._id ?? user.branchId },
                    { key: "branchCode", label: "Code", value: branch?.code },
                    { key: "branchLocation", label: "Location", value: branch?.location },
                    { key: "branchStatus", label: "Status", value: branch?.status },
                    { key: "branchHeadOffice", label: "Head office", value: branch?.isHeadOffice },
                    // { key: "branchManagerId", label: "Manager ID", value: branch?.managerId },
                    // { key: "branchParentId", label: "Parent branch", value: branch?.parentBranchId },
                  ].map((item) => (
                    <div key={item.key}>{fieldCard(item)}</div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Role permissions" description="The permissions attached to the user’s role, as returned by the backend.">
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {(role?.permissions ?? []).map((permission) => (
                  <div key={permission._id ?? permission.id ?? permission.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{permission.name}</p>
                    <p className="mt-2 text-sm text-slate-600">{permission.description ?? "No description"}</p>
                  </div>
                ))}
                {!role?.permissions?.length ? <InlineMessage tone="info" message="No role permissions returned by the backend." /> : null}
              </div>
            </div>
          </Section>

          <UserModulePermissionsSection user={user} />
        </div>
      ) : null}

      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={user ?? null}
        roles={rolesQuery.data ?? []}
        branches={branchesQuery.data ?? []}
      />
    </ManagementPageShell>
  );
}
