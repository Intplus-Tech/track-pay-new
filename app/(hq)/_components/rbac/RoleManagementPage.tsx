"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { RowActions, DropdownMenuItem } from "@/components/data-table/RowActions";
import type { RbacRole } from "@/types/rbac";
import { useDeleteRoleMutation } from "@/hooks/rbac/useDeleteRoleMutation";
import { usePermissionsQuery } from "@/hooks/rbac/usePermissionsQuery";
import { useRolesQuery } from "@/hooks/rbac/useRolesQuery";
import {
  InlineMessage,
  ManagementPageShell,
  Panel,
  PrimaryAction,
  StatsGrid,
} from "./shared";
import { CreateRoleDialog } from "./CreateRoleDialog";
import { EditRoleDialog } from "./EditRoleDialog";

export default function RoleManagementPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RbacRole | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(null);

  const rolesQuery = useRolesQuery();
  const permissionsQuery = usePermissionsQuery();
  const deleteRoleMutation = useDeleteRoleMutation();

  const roles = rolesQuery.data ?? [];
  const permissions = permissionsQuery.data ?? [];
  const loading = rolesQuery.isLoading || permissionsQuery.isLoading;
  const errorMessage = rolesQuery.error?.message ?? permissionsQuery.error?.message ?? null;

  async function handleDeleteRole(id: string, name: string) {
    setPendingDeleteName(name);

    try {
      await deleteRoleMutation.mutateAsync(id);
      toast.success(`${name} deleted.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete role.");
    } finally {
      setPendingDeleteName(null);
    }
  }

  function openEditRole(role: RbacRole) {
    setSelectedRole(role);
    setEditOpen(true);
  }

  const columns: ColumnDef<RbacRole>[] = [
    {
      accessorKey: "name",
      header: "Role",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-foreground">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.description || "No description"}</div>
        </div>
      ),
    },
    {
      id: "permissionCount",
      header: "Permissions",
      cell: ({ row }) => row.original.permissionIds.length,
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
              openEditRole(row.original);
            }}
          >
            Edit role
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={deleteRoleMutation.isPending}
            onClick={() => {
              void handleDeleteRole(row.original.id, row.original.name);
            }}
          >
            {deleteRoleMutation.isPending && pendingDeleteName === row.original.name
              ? "Deleting..."
              : "Delete role"}
          </DropdownMenuItem>
        </RowActions>
      ),
    },
  ];

  const stats = [
    {
      label: "Total roles",
      value: String(roles.length),
      note: "Current RBAC roles from the backend",
    },
    {
      label: "Active roles",
      value: String(roles.filter((role) => role.isActive && !role.isDeleted).length),
      note: "Roles available for assignment",
    },
    {
      label: "Catalog permissions",
      value: String(permissions.length),
      note: "Permissions available to assign",
    },
    {
      label: "Average coverage",
      value: roles.length > 0 ? `${Math.round(roles.reduce((sum, role) => sum + role.permissionIds.length, 0) / roles.length)}` : "0",
      note: "Average permissions per role",
    },
  ];

  return (
    <ManagementPageShell
      eyebrow="RBAC workspace"
      title="Role management"
      description="Define access roles, review their permission footprint, and adjust permission assignments without touching the backend directly."
      actions={<PrimaryAction label="Add role" onClick={() => setCreateOpen(true)} />}
    >
      <StatsGrid items={stats} />
      <Panel
        title="Roles"
        description="Use the action menu to assign permissions or retire obsolete roles."
      >
        {errorMessage ? <InlineMessage tone="error" message={errorMessage} /> : null}
        {deleteRoleMutation.isPending && pendingDeleteName ? (
          <InlineMessage tone="info" message={`Deleting ${pendingDeleteName}...`} />
        ) : null}
        {loading ? (
          <InlineMessage tone="info" message="Loading roles and permission catalog..." />
        ) : (
          <DataTable
            title="Roles"
            columns={columns}
            data={roles}
            searchConfig={{ enabled: true, placeholder: "Search roles" }}
            exportConfig={{ enabled: true, options: ["csv", "excel"] }}
            paginationConfig={{ enabled: true, pageSizeOptions: [10, 20, 50] }}
          />
        )}
      </Panel>

      <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditRoleDialog
        open={editOpen}
        onOpenChange={(isOpen) => {
          setEditOpen(isOpen);
          if (!isOpen) {
            setSelectedRole(null);
          }
        }}
        role={selectedRole}
        permissions={permissions}
      />
    </ManagementPageShell>
  );
}