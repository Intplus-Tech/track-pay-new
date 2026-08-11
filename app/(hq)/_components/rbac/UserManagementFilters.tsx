import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserDirectoryQuery } from "@/hooks/rbac/useUsersQuery";
import type { RbacRole, RbacBranch } from "@/types/rbac";

interface UserManagementFiltersProps {
  pendingQuery: UserDirectoryQuery;
  setPendingQuery: React.Dispatch<React.SetStateAction<UserDirectoryQuery>>;
  roles: RbacRole[];
  branches: RbacBranch[];
  onApply: () => void;
  onReset: () => void;
}

export function UserManagementFilters({
  pendingQuery,
  setPendingQuery,
  roles,
  branches,
  onApply,
  onReset,
}: UserManagementFiltersProps) {
  return (
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
          <SelectTrigger className="w-full">
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
          <SelectTrigger className="w-full">
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
          <SelectTrigger className="w-full">
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
          <SelectTrigger className="w-full">
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
          <SelectTrigger className="w-full">
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
          <SelectTrigger className="w-full">
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
        <Button type="button" onClick={onApply}>
          Apply filters
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
