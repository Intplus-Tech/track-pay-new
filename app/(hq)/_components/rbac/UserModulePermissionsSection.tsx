"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RBAC_MODULE_OPTIONS } from "@/lib/rbac";
import { useUpdateUserPermissionsMutation } from "@/hooks/rbac/useUpdateUserPermissionsMutation";
import type { RbacUserDetail, RbacModuleName, RbacModulePermission } from "@/types/rbac";
import { Panel } from "./shared";
type PermissionGrid = Record<RbacModuleName, { view: boolean; manage: boolean }>;
function createEmptyPermissionGrid(): PermissionGrid {
  return RBAC_MODULE_OPTIONS.reduce((grid, option) => {
    grid[option.module] = { view: false, manage: false };
    return grid;
  }, {} as PermissionGrid);
}
function createPermissionGrid(modulePermissions?: RbacModulePermission[]): PermissionGrid {
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
function modulePermissionSummary(permissionGrid: PermissionGrid) {
  return RBAC_MODULE_OPTIONS.map((option) => ({
    option,
    current: permissionGrid[option.module],
  }));
}
interface UserModulePermissionsSectionProps {
  user: RbacUserDetail;
}
export function UserModulePermissionsSection({ user }: UserModulePermissionsSectionProps) {
  const [permissionGrid, setPermissionGrid] = useState<PermissionGrid>(() => createEmptyPermissionGrid());
  const updateUserPermissionsMutation = useUpdateUserPermissionsMutation();
  useEffect(() => {
    setPermissionGrid(createPermissionGrid(user.modulePermissions));
  }, [user]);
  async function onSavePermissions() {
    try {
      await updateUserPermissionsMutation.mutateAsync({
        id: user.id!,
        modulePermissions: serializePermissionGrid(permissionGrid),
      });
      toast.success("Permissions updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update permissions.");
    }
  }
  return (
    <Panel title="Module permissions" description="These are direct per-user overrides. Use them only when this user needs access that differs from the permissions inherited from their assigned role.">
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {modulePermissionSummary(permissionGrid).map(({ option, current }) => (
            <div key={option.module} className="rounded-2xl border border-border bg-card p-4">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{option.label}</p>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex min-w-[8.5rem] items-center gap-2 rounded-xl border border-border px-3 py-2">
                  <Switch
                    checked={current.view}
                    onCheckedChange={(checked) =>
                      setPermissionGrid((currentGrid) => ({
                        ...currentGrid,
                        [option.module]: {
                          view: checked,
                          manage: checked ? currentGrid[option.module].manage : false,
                        },
                      }))
                    }
                  />
                  <span className="whitespace-nowrap text-sm font-medium text-foreground">View</span>
                </label>
                <label className="flex min-w-[8.5rem] items-center gap-2 rounded-xl border border-border px-3 py-2">
                  <Switch
                    checked={current.manage}
                    onCheckedChange={(checked) =>
                      setPermissionGrid((currentGrid) => ({
                        ...currentGrid,
                        [option.module]: {
                          view: checked ? true : currentGrid[option.module].view,
                          manage: checked,
                        },
                      }))
                    }
                  />
                  <span className="whitespace-nowrap text-sm font-medium text-foreground">Manage</span>
                </label>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={() => void onSavePermissions()} disabled={updateUserPermissionsMutation.isPending}>
            {updateUserPermissionsMutation.isPending ? "Saving permissions..." : "Save permissions"}
          </Button>
        </div>
      </div>
    </Panel>
  );
}
