"use client";

import { useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { RowActions, DropdownMenuItem } from "@/components/data-table/RowActions";
import type { RbacPermission, RbacRole } from "@/types/rbac";
import { useCreatePermissionMutation } from "@/hooks/rbac/useCreatePermissionMutation";
import { useDeletePermissionMutation } from "@/hooks/rbac/useDeletePermissionMutation";
import { usePermissionsQuery } from "@/hooks/rbac/usePermissionsQuery";
import { useRolesQuery } from "@/hooks/rbac/useRolesQuery";
import { useUpdatePermissionMutation } from "@/hooks/rbac/useUpdatePermissionMutation";
import {
  InlineMessage,
  ManagementPageShell,
  Panel,
  PrimaryAction,
  StatsGrid,
} from "./shared";

const createPermissionSchema = z.object({
  name: z.string().min(1, "Permission name is required"),
  description: z.string().optional(),
});

type CreatePermissionValues = z.infer<typeof createPermissionSchema>;

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
  const createPermissionMutation = useCreatePermissionMutation();
  const deletePermissionMutation = useDeletePermissionMutation();
  const updatePermissionMutation = useUpdatePermissionMutation();

  const loading = permissionsQuery.isLoading || rolesQuery.isLoading;
  const errorMessage = permissionsQuery.error?.message ?? rolesQuery.error?.message ?? null;

  const form = useForm<CreatePermissionValues>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const editForm = useForm<CreatePermissionValues>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

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
    editForm.reset({
      name: permission.name,
      description: permission.description ?? "",
    });
    setEditOpen(true);
  }

  async function handleCreatePermission(values: CreatePermissionValues) {
    try {
      await createPermissionMutation.mutateAsync(values);
      toast.success("Permission created.");
      form.reset({ name: "", description: "" });
      setCreateOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create permission.");
    }
  }

  async function handleUpdatePermission(values: CreatePermissionValues) {
    if (!selectedPermission) {
      return;
    }

    try {
      await updatePermissionMutation.mutateAsync({
        id: selectedPermission.id,
        payload: values,
      });
      toast.success("Permission updated.");
      setEditOpen(false);
      setSelectedPermission(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update permission.");
    }
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle>Create permission</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreatePermission)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission name</FormLabel>
                    <FormControl>
                      <Input placeholder="CREATE_USER" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this permission unlocks"
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
                <Button
                  type="submit"
                  disabled={createPermissionMutation.isPending}
                >
                  {createPermissionMutation.isPending ? "Creating..." : "Create permission"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setSelectedPermission(null);
          }
        }}
      >
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle>Edit permission</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdatePermission)} className="space-y-5">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission name</FormLabel>
                    <FormControl>
                      <Input placeholder="CREATE_USER" {...field} />
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
                        placeholder="Describe what this permission unlocks"
                        className="min-h-28"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditOpen(false);
                    setSelectedPermission(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePermissionMutation.isPending}>
                  {updatePermissionMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </ManagementPageShell>
  );
}