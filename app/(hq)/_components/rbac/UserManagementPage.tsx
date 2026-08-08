"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { fetchJson, mutateJson } from "@/lib/rbac-client";
import type { RbacBranch, RbacPaginationResponse, RbacRole, RbacUser } from "@/types/rbac";
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

interface UserRow extends RbacUser {
  roleName: string;
  branchName: string;
}

interface UserDirectoryQuery {
  page: number;
  limit: number;
  name: string;
  email: string;
  roleId: string;
  branchId: string;
  isActive: "all" | "true" | "false";
  isDeleted: "all" | "true" | "false";
  order: "ASC" | "DESC";
}

const DEFAULT_QUERY: UserDirectoryQuery = {
  page: 1,
  limit: 100,
  name: "",
  email: "",
  roleId: "all",
  branchId: "all",
  isActive: "all",
  isDeleted: "all",
  order: "ASC",
};

function statusVariant(row: RbacUser) {
  if (row.isDeleted) {
    return "destructive" as const;
  }

  return row.isActive ? "default" : "outline";
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<RbacUser[]>([]);
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [branches, setBranches] = useState<RbacBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [query, setQuery] = useState<UserDirectoryQuery>(DEFAULT_QUERY);
  const [pendingQuery, setPendingQuery] = useState<UserDirectoryQuery>(DEFAULT_QUERY);
  const [totalUsers, setTotalUsers] = useState(0);

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

  const buildQueryString = useCallback((nextQuery: UserDirectoryQuery) => {
    const params = new URLSearchParams({
      page: String(nextQuery.page),
      limit: String(nextQuery.limit),
    });

    // Preserve backend default ordering unless the user explicitly requests DESC.
    if (nextQuery.order === "DESC") {
      params.set("order", nextQuery.order);
    }

    if (nextQuery.name.trim().length > 0) {
      params.set("name", nextQuery.name.trim());
    }

    if (nextQuery.email.trim().length > 0) {
      params.set("email", nextQuery.email.trim());
    }

    if (nextQuery.roleId !== "all") {
      params.set("roleId", nextQuery.roleId);
    }

    if (nextQuery.branchId !== "all") {
      params.set("branchId", nextQuery.branchId);
    }

    if (nextQuery.isActive !== "all") {
      params.set("isActive", nextQuery.isActive);
    }

    if (nextQuery.isDeleted !== "all") {
      params.set("isDeleted", nextQuery.isDeleted);
    }

    return params.toString();
  }, []);

  const loadReferenceData = useCallback(async () => {
    const [rolesResponse, branchesResponse] = await Promise.all([
      fetchJson<RbacRole[]>("/api/roles", "Unable to load roles."),
      fetchJson<RbacBranch[]>("/api/branches", "Unable to load branches."),
    ]);

    setRoles(rolesResponse);
    setBranches(branchesResponse);
  }, []);

  const loadUsers = useCallback(async (nextQuery: UserDirectoryQuery) => {
    setTableLoading(true);
    setErrorMessage(null);

    try {
      const usersResponse = await fetchJson<RbacPaginationResponse<RbacUser>>(
        `/api/users?${buildQueryString(nextQuery)}`,
        "Unable to load users.",
      );

      setUsers(usersResponse.data);
      setTotalUsers(usersResponse.total);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load user management data.");
    } finally {
      setTableLoading(false);
    }
  }, [buildQueryString]);

  useEffect(() => {
    async function initialize() {
      setLoading(true);
      setTableLoading(true);

      try {
        await loadReferenceData();
        await loadUsers(DEFAULT_QUERY);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load user management data.");
      } finally {
        setLoading(false);
      }
    }

    void initialize();
  }, [loadReferenceData, loadUsers]);

  const userRows = useMemo<UserRow[]>(() => {
    return users.map((user) => ({
      ...user,
      roleName: roles.find((role) => role.id === user.roleId)?.name ?? "Unassigned",
      branchName: branches.find((branch) => branch.id === user.branchId)?.name ?? "No branch",
    }));
  }, [branches, roles, users]);

  async function handleDeleteUser(id: string, name: string) {
    try {
      await mutateJson<null>(`/api/users/${id}`, "DELETE", "Unable to deactivate user.");
      toast.success(`${name} deactivated.`);
      await loadUsers(query);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to deactivate user.");
    }
  }

  async function applyFilters() {
    const nextQuery: UserDirectoryQuery = {
      ...pendingQuery,
      page: 1,
    };

    setQuery(nextQuery);
    await loadUsers(nextQuery);
  }

  async function resetFilters() {
    setPendingQuery(DEFAULT_QUERY);
    setQuery(DEFAULT_QUERY);
    await loadUsers(DEFAULT_QUERY);
  }

  async function goToPage(nextPage: number) {
    const nextQuery = {
      ...query,
      page: nextPage,
    };

    setQuery(nextQuery);
    setPendingQuery(nextQuery);
    await loadUsers(nextQuery);
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
    setSubmitting(true);

    try {
      await mutateJson(
        "/api/users",
        "POST",
        "Unable to create user.",
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
      await loadUsers(query);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create user.");
    } finally {
      setSubmitting(false);
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
      value: String(users.filter((user) => user.isActive && !user.isDeleted).length),
      note: "Currently available for sign-in",
    },
    {
      label: "Assigned roles",
      value: String(users.filter((user) => user.roleId).length),
      note: "Users linked to a backend role",
    },
    {
      label: "2FA enabled",
      value: String(users.filter((user) => user.twoFactorEnabled).length),
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
                    {roles.map((role) => (
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
                    {branches.map((branch) => (
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
                          {roles.map((role) => (
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
                          {branches.map((branch) => (
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
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create user"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </ManagementPageShell>
  );
}