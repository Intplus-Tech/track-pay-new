"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RowActions, DropdownMenuItem } from "@/components/data-table/RowActions";
import { useBranchesQuery } from "@/hooks/rbac/useBranchesQuery";
import { useCreateUserMutation } from "@/hooks/rbac/useCreateUserMutation";
import { useDeleteUserMutation } from "@/hooks/rbac/useDeleteUserMutation";
import { useRolesQuery } from "@/hooks/rbac/useRolesQuery";
import { useUpdateUserMutation } from "@/hooks/rbac/useUpdateUserMutation";
import { useUpdateUserPermissionsMutation } from "@/hooks/rbac/useUpdateUserPermissionsMutation";
import { useUserQuery } from "@/hooks/rbac/useUserQuery";
import {
  DEFAULT_USER_DIRECTORY_QUERY,
  type UserDirectoryQuery,
  useUsersQuery,
} from "@/hooks/rbac/useUsersQuery";
import { RBAC_MODULE_OPTIONS } from "@/lib/rbac";
import type {
  RbacModuleName,
  RbacModulePermission,
  RbacUser,
  UpdateUserPayload,
} from "@/types/rbac";
import {
  InlineMessage,
  ManagementPageShell,
  Panel,
  PrimaryAction,
  StatsGrid,
} from "./shared";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.string().optional(),
  branchId: z.string().optional(),
  isActive: z.boolean(),
});

type CreateUserValues = z.infer<typeof createUserSchema>;

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
  roleId: z.string().optional(),
  branchId: z.string().optional(),
  isActive: z.boolean(),
});

type UpdateUserValues = z.infer<typeof updateUserSchema>;

type PermissionGrid = Record<RbacModuleName, { view: boolean; manage: boolean }>;

interface UserRow extends RbacUser {
  roleName: string;
  branchName: string;
}

function statusVariant(row: RbacUser) {
  if (row.isDeleted) {
    return "destructive" as const;
  }

  return row.isActive ? "default" : "outline";
}

function createEmptyPermissionGrid(): PermissionGrid {
  return RBAC_MODULE_OPTIONS.reduce((grid, option) => {
    grid[option.module] = { view: false, manage: false };
    return grid;
  }, {} as PermissionGrid);
}

