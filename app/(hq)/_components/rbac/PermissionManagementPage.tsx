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

const createPermissionSchema = z.object({
  name: z.string().min(1, "Permission name is required"),
  description: z.string().optional(),
});

type CreatePermissionValues = z.infer<typeof createPermissionSchema>;

interface PermissionRow extends RbacPermission {
  roleUsageCount: number;
}

export default function PermissionManagementPage() {
  const [permissions, setPermissions] = useState<RbacPermission[]>([]);
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const form = useForm<CreatePermissionValues>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function loadData() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [permissionsResponse, rolesResponse] = await Promise.all([
        fetchJson<RbacPermission[]>("/api/permissions", "Unable to load permissions."),
        fetchJson<RbacRole[]>("/api/roles", "Unable to load roles."),
      ]);

      setPermissions(permissionsResponse);
      setRoles(rolesResponse);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load permission management data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const permissionRows = useMemo<PermissionRow[]>(() => {
    return permissions.map((permission) => ({
      ...permission,
      roleUsageCount: roles.filter((role) => role.permissionIds.includes(permission.id)).length,
    }));
  }, [permissions, roles]);

  async function handleDeletePermission(id: string, name: string) {
    try {
      await mutateJson<null>(`/api/permissions/${id}`, "DELETE", "Unable to delete permission.");
      toast.success(`${name} deleted.`);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete permission.");
    }
  }

  async function handleCreatePermission(values: CreatePermissionValues) {
    setSubmitting(true);

    try {
      await mutateJson("/api/permissions", "POST", "Unable to create permission.", values);
      toast.success("Permission created.");
      form.reset({ name: "", description: "" });
      setCreateOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create permission.");
    } finally {
      setSubmitting(false);
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
              void handleDeletePermission(row.original.id, row.original.name);
            }}
          >
            Delete permission
          </DropdownMenuItem>
        </RowActions>
      ),
    },
  ];

  const stats = [
    {
      label: "Total permissions",
      value: String(permissions.length),
      note: "Current permission catalog",
    },
    {
      label: "Active permissions",
      value: String(permissions.filter((permission) => permission.isActive && !permission.isDeleted).length),
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
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create permission"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </ManagementPageShell>
  );
}