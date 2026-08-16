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

export type RbacBranchStatus =
  | "ACTIVE"
  | "PENDING_ACTIVATION"
  | "SUSPENDED"
  | "CLOSED";

export type RbacBranchType = "PHYSICAL" | "VIRTUAL";

export interface RbacBranchManager {
  id: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  email?: string | null;
}

export interface RbacBranchConfiguration {
  id?: string | null;
  branchId?: string | null;
  name?: string | null;
  location?: string | null;
  regionalZone?: string | null;
  type?: RbacBranchType | null;
  managerId?: string | null;
  managerName?: string | null;
  activeOfficers?: number | null;
  activeLoans?: number | null;
  totalExposure?: string | number | null;
  collectionRate?: number | null;
  status?: RbacBranchStatus | null;
  statusLabel?: string | null;
}

export interface RbacBranch extends NormalizedEntity {
  name: string;
  code?: string | null;
  location?: string | null;
  addressLabel?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  regionalZone?: string | null;
  type?: RbacBranchType | null;
  isHeadOffice?: boolean | null;
  managerId?: string | null;
  manager?: RbacBranchManager | null;
  managerName?: string | null;
  activeOfficers?: number | null;
  activeLoans?: number | null;
  totalExposure?: string | number | null;
  collectionRate?: number | null;
  statusLabel?: string | null;
  parentBranchId?: string | null;
  status?: RbacBranchStatus | null;
}

export interface RbacUserRoleSummary {
  id: string;
  name: string;
}

export interface RbacUserBranchSummary {
  id: string;
  name: string;
}

export interface RbacUser extends NormalizedEntity {
  name: string;
  fullName?: string | null;
  email: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  employeeId?: string | null;
  phoneNumber?: string | null;
  availabilityStatus?: string | null;
  maxAssignedLoans?: number | null;
  monthlyCollectionTarget?: string | null;
  twoFactorEnabled?: boolean;
  roleId?: string | null;
  branchId?: string | null;
  role?: RbacUserRoleSummary | null;
  branch?: RbacUserBranchSummary | null;
  modulePermissions?: RbacModulePermission[];
  photoUploadId?: string | null;
  photoUrl?: string | null;
}

export interface RbacUserDetailPermission {
  _id?: string;
  id?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  name: string;
  description?: string | null;
}

export interface RbacUserDetailRole {
  _id?: string;
  id?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  name: string;
  description?: string | null;
  permissionIds: string[];
  permissions?: RbacUserDetailPermission[];
}

export interface RbacUserDetailBranch {
  _id?: string;
  id?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  name: string;
  code?: string | null;
  location?: string | null;
  isHeadOffice?: boolean | null;
  managerId?: string | null;
  parentBranchId?: string | null;
  status?: string | null;
}

export interface RbacUserDetail {
  _id?: string;
  id?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  name: string;
  fullName?: string | null;
  email: string;
  twoFactorEnabled?: boolean;
  roleId?: string | null;
  branchId?: string | null;
  role?: RbacUserDetailRole | null;
  branch?: RbacUserDetailBranch | null;
  portfolioAssignments?: unknown[] | null;
  availabilityStatus?: string | null;
  employeeId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  maxAssignedLoans?: number | null;
  modulePermissions?: RbacModulePermission[];
  monthlyCollectionTarget?: string | null;
  phoneNumber?: string | null;
  photoUploadId?: string | null;
  photoUrl?: string | null;
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
  email: string;
  password: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  employeeId?: string;
  phoneNumber?: string;
  roleId?: string;
  roleName?: string;
  branchId?: string;
  modulePermissions?: RbacModulePermission[];
  maxAssignedLoans?: number;
  monthlyCollectionTarget?: string;
  photoUploadId?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface UpdateUserPayload {
  email?: string;
  password?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  employeeId?: string;
  phoneNumber?: string;
  roleId?: string;
  branchId?: string;
  photoUploadId?: string;
  photoUrl?: string;
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

export interface CreateBranchPayload {
  name: string;
  code?: string;
  location?: string;
  addressLabel?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  regionalZone?: string;
  type?: RbacBranchType;
  status?: RbacBranchStatus;
  parentBranchId?: string;
  isHeadOffice?: boolean;
  managerId?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export type UpdateBranchPayload = Partial<CreateBranchPayload>;

export interface AssignRolePermissionsPayload {
  permissionIds: string[];
}