function createPermissionGrid(
  modulePermissions?: RbacModulePermission[],
): PermissionGrid {
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

export default function UserManagementPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [permissionGrid, setPermissionGrid] = useState<PermissionGrid>(() => createEmptyPermissionGrid());
  const [query, setQuery] = useState<UserDirectoryQuery>(DEFAULT_USER_DIRECTORY_QUERY);
  const [pendingQuery, setPendingQuery] = useState<UserDirectoryQuery>(DEFAULT_USER_DIRECTORY_QUERY);

  const usersQuery = useUsersQuery(query);
  const rolesQuery = useRolesQuery();
  const branchesQuery = useBranchesQuery();
  const createUserMutation = useCreateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const updateUserPermissionsMutation = useUpdateUserPermissionsMutation();
  const userDetailQuery = useUserQuery(editingUser?.id ?? null, editDialogOpen);

  const totalUsers = usersQuery.data?.total ?? 0;
  const loading = usersQuery.isLoading || rolesQuery.isLoading || branchesQuery.isLoading;
  const tableLoading = usersQuery.isFetching;
  const errorMessage =
    usersQuery.error?.message ?? rolesQuery.error?.message ?? branchesQuery.error?.message ?? null;

  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roleId: "unassigned",
      branchId: "unassigned",
      isActive: true,
    },
  });

  const editForm = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roleId: "unassigned",
      branchId: "unassigned",
      isActive: true,
    },
  });

  const userRows = useMemo<UserRow[]>(() => {
    const users = usersQuery.data?.data ?? [];
    const roles = rolesQuery.data ?? [];
    const branches = branchesQuery.data ?? [];

    return users.map((user) => ({
      ...user,
      roleName: roles.find((role) => role.id === user.roleId)?.name ?? "Unassigned",
      branchName: branches.find((branch) => branch.id === user.branchId)?.name ?? "No branch",
    }));
  }, [branchesQuery.data, rolesQuery.data, usersQuery.data]);

  async function handleDeleteUser(id: string, name: string) {
    try {
      await deleteUserMutation.mutateAsync(id);
      toast.success(`${name} deactivated.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to deactivate user.");
    }
  }

  function openProfileEditor(user: UserRow) {
    setEditingUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      password: "",
      roleId: user.roleId ?? "unassigned",
      branchId: user.branchId ?? "unassigned",
      isActive: Boolean(user.isActive),
    });
    setEditDialogOpen(true);
  }

  function openPermissionEditor(user: UserRow) {
    setSelectedUser(user);
    setPermissionGrid(createPermissionGrid(user.modulePermissions));
    setPermissionsOpen(true);
  }

  useEffect(() => {
    if (!editDialogOpen || !userDetailQuery.data) {
      return;
    }

    editForm.reset({
      name: userDetailQuery.data.name,
      email: userDetailQuery.data.email,
      password: "",
      roleId: userDetailQuery.data.roleId ?? "unassigned",
      branchId: userDetailQuery.data.branchId ?? "unassigned",
      isActive: Boolean(userDetailQuery.data.isActive),
    });
  }, [editDialogOpen, editForm, userDetailQuery.data]);

  function updatePermissionValue(
    module: RbacModuleName,
    field: "view" | "manage",
    checked: boolean,
  ) {
    setPermissionGrid((current) => {
      const next = {
        ...current,
        [module]: {
          ...current[module],
        },
      };

      if (field === "manage") {
        next[module] = {
          view: checked ? true : next[module].view,
          manage: checked,
        };
      } else {
        next[module] = {
          view: checked,
          manage: checked ? next[module].manage : false,
        };
      }

      if (!next[module].view) {
        next[module].manage = false;
      }

      return next;
    });
  }

  async function handleSavePermissions() {
    if (!selectedUser) {
      return;
    }

    try {
      await updateUserPermissionsMutation.mutateAsync({
        id: selectedUser.id,
        modulePermissions: serializePermissionGrid(permissionGrid),
      });
      toast.success("User permissions updated.");
      setPermissionsOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update permissions.");
    }
  }

  function applyFilters() {
    const nextQuery: UserDirectoryQuery = {
      ...pendingQuery,
      page: 1,
    };

    setQuery(nextQuery);
  }

  function resetFilters() {
    setPendingQuery(DEFAULT_USER_DIRECTORY_QUERY);
    setQuery(DEFAULT_USER_DIRECTORY_QUERY);
  }

  function goToPage(nextPage: number) {
    const nextQuery = {
      ...query,
      page: nextPage,
    };

    setQuery(nextQuery);
    setPendingQuery(nextQuery);
  }

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-slate-900">{row.original.name}</div>
          <div className="text-xs text-slate-500">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "roleName",
      header: "Role",
    },
    {
      accessorKey: "branchName",
      header: "Branch",
    },
    {
      accessorKey: "twoFactorEnabled",
      header: "2FA",
      cell: ({ row }) => (
        <Badge variant={row.original.twoFactorEnabled ? "default" : "outline"}>
          {row.original.twoFactorEnabled ? "Enabled" : "Disabled"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusVariant(row.original)}>
          {row.original.isDeleted
            ? "Deleted"
            : row.original.isActive
              ? "Active"
              : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActions>
          <DropdownMenuItem
            onClick={() => {
              openProfileEditor(row.original);
            }}
          >
            Edit user profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              openPermissionEditor(row.original);
            }}
          >
            View/Edit Permission
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              void handleDeleteUser(row.original.id, row.original.name);
            }}
          >
            Deactivate user
          </DropdownMenuItem>
        </RowActions>
      ),
    },
  ];

  async function onSubmit(values: CreateUserValues) {
    try {
      await createUserMutation.mutateAsync(
        {
          ...values,
          roleId: values.roleId === "unassigned" ? undefined : values.roleId,
          branchId: values.branchId === "unassigned" ? undefined : values.branchId,
        },
      );
      toast.success("User created.");
      form.reset({
        name: "",
        email: "",
        password: "",
        roleId: "unassigned",
        branchId: "unassigned",
        isActive: true,
      });
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create user.");
    }
  }

  async function onEditSubmit(values: UpdateUserValues) {
    if (!editingUser) {
      return;
    }

    const payload: UpdateUserPayload = {
      name: values.name,
      email: values.email,
      roleId: values.roleId === "unassigned" ? undefined : values.roleId,
      branchId: values.branchId === "unassigned" ? undefined : values.branchId,
      isActive: values.isActive,
    };

    if (values.password && values.password.trim().length > 0) {
      payload.password = values.password;
    }

    try {
      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        payload,
      });
      toast.success("User updated.");
      setEditDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update user.");
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalUsers / query.limit));
  const canGoPrevious = query.page > 1;
  const canGoNext = query.page < totalPages;

  const stats = [
    {
      label: "Total users",
      value: String(totalUsers),
      note: "Matching users for current server-side filters",
    },
    {
      label: "Active users",
      value: String(
        (usersQuery.data?.data ?? []).filter(
          (user) => user.isActive && !user.isDeleted,
        ).length,
      ),
      note: "Currently available for sign-in",
    },
    {
      label: "Assigned roles",
      value: String((usersQuery.data?.data ?? []).filter((user) => user.roleId).length),
      note: "Users linked to a backend role",
    },
    {
      label: "2FA enabled",
      value: String(
        (usersQuery.data?.data ?? []).filter((user) => user.twoFactorEnabled).length,
      ),
      note: "Users with multi-factor sign-in enabled",
    },
  ];

  return (
    <ManagementPageShell
      eyebrow="RBAC workspace"
      title="User management"
      description="Create operational users, assign branches and roles, and review account status without leaving the HQ dashboard."
      actions={<PrimaryAction label="Add user" onClick={() => setDialogOpen(true)} />}
    >
      <StatsGrid items={stats} />
      <Panel
        title="Directory"
        description="Server-side filters and sorting are applied using the documented `/api/v1/users` query parameters."
      >
        {errorMessage ? <InlineMessage tone="error" message={errorMessage} /> : null}
        {loading ? (
          <InlineMessage tone="info" message="Loading users, roles, and branches..." />
        ) : (
          <>
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Name</p>
                <Input
                  value={pendingQuery.name}
                  placeholder="Filter by name"
                  onChange={(event) =>
                    setPendingQuery((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Email</p>
                <Input
                  value={pendingQuery.email}
                  placeholder="Filter by email"
                  onChange={(event) =>
                    setPendingQuery((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Role</p>
                <Select
                  value={pendingQuery.roleId}
                  onValueChange={(value) =>
                    setPendingQuery((current) => ({
                      ...current,
                      roleId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All roles</SelectItem>
                    {(rolesQuery.data ?? []).map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Branch</p>
                <Select
                  value={pendingQuery.branchId}
                  onValueChange={(value) =>
                    setPendingQuery((current) => ({
                      ...current,
                      branchId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All branches" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All branches</SelectItem>
                    {(branchesQuery.data ?? []).map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Active</p>
                <Select
                  value={pendingQuery.isActive}
                  onValueChange={(value: "all" | "true" | "false") =>
                    setPendingQuery((current) => ({
                      ...current,
                      isActive: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="true">Active only</SelectItem>
                    <SelectItem value="false">Inactive only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Deleted</p>
                <Select
                  value={pendingQuery.isDeleted}
                  onValueChange={(value: "all" | "true" | "false") =>
                    setPendingQuery((current) => ({
                      ...current,
                      isDeleted: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="false">Not deleted</SelectItem>
                    <SelectItem value="true">Deleted only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Sort order</p>
                <Select
                  value={pendingQuery.order}
                  onValueChange={(value: "ASC" | "DESC") =>
                    setPendingQuery((current) => ({
                      ...current,
                      order: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ASC" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="ASC">Ascending</SelectItem>
                    <SelectItem value="DESC">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Page size</p>
                <Select
                  value={String(pendingQuery.limit)}
                  onValueChange={(value) =>
                    setPendingQuery((current) => ({
                      ...current,
                      limit: Number(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="20" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2 md:col-span-2 xl:col-span-4">
                <Button type="button" onClick={() => void applyFilters()}>
                  Apply filters
                </Button>
                <Button type="button" variant="outline" onClick={() => void resetFilters()}>
                  Reset
                </Button>
              </div>
            </div>

            {tableLoading ? (
              <InlineMessage tone="info" message="Loading filtered users..." />
            ) : null}

            <DataTable
              title="Users"
              columns={columns}
              data={userRows}
              searchConfig={{ enabled: true, placeholder: "Search current page" }}
              exportConfig={{ enabled: true, options: ["csv", "excel"] }}
              paginationConfig={{ enabled: false }}
            />

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-600">
                Page {query.page} of {totalPages}. Showing {userRows.length} of {totalUsers} users.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canGoPrevious || tableLoading}
                  onClick={() => void goToPage(query.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canGoNext || tableLoading}
                  onClick={() => void goToPage(query.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Panel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Amina Yusuf" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="amina@trackpay.io" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporary password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Minimum 8 characters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
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
                          {(rolesQuery.data ?? []).map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
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
                          {(branchesQuery.data ?? []).map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2">
                      <div>
                        <FormLabel>Active account</FormLabel>
                        <p className="text-sm text-slate-500">Inactive users remain in the system but should not authenticate.</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Create user"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditDialogOpen(false);
            setEditingUser(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? `Edit user profile: ${editingUser.name}` : "Edit user profile"}
            </DialogTitle>
          </DialogHeader>

          {userDetailQuery.isLoading ? (
            <InlineMessage tone="info" message="Loading latest user details..." />
          ) : null}
          {userDetailQuery.error ? (
            <InlineMessage
              tone="error"
              message={
                userDetailQuery.error instanceof Error
                  ? userDetailQuery.error.message
                  : "Unable to load user details."
              }
            />
          ) : null}

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Amina Yusuf" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="amina@trackpay.io" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Leave blank to keep current"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="roleId"
                  render={({ field }) => (
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
                          {(rolesQuery.data ?? []).map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="branchId"
                  render={({ field }) => (
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
                          {(branchesQuery.data ?? []).map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2">
                      <div>
                        <FormLabel>Active account</FormLabel>
                        <p className="text-sm text-slate-500">Inactive users remain in the system but should not authenticate.</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending || userDetailQuery.isLoading}
                >
                  {updateUserMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={permissionsOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPermissionsOpen(false);
            setSelectedUser(null);
          }
        }}
      >
        <DialogContent className="lg:min-w-[800px]">
          <DialogHeader>
            <DialogTitle className="px-6 pt-6">
              {selectedUser ? `Edit permissions for ${selectedUser.name}` : "Edit permissions"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex max-h-[calc(92vh-6rem)] min-h-0 flex-col gap-5 overflow-hidden px-6 pb-6">
            {selectedUser ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div className="font-semibold text-slate-900">{selectedUser.name}</div>
                <div>{selectedUser.email}</div>
                <div className="mt-1 break-words text-xs uppercase tracking-[0.16em] text-slate-500">
                  {selectedUser.roleName} · {selectedUser.branchName}
                </div>
              </div>
            ) : null}

            <div className="grid min-h-0 max-h-[52vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-1 lg:grid-cols-2">
              {RBAC_MODULE_OPTIONS.map((option) => {
                const current = permissionGrid[option.module];

                return (
                  <div
                    key={option.module}
                    className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="break-words text-sm font-semibold leading-snug text-slate-900">
                        {option.label}
                      </div>
                      <div className="break-words text-sm leading-snug text-slate-500">
                        {option.description}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="flex min-w-[8.5rem] items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                        <Switch
                          checked={current.view}
                          onCheckedChange={(checked) =>
                            updatePermissionValue(option.module, "view", checked)
                          }
                        />
                        <span className="whitespace-nowrap text-sm font-medium text-slate-700">
                          View
                        </span>
                      </label>

                      <label className="flex min-w-[8.5rem] items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                        <Switch
                          checked={current.manage}
                          onCheckedChange={(checked) =>
                            updatePermissionValue(option.module, "manage", checked)
                          }
                        />
                        <span className="whitespace-nowrap text-sm font-medium text-slate-700">
                          Manage
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPermissionsOpen(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={updateUserPermissionsMutation.isPending}
                onClick={() => void handleSavePermissions()}
              >
                {updateUserPermissionsMutation.isPending ? "Saving..." : "Save permissions"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ManagementPageShell>
  );
}