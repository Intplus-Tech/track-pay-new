"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAssignRolePermissionsMutation } from "@/hooks/rbac/useAssignRolePermissionsMutation";
import { useUpdateRoleMutation } from "@/hooks/rbac/useUpdateRoleMutation";
import type { RbacRole, RbacPermission } from "@/types/rbac";
import { roleSchema, type RoleValues } from "./CreateRoleDialog";

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RbacRole | null;
  permissions: RbacPermission[];
}

export function EditRoleDialog({ open, onOpenChange, role, permissions }: EditRoleDialogProps) {
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

  const updateRoleMutation = useUpdateRoleMutation();
  const assignPermissionsMutation = useAssignRolePermissionsMutation();

  const editForm = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (role) {
      setSelectedPermissionIds(role.permissionIds);
      editForm.reset({
        name: role.name,
        description: role.description ?? "",
      });
    } else {
      setSelectedPermissionIds([]);
    }
  }, [role, editForm]);

  async function handleEditRole(values: RoleValues) {
    if (!role) {
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({
        id: role.id,
        payload: values,
      });

      await assignPermissionsMutation.mutateAsync({
        roleId: role.id,
        permissionIds: selectedPermissionIds,
      });

      toast.success("Role updated.");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update role.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(100vw-2rem,56rem)] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {role ? `Edit role ${role.name}` : "Edit role"}
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
                <h3 className="text-sm font-semibold text-foreground">Permissions</h3>
                <p className="text-sm text-muted-foreground">
                  Select the permissions that should be attached to this role.
                </p>
              </div>
              <div className="grid max-h-[48vh] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                {permissions.map((permission) => {
                  const checked = selectedPermissionIds.includes(permission.id);
                  return (
                    <label
                      key={permission.id}
                      className="flex w-full min-w-0 cursor-pointer items-start gap-3 rounded-2xl border border-border p-4"
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
                        <div className="break-words text-sm font-medium leading-snug text-foreground">
                          {permission.name}
                        </div>
                        <div className="break-words text-sm leading-snug text-muted-foreground">
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
                onClick={() => onOpenChange(false)}
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
  );
}
