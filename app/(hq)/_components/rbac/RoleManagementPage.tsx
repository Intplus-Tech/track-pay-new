"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { RowActions, DropdownMenuItem } from "@/components/data-table/RowActions";
import type { RbacPermission, RbacRole } from "@/types/rbac";
import { useAssignRolePermissionsMutation } from "@/hooks/rbac/useAssignRolePermissionsMutation";
import { useCreateRoleMutation } from "@/hooks/rbac/useCreateRoleMutation";
import { useDeleteRoleMutation } from "@/hooks/rbac/useDeleteRoleMutation";
import { usePermissionsQuery } from "@/hooks/rbac/usePermissionsQuery";
import { useRolesQuery } from "@/hooks/rbac/useRolesQuery";
import { useUpdateRoleMutation } from "@/hooks/rbac/useUpdateRoleMutation";
import {
  InlineMessage,
  ManagementPageShell,
  Panel,
  PrimaryAction,
  StatsGrid,
} from "./shared";

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
});

type RoleValues = z.infer<typeof roleSchema>;

export default function RoleManagementPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RbacRole | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(null);

  const rolesQuery = useRolesQuery();
  const permissionsQuery = usePermissionsQuery();
  const createRoleMutation = useCreateRoleMutation();
  const deleteRoleMutation = useDeleteRoleMutation();
  const assignPermissionsMutation = useAssignRolePermissionsMutation();
  const updateRoleMutation = useUpdateRoleMutation();

  const roles = rolesQuery.data ?? [];
  const permissions = permissionsQuery.data ?? [];
  const loading = rolesQuery.isLoading || permissionsQuery.isLoading;
  const errorMessage = rolesQuery.error?.message ?? permissionsQuery.error?.message ?? null;

  const createForm = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const editForm = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

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

  async function handleCreateRole(values: RoleValues) {
    try {
      await createRoleMutation.mutateAsync(values);
      toast.success("Role created.");
      createForm.reset({ name: "", description: "" });
      setCreateOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create role.");
    }
  }

  function openEditRole(role: RbacRole) {
    setSelectedRole(role);
    setSelectedPermissionIds(role.permissionIds);
    editForm.reset({
      name: role.name,
      description: role.description ?? "",
    });
    setEditOpen(true);
  }

  async function handleEditRole(values: RoleValues) {
    if (!selectedRole) {
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({
        id: selectedRole.id,
        payload: values,
      });

      await assignPermissionsMutation.mutateAsync({
        roleId: selectedRole.id,
        permissionIds: selectedPermissionIds,
      });

      toast.success("Role updated.");
      setEditOpen(false);
      setSelectedRole(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update role.");
    }
  }

  const columns: ColumnDef<RbacRole>[] = [
    {
      accessorKey: "name",
      header: "Role",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-slate-900">{row.original.name}</div>
          <div className="text-xs text-slate-500">{row.original.description || "No description"}</div>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle>Create role</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateRole)} className="space-y-5">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role name</FormLabel>
                    <FormControl>
                      <Input placeholder="Operations Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this role is allowed to do"
                        className="min-h-28"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRoleMutation.isPending}>
                  {createRoleMutation.isPending ? "Creating..." : "Create role"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditOpen(false);
            setSelectedRole(null);
          }
        }}
      >
        <DialogContent className="w-[min(100vw-2rem,56rem)] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? `Edit role ${selectedRole.name}` : "Edit role"}
            </DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditRole)} className="flex max-h-[calc(90vh-7rem)] flex-col gap-5 overflow-hidden">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role name</FormLabel>
                      <FormControl>
                        <Input placeholder="Operations Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this role is allowed to do"
                          className="min-h-28"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-900">Permissions</h3>
                  <p className="text-sm text-slate-500">
                    Select the permissions that should be attached to this role.
                  </p>
                </div>
                <div className="grid max-h-[48vh] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                  {permissions.map((permission) => {
                    const checked = selectedPermissionIds.includes(permission.id);
                    return (
                      <label
                        key={permission.id}
                        className="flex w-full min-w-0 cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(nextChecked) => {
                            setSelectedPermissionIds((current) => {
                              if (nextChecked) {
                                return current.includes(permission.id)
                                  ? current
                                  : [...current, permission.id];
                              }

                              return current.filter((value) => value !== permission.id);
                            });
                          }}
                        />
                        <div className="min-w-0 space-y-1">
                          <div className="break-words text-sm font-medium leading-snug text-slate-900">
                            {permission.name}
                          </div>
                          <div className="break-words text-sm leading-snug text-slate-500">
                            {permission.description || "No description"}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditOpen(false);
                    setSelectedRole(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateRoleMutation.isPending || assignPermissionsMutation.isPending}>
                  {updateRoleMutation.isPending || assignPermissionsMutation.isPending ? "Saving..." : "Save role"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </ManagementPageShell>
  );
}