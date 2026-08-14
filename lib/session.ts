import { getBackendJson, readBackendBody } from "@/lib/backend";
import { AuthUser } from "@/lib/auth";

export interface DashboardRole {
  id: string;
  name: string;
  description?: string | null;
  permissionIds: string[];
}

export interface DashboardBranch {
  id: string;
  name: string;
  code?: string | null;
  location?: string | null;
  isHeadOffice?: boolean | null;
}

export interface DashboardUser extends AuthUser {
  roleId?: string | null;
  branchId?: string | null;
}

export interface DashboardSession {
  user: DashboardUser;
  role: DashboardRole | null;
  branch: DashboardBranch | null;
}

interface BackendUserProfile {
  _id?: string;
  id?: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  email?: string;
  roleId?: string | null;
  branchId?: string | null;
  twoFactorEnabled?: boolean;
}

interface BackendRole {
  _id?: string;
  id?: string;
  name?: string;
  description?: string | null;
  permissionIds?: string[];
}

interface BackendBranch {
  _id?: string;
  id?: string;
  name?: string;
  code?: string | null;
  location?: string | null;
  isHeadOffice?: boolean | null;
}

function getRecordId(record: { id?: string; _id?: string }) {
  return record.id ?? record._id ?? null;
}

async function readJsonOrNull<T>(response: Response) {
  const payload = (await readBackendBody<T | string | null>(response)) as
    | T
    | string
    | null;

  if (!response.ok) {
    return null;
  }

  if (typeof payload === "string" || payload === null) {
    return null;
  }

  return payload;
}

export async function resolveDashboardSession(
  accessToken: string,
  fallbackUser: DashboardUser | null,
): Promise<DashboardSession | null> {
  if (!fallbackUser) {
    return null;
  }

  try {
    const userResponse = await getBackendJson(`/api/v1/users/${fallbackUser.id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // If the backend rejects the token, signal that the session is invalid
    // so the caller can redirect to sign-in instead of rendering with stale data.
    if (userResponse.status === 401 || userResponse.status === 403) {
      return null;
    }

    const userProfile = await readJsonOrNull<BackendUserProfile>(userResponse);

    const derivedName = [userProfile?.firstName, userProfile?.middleName, userProfile?.lastName]
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .trim();

    const resolvedUser: DashboardUser = {
      ...fallbackUser,
      id: getRecordId(userProfile ?? fallbackUser) ?? fallbackUser.id,
      name: derivedName || fallbackUser.name,
      fullName: derivedName || fallbackUser.fullName || fallbackUser.name,
      email: userProfile?.email ?? fallbackUser.email,
      roleId: userProfile?.roleId ?? fallbackUser.roleId ?? null,
      branchId: userProfile?.branchId ?? fallbackUser.branchId ?? null,
      twoFactorEnabled:
        typeof userProfile?.twoFactorEnabled === "boolean"
          ? userProfile.twoFactorEnabled
          : fallbackUser.twoFactorEnabled,
    };

    const roleId = resolvedUser.roleId;
    const branchId = resolvedUser.branchId;

    const [rolesResponse, branchResponse] = await Promise.all([
      getBackendJson("/api/v1/users/roles", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
      branchId
        ? getBackendJson(`/api/v1/branches/${branchId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        : Promise.resolve(null),
    ]);

    const roles =
      (await readJsonOrNull<BackendRole[]>(rolesResponse))?.map((role) => ({
        id: getRecordId(role) ?? "",
        name: role.name ?? "",
        description: role.description ?? null,
        permissionIds: role.permissionIds ?? [],
      })) ?? [];

    const matchedRole =
      roleId && roles.length > 0
        ? roles.find((role) => role.id === roleId) ?? null
        : null;

    const branchProfile =
      branchResponse && branchResponse.ok
        ? await readJsonOrNull<BackendBranch>(branchResponse)
        : null;

    return {
      user: resolvedUser,
      role: matchedRole,
      branch: branchProfile
        ? {
          id: getRecordId(branchProfile) ?? branchId ?? "",
          name: branchProfile.name ?? "",
          code: branchProfile.code ?? null,
          location: branchProfile.location ?? null,
          isHeadOffice:
            typeof branchProfile.isHeadOffice === "boolean"
              ? branchProfile.isHeadOffice
              : null,
        }
        : null,
    };
  } catch {
    return {
      user: fallbackUser,
      role: null,
      branch: null,
    };
  }
}

