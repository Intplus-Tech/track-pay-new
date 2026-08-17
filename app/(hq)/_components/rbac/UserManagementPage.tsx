"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBranchesQuery } from "@/hooks/rbac/useBranchesQuery";
import { useRolesQuery } from "@/hooks/rbac/useRolesQuery";
import { DEFAULT_USER_DIRECTORY_QUERY, type UserDirectoryQuery, useUsersQuery } from "@/hooks/rbac/useUsersQuery";
import type { RbacUser } from "@/types/rbac";
import { InlineMessage, ManagementPageShell, Panel, PrimaryAction, StatsGrid } from "./shared";
import { CreateUserDialog } from "./CreateUserDialog";
import { UserManagementFilters } from "./UserManagementFilters";

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

export default function UserManagementPage() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [query, setQuery] = useState<UserDirectoryQuery>(DEFAULT_USER_DIRECTORY_QUERY);
  const [pendingQuery, setPendingQuery] = useState<UserDirectoryQuery>(DEFAULT_USER_DIRECTORY_QUERY);

  const usersQuery = useUsersQuery(query);
  const rolesQuery = useRolesQuery();
  const branchesQuery = useBranchesQuery();

  const totalUsers = usersQuery.data?.total ?? 0;
  const loading = usersQuery.isLoading || rolesQuery.isLoading || branchesQuery.isLoading;
  const tableLoading = usersQuery.isFetching;
  const errorMessage = usersQuery.error?.message ?? rolesQuery.error?.message ?? branchesQuery.error?.message ?? null;

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

  function applyFilters() {
    setQuery({
      ...pendingQuery,
      page: 1,
    });
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
          <div className="font-medium text-foreground">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
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
          {row.original.isDeleted ? "Deleted" : row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

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
      value: String((usersQuery.data?.data ?? []).filter((user) => user.isActive && !user.isDeleted).length),
      note: "Currently available for sign-in",
    },
    {
      label: "Assigned roles",
      value: String((usersQuery.data?.data ?? []).filter((user) => user.roleId).length),
      note: "Users linked to a backend role",
    },
    {
      label: "2FA enabled",
      value: String((usersQuery.data?.data ?? []).filter((user) => user.twoFactorEnabled).length),
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
        description="Server-side filters and sorting are applied using the documented `/api/v1/users` query parameters. Click a row to open the full user detail page."
      >
        {errorMessage ? <InlineMessage tone="error" message={errorMessage} /> : null}
        {loading ? <InlineMessage tone="info" message="Loading users, roles, and branches..." /> : null}
        {!loading ? (
          <>
            <UserManagementFilters
              pendingQuery={pendingQuery}
              setPendingQuery={setPendingQuery}
              roles={rolesQuery.data ?? []}
              branches={branchesQuery.data ?? []}
              onApply={applyFilters}
              onReset={resetFilters}
            />

            {tableLoading ? <InlineMessage tone="info" message="Loading filtered users..." /> : null}

            <DataTable
              title="Users"
              columns={columns}
              data={userRows}
              searchConfig={{ enabled: true, placeholder: "Search current page" }}
              exportConfig={{ enabled: true, options: ["csv", "excel"] }}
              paginationConfig={{ enabled: false }}
              onRowClick={(row) => {
                router.push(`/home/user-management/${row.id}`);
              }}
            />

            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {query.page} of {totalPages}. Showing {userRows.length} of {totalUsers} users.
              </p>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" disabled={!canGoPrevious || tableLoading} onClick={() => void goToPage(query.page - 1)}>
                  Previous
                </Button>
                <Button type="button" variant="outline" disabled={!canGoNext || tableLoading} onClick={() => void goToPage(query.page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </Panel>

      <CreateUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        roles={rolesQuery.data ?? []}
        branches={branchesQuery.data ?? []}
      />
    </ManagementPageShell>
  );
}
