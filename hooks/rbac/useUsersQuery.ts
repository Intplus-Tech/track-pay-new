"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryJson } from "@/lib/query/fetcher";
import { rbacKeys } from "@/lib/query/keys/rbac";
import type { RbacPaginationResponse, RbacUser } from "@/types/rbac";

export interface UserDirectoryQuery {
  page: number;
  limit: number;
  name: string;
  email: string;
  roleId: string;
  branchId: string;
  isActive: "all" | "true" | "false";
  isDeleted: "all" | "true" | "false";
  order: "ASC" | "DESC";
}

export const DEFAULT_USER_DIRECTORY_QUERY: UserDirectoryQuery = {
  page: 1,
  limit: 100,
  name: "",
  email: "",
  roleId: "all",
  branchId: "all",
  isActive: "all",
  isDeleted: "all",
  order: "ASC",
};

function buildUsersQueryString(nextQuery: UserDirectoryQuery) {
  const params = new URLSearchParams({
    page: String(nextQuery.page),
    limit: String(nextQuery.limit),
  });

  if (nextQuery.order === "DESC") {
    params.set("order", nextQuery.order);
  }

  if (nextQuery.name.trim().length > 0) {
    params.set("name", nextQuery.name.trim());
  }

  if (nextQuery.email.trim().length > 0) {
    params.set("email", nextQuery.email.trim());
  }

  if (nextQuery.roleId !== "all") {
    params.set("roleId", nextQuery.roleId);
  }

  if (nextQuery.branchId !== "all") {
    params.set("branchId", nextQuery.branchId);
  }

  if (nextQuery.isActive !== "all") {
    params.set("isActive", nextQuery.isActive);
  }

  if (nextQuery.isDeleted !== "all") {
    params.set("isDeleted", nextQuery.isDeleted);
  }

  return params.toString();
}

export function useUsersQuery(query: UserDirectoryQuery) {
  const serializedQuery = buildUsersQueryString(query);

  return useQuery({
    queryKey: rbacKeys.users(query),
    queryFn: () =>
      queryJson<RbacPaginationResponse<RbacUser>>(
        `/api/users?${serializedQuery}`,
        "Unable to load users.",
      ),
    placeholderData: keepPreviousData,
  });
}