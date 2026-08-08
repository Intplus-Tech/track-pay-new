/**
 * Shared type-guard utilities used across auth and RBAC modules.
 */

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
