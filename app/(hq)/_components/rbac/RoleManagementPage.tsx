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
import { fetchJson, mutateJson } from "@/lib/rbac-client";
import type { RbacPermission, RbacRole } from "@/types/rbac";
import {
  InlineMessage,
  ManagementPageShell,
  Panel,
  PrimaryAction,
  StatsGrid,
} from "./shared";

const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
});

type CreateRoleValues = z.infer<typeof createRoleSchema>;

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignRole, setAssignRole] = useState<RbacRole | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  const form = useForm<CreateRoleValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function loadData() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        fetchJson<RbacRole[]>("/api/roles", "Unable to load roles."),
        fetchJson<RbacPermission[]>("/api/permissions", "Unable to load permissions."),
      ]);

      setRoles(rolesResponse);
      setPermissions(permissionsResponse);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load role management data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleDeleteRole(id: string, name: string) {
    try {
      await mutateJson<null>(`/api/roles/${id}`, "DELETE", "Unable to delete role.");
      toast.success(`${name} deleted.`);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete role.");
    }
  }

  async function handleCreateRole(values: CreateRoleValues) {
    setSubmitting(true);

    try {
      await mutateJson("/api/roles", "POST", "Unable to create role.", values);
      toast.success("Role created.");
      form.reset({ name: "", description: "" });
      setCreateOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create role.");
    } finally {
      setSubmitting(false);
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
              setAssignRole(row.original);
              setSelectedPermissionIds(row.original.permissionIds);
            }}
          >
            Assign permissions
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              void handleDeleteRole(row.original.id, row.original.name);
            }}
          >
            Delete role
          </DropdownMenuItem>
        </RowActions>
      ),
    },
  ];

  async function handleAssignPermissions() {
    if (!assignRole) {
      return;
    }

    setAssigning(true);

    try {
      await mutateJson(
        `/api/roles/${assignRole.id}/permissions`,
        "POST",
        "Unable to assign permissions.",
        { permissionIds: selectedPermissionIds },
      );
      toast.success(`Permissions updated for ${assignRole.name}.`);
      setAssignRole(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to assign permissions.");
    } finally {
      setAssigning(false);
    }
  }

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateRole)} className="space-y-5">
              <FormField
                control={form.control}
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
                control={form.control}
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
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create role"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(assignRole)}
        onOpenChange={(open) => {
          if (!open) {
            setAssignRole(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>
              {assignRole ? `Assign permissions to ${assignRole.name}` : "Assign permissions"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            {permissions.map((permission) => {
              const checked = selectedPermissionIds.includes(permission.id);
              return (
                <label
                  key={permission.id}
                  className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4"
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
                  <div className="space-y-1">
                    <div className="font-medium text-slate-900">{permission.name}</div>
                    <div className="text-sm text-slate-500">
                      {permission.description || "No description"}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setAssignRole(null)}>
              Cancel
            </Button>
            <Button type="button" disabled={assigning} onClick={() => void handleAssignPermissions()}>
              {assigning ? "Saving..." : "Save permissions"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ManagementPageShell>
  );
}