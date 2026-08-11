"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Attachment } from "@/components/ui/attachment";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InlineMessage, ManagementPageShell, Panel } from "./shared";
import { useBranchesQuery } from "@/hooks/rbac/useBranchesQuery";
import { useDeleteUserMutation } from "@/hooks/rbac/useDeleteUserMutation";
import { useRolesQuery } from "@/hooks/rbac/useRolesQuery";
import { useUpdateUserMutation } from "@/hooks/rbac/useUpdateUserMutation";
import { useUpdateUserPermissionsMutation } from "@/hooks/rbac/useUpdateUserPermissionsMutation";
import { useUserDetailQuery } from "@/hooks/rbac/useUserDetailQuery";
import { RBAC_MODULE_OPTIONS } from "@/lib/rbac";
import { uploadUserAvatar } from "@/lib/query/upload";
import type { RbacModuleName, RbacModulePermission, UpdateUserPayload } from "@/types/rbac";

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  employeeId: z.string().optional(),
  phoneNumber: z.string().optional(),
  password: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
  roleId: z.string().optional(),
  branchId: z.string().optional(),
  photoUploadId: z.string().optional(),
  isActive: z.boolean(),
});

type UpdateUserValues = z.infer<typeof updateUserSchema>;

type PermissionGrid = Record<RbacModuleName, { view: boolean; manage: boolean }>;

function createEmptyPermissionGrid(): PermissionGrid {
  return RBAC_MODULE_OPTIONS.reduce((grid, option) => {
    grid[option.module] = { view: false, manage: false };
    return grid;
  }, {} as PermissionGrid);
}

function createPermissionGrid(modulePermissions?: RbacModulePermission[]): PermissionGrid {
  const grid = createEmptyPermissionGrid();

  for (const permission of modulePermissions ?? []) {
    grid[permission.module] = {
      view: permission.view || permission.manage,
      manage: permission.manage,
    };
  }

  return grid;
}

function serializePermissionGrid(grid: PermissionGrid): RbacModulePermission[] {
  return RBAC_MODULE_OPTIONS.flatMap((option) => {
    const permission = grid[option.module];

    if (!permission.view && !permission.manage) {
      return [];
    }

    return [
      {
        module: option.module,
        view: permission.view || permission.manage,
        manage: permission.manage,
      },
    ];
  });
}

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

function modulePermissionSummary(permissionGrid: PermissionGrid) {
  return RBAC_MODULE_OPTIONS.map((option) => ({
    option,
    current: permissionGrid[option.module],
  }));
}

