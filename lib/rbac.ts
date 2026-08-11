import {
  type AssignRolePermissionsPayload,
  type BackendEntity,
  type CreatePermissionPayload,
  type CreateRolePayload,
  type CreateUserPayload,
  type RbacBranch,
  type RbacModuleName,
  type RbacModulePermission,
  type RbacPaginationResponse,
  type RbacPermission,
  type RbacRole,
  type RbacUser,
} from "@/types/rbac";

export const RBAC_MODULE_OPTIONS: Array<{
  module: RbacModuleName;
  label: string;
  description: string;
}> = [
  { module: "OVERVIEW", label: "Overview", description: "Access dashboard summaries and KPIs" },
  { module: "TRACKER", label: "Tracker", description: "View and manage repayment tracking" },
  { module: "ACCOUNTS", label: "Accounts", description: "View and manage accounts" },
  { module: "LOAN_OFFICERS", label: "Loan Officers", description: "Access loan officer workflows" },
  { module: "TEAM", label: "Team", description: "View and manage team users" },
  { module: "SETTINGS", label: "Settings", description: "Access system settings" },
] as const;

function isRbacModuleName(value: unknown): value is RbacModuleName {
  return RBAC_MODULE_OPTIONS.some((option) => option.module === value);
}

function normalizeModulePermission(value: unknown): RbacModulePermission | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (!isRbacModuleName(record.module)) {
    return null;
  }

  return {
    module: record.module,
    view: typeof record.view === "boolean" ? record.view : false,
    manage: typeof record.manage === "boolean" ? record.manage : false,
  };
}

function getRecordId(record: BackendEntity) {
  return record.id ?? record._id ?? "";
}

function normalizeBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function normalizeNullableNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function normalizeOptionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return undefined;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function normalizeEntity(record: BackendEntity) {
  return {
    id: getRecordId(record),
    _id: record._id,
    isActive: normalizeBoolean(record.isActive, true),
    isDeleted: normalizeBoolean(record.isDeleted, false),
    createdAt: normalizeNullableString(record.createdAt),
    updatedAt: normalizeNullableString(record.updatedAt),
    deletedAt: normalizeNullableString(record.deletedAt),
  };
}

export function normalizeUser(record: Record<string, unknown>): RbacUser {
  const roleRecord =
    record.role && typeof record.role === "object"
      ? (record.role as Record<string, unknown>)
      : null;
  const branchRecord =
    record.branch && typeof record.branch === "object"
      ? (record.branch as Record<string, unknown>)
      : null;

  return {
    ...normalizeEntity(record as BackendEntity),
    name: normalizeString(record.name),
    email: normalizeString(record.email),
    firstName: normalizeNullableString(record.firstName),
    middleName: normalizeNullableString(record.middleName),
    lastName: normalizeNullableString(record.lastName),
    employeeId: normalizeNullableString(record.employeeId),
    phoneNumber: normalizeNullableString(record.phoneNumber),
    availabilityStatus: normalizeNullableString(record.availabilityStatus),
    maxAssignedLoans: normalizeNullableNumber(record.maxAssignedLoans),
    monthlyCollectionTarget: normalizeNullableString(record.monthlyCollectionTarget),
    twoFactorEnabled: normalizeBoolean(record.twoFactorEnabled),
    roleId: normalizeNullableString(record.roleId),
    branchId: normalizeNullableString(record.branchId),
    role: roleRecord
      ? {
        id: getRecordId(roleRecord as BackendEntity),
        name: normalizeString(roleRecord.name),
      }
      : null,
    branch: branchRecord
      ? {
        id: getRecordId(branchRecord as BackendEntity),
        name: normalizeString(branchRecord.name),
      }
      : null,
    modulePermissions: Array.isArray(record.modulePermissions)
      ? record.modulePermissions
        .map(normalizeModulePermission)
        .filter((value): value is RbacModulePermission => value !== null)
      : [],
  };
}

export function normalizeRole(record: Record<string, unknown>): RbacRole {
  return {
    ...normalizeEntity(record as BackendEntity),
    name: normalizeString(record.name),
    description: normalizeNullableString(record.description),
    permissionIds: Array.isArray(record.permissionIds)
      ? record.permissionIds.filter((value): value is string => typeof value === "string")
      : [],
  };
}

