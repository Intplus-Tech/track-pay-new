"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { RowActions, DropdownMenuItem } from "@/components/data-table/RowActions";
import type { RbacPermission } from "@/types/rbac";
import { useDeletePermissionMutation } from "@/hooks/rbac/useDeletePermissionMutation";
import { usePermissionsQuery } from "@/hooks/rbac/usePermissionsQuery";
import { useRolesQuery } from "@/hooks/rbac/useRolesQuery";
import {
  InlineMessage,
  ManagementPageShell,
  Panel,
  PrimaryAction,
  StatsGrid,
} from "./shared";
import { CreatePermissionDialog } from "./CreatePermissionDialog";
import { EditPermissionDialog } from "./EditPermissionDialog";

interface PermissionRow extends RbacPermission {
  roleUsageCount: number;
}

export default function PermissionManagementPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<RbacPermission | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(null);

  const permissionsQuery = usePermissionsQuery();
  const rolesQuery = useRolesQuery();
  const deletePermissionMutation = useDeletePermissionMutation();

  const loading = permissionsQuery.isLoading || rolesQuery.isLoading;
  const errorMessage = permissionsQuery.error?.message ?? rolesQuery.error?.message ?? null;

  const permissionRows = useMemo<PermissionRow[]>(() => {
    const permissions = permissionsQuery.data ?? [];
    const roles = rolesQuery.data ?? [];

    return permissions.map((permission) => ({
      ...permission,
      roleUsageCount: roles.filter((role) => role.permissionIds.includes(permission.id)).length,
    }));
  }, [permissionsQuery.data, rolesQuery.data]);

  async function handleDeletePermission(id: string, name: string) {
    setPendingDeleteName(name);

    try {
      await deletePermissionMutation.mutateAsync(id);
      toast.success(`${name} deleted.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete permission.");
    } finally {
      setPendingDeleteName(null);
    }
  }

  function openEditPermission(permission: RbacPermission) {
    setSelectedPermission(permission);
    setEditOpen(true);
  }

  const columns: ColumnDef<PermissionRow>[] = [
    {
      accessorKey: "name",
      header: "Permission",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description || "No description",
    },
    {
      accessorKey: "roleUsageCount",
      header: "Used by roles",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isDeleted ? "destructive" : row.original.isActive ? "default" : "outline"}>
          {row.original.isDeleted ? "Deleted" : row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActions>
          <DropdownMenuItem
            onClick={() => {
              openEditPermission(row.original);
            }}
          >
            Edit permission
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={deletePermissionMutation.isPending}
            onClick={() => {
              void handleDeletePermission(row.original.id, row.original.name);
            }}
          >
            {deletePermissionMutation.isPending && pendingDeleteName === row.original.name
              ? "Deleting..."
              : "Delete permission"}
          </DropdownMenuItem>
        </RowActions>
      ),
    },
  ];

  const stats = [
    {
      label: "Total permissions",
      value: String(permissionsQuery.data?.length ?? 0),
      note: "Current permission catalog",
    },
    {
      label: "Active permissions",
      value: String(
        (permissionsQuery.data ?? []).filter(
          (permission) => permission.isActive && !permission.isDeleted,
        ).length,
      ),
      note: "Permissions available for assignment",
    },
    {
      label: "Linked permissions",
      value: String(permissionRows.filter((permission) => permission.roleUsageCount > 0).length),
      note: "Permissions attached to at least one role",
    },
    {
      label: "Unused permissions",
      value: String(permissionRows.filter((permission) => permission.roleUsageCount === 0).length),
      note: "Candidates for cleanup",
    },
  ];

  return (
    <ManagementPageShell
      eyebrow="RBAC workspace"
      title="Permission management"
      description="Maintain the permission catalog and review which permissions are actually in use across backend roles."
      actions={<PrimaryAction label="Add permission" onClick={() => setCreateOpen(true)} />}
    >
      <StatsGrid items={stats} />
      <Panel
        title="Permissions"
        description="Live permission data from the backend. Use usage counts to spot stale or orphaned permissions before deleting them."
      >
        {errorMessage ? <InlineMessage tone="error" message={errorMessage} /> : null}
        {deletePermissionMutation.isPending && pendingDeleteName ? (
          <InlineMessage
            tone="info"
            message={`Deleting ${pendingDeleteName}...`}
          />
        ) : null}
        {loading ? (
          <InlineMessage tone="info" message="Loading permissions and role usage..." />
        ) : (
          <DataTable
            title="Permissions"
            columns={columns}
            data={permissionRows}
            searchConfig={{ enabled: true, placeholder: "Search permissions" }}
            exportConfig={{ enabled: true, options: ["csv", "excel"] }}
            paginationConfig={{ enabled: true, pageSizeOptions: [10, 20, 50] }}
          />
        )}
      </Panel>

      <CreatePermissionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <EditPermissionDialog
        open={editOpen}
        onOpenChange={(isOpen) => {
          setEditOpen(isOpen);
          if (!isOpen) {
            setSelectedPermission(null);
          }
        }}
        permission={selectedPermission}
      />
    </ManagementPageShell>
  );
}