export default function UserDetailPage({ userId }: { userId: string }) {
  const userQuery = useUserDetailQuery(userId);
  const rolesQuery = useRolesQuery();
  const branchesQuery = useBranchesQuery();
  const updateUserMutation = useUpdateUserMutation();
  const updateUserPermissionsMutation = useUpdateUserPermissionsMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [avatarUploadPending, setAvatarUploadPending] = useState(false);
  const [avatarUploadName, setAvatarUploadName] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [permissionGrid, setPermissionGrid] = useState<PermissionGrid>(() => createEmptyPermissionGrid());

  const user = userQuery.data;

  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      firstName: "",
      middleName: "",
      lastName: "",
      employeeId: "",
      phoneNumber: "",
      password: "",
      roleId: "unassigned",
      branchId: "unassigned",
      photoUploadId: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    form.reset({
      name: user.name ?? "",
      email: user.email ?? "",
      firstName: user.firstName ?? "",
      middleName: user.middleName ?? "",
      lastName: user.lastName ?? "",
      employeeId: user.employeeId ?? "",
      phoneNumber: user.phoneNumber ?? "",
      password: "",
      roleId: user.roleId ?? "unassigned",
      branchId: user.branchId ?? "unassigned",
      photoUploadId: user.photoUploadId ?? "",
      isActive: Boolean(user.isActive),
    });
    setAvatarPreviewUrl(user.photoUrl ?? null);
    setAvatarUploadName(null);
    setPermissionGrid(createPermissionGrid(user.modulePermissions));
  }, [form, user]);

  const photoUrl = user?.photoUrl?.trim() || null;
  const role = user?.role ?? null;
  const branch = user?.branch ?? null;

  async function handleEditAvatarUpload(file: File | null) {
    if (!file) {
      return;
    }

    try {
      setAvatarUploadPending(true);
      const upload = await uploadUserAvatar(file);
      form.setValue("photoUploadId", upload.uploadId, { shouldDirty: true, shouldValidate: true });
      setAvatarUploadName(file.name);
      setAvatarPreviewUrl(upload.url);
      toast.success("Photo uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload photo.");
    } finally {
      setAvatarUploadPending(false);
    }
  }

  async function onSave(values: UpdateUserValues) {
    if (!user) {
      return;
    }

    const payload: UpdateUserPayload = {
      name: values.name,
      email: values.email,
      firstName: values.firstName?.trim() || undefined,
      middleName: values.middleName?.trim() || undefined,
      lastName: values.lastName?.trim() || undefined,
      employeeId: values.employeeId?.trim() || undefined,
      phoneNumber: values.phoneNumber?.trim() || undefined,
      roleId: values.roleId === "unassigned" ? undefined : values.roleId?.trim() || undefined,
      branchId: values.branchId === "unassigned" ? undefined : values.branchId?.trim() || undefined,
      photoUploadId: values.photoUploadId?.trim() || undefined,
      isActive: values.isActive,
    };

    if (values.password && values.password.trim().length > 0) {
      payload.password = values.password;
    }

    try {
      await updateUserMutation.mutateAsync({ id: userId, payload });
      toast.success("User updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update user.");
    }
  }

  async function onSavePermissions() {
    if (!user) {
      return;
    }

    try {
      await updateUserPermissionsMutation.mutateAsync({
        id: userId,
        modulePermissions: serializePermissionGrid(permissionGrid),
      });
      toast.success("Permissions updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update permissions.");
    }
  }

  async function onDeactivate() {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast.success("User deactivated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to deactivate user.");
    }
  }

  return (
    <ManagementPageShell
      eyebrow="RBAC workspace"
      title={
        user ? (
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white text-lg font-semibold text-slate-700">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt={user.name} className="size-full object-cover" />
              ) : (
                <span>{user.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
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
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setEditDialogOpen(true)} disabled={!user}>
            Edit profile
          </Button>
          <Button variant="destructive" onClick={() => void onDeactivate()} disabled={deleteUserMutation.isPending || !user}>
            {deleteUserMutation.isPending ? "Deactivating..." : "Deactivate user"}
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

          <Section title="Identity and timestamps" description="Account lifecycle and audit markers returned by the backend.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { key: "internalId", label: "Internal ID", value: user.id },
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

          <Section title="Organization" description="Role and branch context with the raw backend summaries.">
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
                    {/* <p className="break-all text-xs uppercase tracking-[0.14em] text-slate-500">
                      {permission._id ?? permission.id ?? "Not set"}
                    </p> */}
                    <p className="mt-2 text-sm text-slate-600">{permission.description ?? "No description"}</p>
                  </div>
                ))}
                {!role?.permissions?.length ? <InlineMessage tone="info" message="No role permissions returned by the backend." /> : null}
              </div>
              {/* <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 bg-amber-100">
                {(role?.permissionIds ?? []).map((permissionId) => (
                  <div key={permissionId} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">Permission ID</span>: {permissionId}
                  </div>
                ))}
              </div> */}
            </div>
          </Section>

          <Section title="Module permissions" description="These are direct per-user overrides. Use them only when this user needs access that differs from the permissions inherited from their assigned role.">
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                {modulePermissionSummary(permissionGrid).map(({ option, current }) => (
                  <div key={option.module} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{option.label}</p>
                      <p className="text-sm text-slate-500">{option.description}</p>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="flex min-w-[8.5rem] items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                        <Switch checked={current.view} onCheckedChange={(checked) => setPermissionGrid((currentGrid) => ({
                          ...currentGrid,
                          [option.module]: {
                            view: checked,
                            manage: checked ? currentGrid[option.module].manage : false,
                          },
                        }))} />
                        <span className="whitespace-nowrap text-sm font-medium text-slate-700">View</span>
                      </label>
                      <label className="flex min-w-[8.5rem] items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                        <Switch checked={current.manage} onCheckedChange={(checked) => setPermissionGrid((currentGrid) => ({
                          ...currentGrid,
                          [option.module]: {
                            view: checked ? true : currentGrid[option.module].view,
                            manage: checked,
                          },
                        }))} />
                        <span className="whitespace-nowrap text-sm font-medium text-slate-700">Manage</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={() => void onSavePermissions()} disabled={updateUserPermissionsMutation.isPending}>
                  {updateUserPermissionsMutation.isPending ? "Saving permissions..." : "Save permissions"}
                </Button>
              </div>
            </div>
          </Section>

        </div>
      ) : null}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[min(100vw-1rem,56rem)] max-w-none bg-white max-h-[90vh] overflow-hidden overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="middleName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="employeeId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password (optional)</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="roleId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="unassigned">No role</SelectItem>
                        {(rolesQuery.data ?? []).map((roleOption) => (
                          <SelectItem key={roleOption.id} value={roleOption.id}>
                            {roleOption.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="branchId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign a branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="unassigned">No branch</SelectItem>
                        {(branchesQuery.data ?? []).map((branchOption) => (
                          <SelectItem key={branchOption.id} value={branchOption.id}>
                            {branchOption.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="photoUploadId" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Profile photo</FormLabel>
                    <FormControl>
                      <div>
                        <Attachment
                          label="Upload avatar image"
                          description="Uploads to the backend and updates the stored upload id for this user profile."
                          value={field.value}
                          previewUrl={avatarPreviewUrl}
                          fileName={avatarUploadName}
                          isUploading={avatarUploadPending}
                          onSelect={(file) => handleEditAvatarUpload(file)}
                          onRemove={() => {
                            form.setValue("photoUploadId", "", { shouldDirty: true, shouldValidate: true });
                            setAvatarUploadName(null);
                            setAvatarPreviewUrl(null);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="isActive" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 md:col-span-2">
                    <div>
                      <FormLabel>Active account</FormLabel>
                      <p className="text-sm text-slate-500">Inactive users remain in the system but should not authenticate.</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Saving..." : "Save profile"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </ManagementPageShell>
  );
}