export function normalizePermission(
  record: Record<string, unknown>,
): RbacPermission {
  return {
    ...normalizeEntity(record as BackendEntity),
    name: normalizeString(record.name),
    description: normalizeNullableString(record.description),
  };
}

export function normalizeBranch(record: Record<string, unknown>): RbacBranch {
  return {
    ...normalizeEntity(record as BackendEntity),
    name: normalizeString(record.name),
    code: normalizeNullableString(record.code),
    location: normalizeNullableString(record.location),
    isHeadOffice:
      typeof record.isHeadOffice === "boolean" ? record.isHeadOffice : null,
    managerId: normalizeNullableString(record.managerId),
    parentBranchId: normalizeNullableString(record.parentBranchId),
  };
}

export function normalizePaginatedUsers(
  payload: unknown,
): RbacPaginationResponse<RbacUser> {
  const fallback = {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
  };

  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const response = payload as Record<string, unknown>;
  const data = Array.isArray(response.data)
    ? response.data
      .filter((value): value is Record<string, unknown> =>
        typeof value === "object" && value !== null,
      )
      .map(normalizeUser)
    : [];

  return {
    data,
    total: typeof response.total === "number" ? response.total : data.length,
    page: typeof response.page === "number" ? response.page : 1,
    limit: typeof response.limit === "number" ? response.limit : Math.max(data.length, 1),
  };
}

export function buildUsersQuery(params: URLSearchParams) {
  const query = new URLSearchParams();

  for (const [key, value] of params.entries()) {
    if (value.trim().length > 0) {
      query.set(key, value);
    }
  }

  return query.toString() ? `?${query.toString()}` : "";
}

export function sanitizeCreateUserPayload(
  payload: Record<string, unknown>,
): CreateUserPayload {
  return {
    name: normalizeString(payload.name),
    email: normalizeString(payload.email),
    password: normalizeString(payload.password),
    firstName: normalizeOptionalString(payload.firstName),
    middleName: normalizeOptionalString(payload.middleName),
    lastName: normalizeOptionalString(payload.lastName),
    employeeId: normalizeOptionalString(payload.employeeId),
    phoneNumber: normalizeOptionalString(payload.phoneNumber),
    roleId: normalizeOptionalString(payload.roleId),
    roleName: normalizeOptionalString(payload.roleName),
    branchId: normalizeOptionalString(payload.branchId),
    modulePermissions: Array.isArray(payload.modulePermissions)
      ? payload.modulePermissions
        .map(normalizeModulePermission)
        .filter((value): value is RbacModulePermission => value !== null)
      : undefined,
    maxAssignedLoans: normalizeOptionalNumber(payload.maxAssignedLoans),
    monthlyCollectionTarget: normalizeOptionalString(payload.monthlyCollectionTarget),
    photoUploadId: normalizeOptionalString(payload.photoUploadId),
    isActive: typeof payload.isActive === "boolean" ? payload.isActive : true,
    isDeleted: typeof payload.isDeleted === "boolean" ? payload.isDeleted : false,
  };
}

export function sanitizeCreateRolePayload(
  payload: Record<string, unknown>,
): CreateRolePayload {
  return {
    name: normalizeString(payload.name),
    description: normalizeString(payload.description).trim() || undefined,
    isActive: typeof payload.isActive === "boolean" ? payload.isActive : true,
    isDeleted: typeof payload.isDeleted === "boolean" ? payload.isDeleted : false,
  };
}

export function sanitizeCreatePermissionPayload(
  payload: Record<string, unknown>,
): CreatePermissionPayload {
  return {
    name: normalizeString(payload.name),
    description: normalizeString(payload.description).trim() || undefined,
    isActive: typeof payload.isActive === "boolean" ? payload.isActive : true,
    isDeleted: typeof payload.isDeleted === "boolean" ? payload.isDeleted : false,
  };
}

export function sanitizeAssignPermissionsPayload(
  payload: Record<string, unknown>,
): AssignRolePermissionsPayload {
  return {
    permissionIds: Array.isArray(payload.permissionIds)
      ? payload.permissionIds.filter((value): value is string => typeof value === "string")
      : [],
  };
}