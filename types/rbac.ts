export interface BackendEntity {
  _id?: string;
  id?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface NormalizedEntity {
  id: string;
  _id?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

export interface RbacPermission extends NormalizedEntity {
  name: string;
  description?: string | null;
}

export interface RbacRole extends NormalizedEntity {
  name: string;
  description?: string | null;
  permissionIds: string[];
}

export interface RbacBranch extends NormalizedEntity {
  name: string;
  code?: string | null;
  location?: string | null;
  isHeadOffice?: boolean | null;
  managerId?: string | null;
  parentBranchId?: string | null;
}

export interface RbacUser extends NormalizedEntity {
  name: string;
  email: string;
  twoFactorEnabled?: boolean;
  roleId?: string | null;
  branchId?: string | null;
  modulePermissions?: RbacModulePermission[];
}

export type RbacModuleName =
  | "OVERVIEW"
  | "TRACKER"
  | "ACCOUNTS"
  | "LOAN_OFFICERS"
  | "TEAM"
  | "SETTINGS";

export interface RbacModulePermission {
  module: RbacModuleName;
  view: boolean;
  manage: boolean;
}

export interface RbacPaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  roleId?: string;
  branchId?: string;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
  branchId?: string;
  isActive?: boolean;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface CreatePermissionPayload {
  name: string;
  description?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface AssignRolePermissionsPayload {
  permissionIds: string[];
}