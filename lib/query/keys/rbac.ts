export const rbacKeys = {
  all: ["rbac"] as const,
  permissions: () => [...rbacKeys.all, "permissions"] as const,
  roles: () => [...rbacKeys.all, "roles"] as const,
  users: (params?: unknown) =>
    [...rbacKeys.all, "users", params ?? {}] as const,
  user: (id: string) => [...rbacKeys.all, "users", "detail", id] as const,
  branches: () => [...rbacKeys.all, "branches"] as const,
};