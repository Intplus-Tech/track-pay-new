import type { NextResponse } from "next/server";
import { isObject } from "@/lib/type-guards";

export const AUTH_ACCESS_TOKEN_COOKIE = "trackpay_access_token";
export const AUTH_USER_COOKIE = "trackpay_user";
export const AUTH_PENDING_COOKIE = "trackpay_pending_auth";
export const AUTH_PASSWORD_RESET_COOKIE = "trackpay_password_reset";

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;
const TEN_MINUTES_IN_SECONDS = 60 * 10;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  fullName?: string | null;
  twoFactorEnabled: boolean;
  roleId?: string | null;
  branchId?: string | null;
}

export interface LoginSuccessResponse {
  accessToken: string;
  user: AuthUser;
}

export interface LoginChallengeResponse {
  twoFactorRequired: true;
  authUserId: string;
  message: string;
}

export interface PendingAuthSession {
  authUserId: string;
  email: string;
}

export interface PendingPasswordResetSession {
  authUserId: string;
  token: string;
}

export type LoginResponse = LoginSuccessResponse | LoginChallengeResponse;

type AuthTokenClaims = {
  id?: string;
  _id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  twoFactorEnabled?: boolean;
  roleId?: string;
  branchId?: string;
  exp?: number;
};

function getString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function getBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function decodeJwtClaims(token: string): AuthTokenClaims | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = Buffer.from(padded, "base64").toString("utf-8");
    const claims = JSON.parse(json) as Record<string, unknown>;

    return {
      id: getString(claims.id) ?? undefined,
      _id: getString(claims._id) ?? undefined,
      email: getString(claims.email) ?? undefined,
      name: getString(claims.name) ?? undefined,
      fullName: getString(claims.fullName) ?? undefined,
      twoFactorEnabled: getBoolean(claims.twoFactorEnabled) ?? undefined,
      roleId: getString(claims.roleId) ?? undefined,
      branchId: getString(claims.branchId) ?? undefined,
      exp: getNumber(claims.exp) ?? undefined,
    };
  } catch {
    return null;
  }
}

export function getJwtRemainingSeconds(token: string): number | undefined {
  const claims = decodeJwtClaims(token);
  if (!claims?.exp) {
    return undefined;
  }

  const remaining = claims.exp - Math.floor(Date.now() / 1000);
  return remaining > 0 ? remaining : 0;
}

export function normalizeLoginSuccessPayload(
  payload: unknown,
  fallbackEmail?: string,
): LoginSuccessResponse | null {
  if (!isObject(payload)) {
    return null;
  }

  const accessToken =
    getString(payload.accessToken) ?? getString(payload.access_token);

  if (!accessToken) {
    return null;
  }

  const rawUser = isObject(payload.user) ? payload.user : null;
  const claims = decodeJwtClaims(accessToken);

  const id =
    (rawUser && (getString(rawUser.id) ?? getString(rawUser._id))) ??
    claims?.id ??
    claims?._id;

  const email =
    (rawUser && getString(rawUser.email)) ??
    claims?.email ??
    fallbackEmail ??
    null;

  if (!id || !email) {
    return null;
  }

  const firstName = rawUser && getString(rawUser.firstName);
  const middleName = rawUser && getString(rawUser.middleName);
  const lastName = rawUser && getString(rawUser.lastName);

  const derivedName = [firstName, middleName, lastName]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .trim();

  const name =
    derivedName ||
    email.split("@")[0] ||
    "TrackPay User";

  const twoFactorEnabled =
    (rawUser && getBoolean(rawUser.twoFactorEnabled)) ??
    claims?.twoFactorEnabled ??
    false;

  const roleId =
    (rawUser && (getString(rawUser.roleId) ?? getString(rawUser.role_id))) ??
    claims?.roleId ??
    null;

  const branchId =
    (rawUser && (getString(rawUser.branchId) ?? getString(rawUser.branch_id))) ??
    claims?.branchId ??
    null;

  return {
    accessToken,
    user: {
      id,
      email,
      name,
      fullName: name,
      twoFactorEnabled,
      roleId,
      branchId,
    },
  };
}

export function sanitizeAuthPayloadForLogs(payload: unknown) {
  if (!isObject(payload)) {
    return payload;
  }

  const safePayload = { ...payload };

  if ("accessToken" in safePayload) {
    delete safePayload.accessToken;
  }

  if ("access_token" in safePayload) {
    delete safePayload.access_token;
  }

  return safePayload;
}

function authCookieOptions(rememberMe: boolean, tokenMaxAge?: number) {
  // If we know the token's remaining lifetime, use it as the cookie maxAge
  // so the cookie self-destructs when the JWT expires.
  // Fall back to rememberMe behaviour (30 days or session cookie) if unknown.
  const maxAge = tokenMaxAge ?? (rememberMe ? THIRTY_DAYS_IN_SECONDS : undefined);

  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

function shortLivedCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TEN_MINUTES_IN_SECONDS,
  };
}

export function encodeSessionValue(value: unknown) {
  return encodeURIComponent(JSON.stringify(value));
}

export function decodeSessionValue<T>(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as T;
  } catch {
    return null;
  }
}

export function setAuthenticatedSession(
  response: NextResponse,
  session: LoginSuccessResponse,
  rememberMe = false,
) {
  const tokenMaxAge = getJwtRemainingSeconds(session.accessToken);

  response.cookies.set(
    AUTH_ACCESS_TOKEN_COOKIE,
    session.accessToken,
    authCookieOptions(rememberMe, tokenMaxAge),
  );
  response.cookies.set(
    AUTH_USER_COOKIE,
    encodeSessionValue(session.user),
    authCookieOptions(rememberMe, tokenMaxAge),
  );
  response.cookies.delete(AUTH_PENDING_COOKIE);
}

export function setPendingAuthSession(
  response: NextResponse,
  pending: PendingAuthSession,
) {
  response.cookies.set(
    AUTH_PENDING_COOKIE,
    encodeSessionValue(pending),
    shortLivedCookieOptions(),
  );
  response.cookies.delete(AUTH_ACCESS_TOKEN_COOKIE);
  response.cookies.delete(AUTH_USER_COOKIE);
}

export function clearAuthSession(response: NextResponse) {
  response.cookies.delete(AUTH_ACCESS_TOKEN_COOKIE);
  response.cookies.delete(AUTH_USER_COOKIE);
  response.cookies.delete(AUTH_PENDING_COOKIE);
}
