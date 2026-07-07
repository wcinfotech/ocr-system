import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ROLE_PERMISSION_FALLBACK,
  WILDCARD_PERMISSION,
  type Permission,
} from "@/permissions/permissions";

/**
 * Permission checks derived from the signed-in user. The backend is the source
 * of truth: prefer an explicit `user.permissions` array; fall back to the
 * role -> permission map only if permissions are not provided.
 */
export function usePermissions() {
  const { user } = useAuth();

  const permissionSet = useMemo(() => {
    if (!user) return new Set<string>();
    const explicit = user.permissions;
    const list =
      explicit && explicit.length > 0 ? explicit : ROLE_PERMISSION_FALLBACK[user.role] ?? [];
    return new Set<string>(list);
  }, [user]);

  const isSuperAdmin = permissionSet.has(WILDCARD_PERMISSION);

  const can = (permission?: Permission | null): boolean => {
    if (!permission) return true; // no permission required
    if (isSuperAdmin) return true;
    return permissionSet.has(permission);
  };

  const canAny = (permissions: Permission[]): boolean =>
    isSuperAdmin || permissions.some((p) => permissionSet.has(p));

  const canAll = (permissions: Permission[]): boolean =>
    isSuperAdmin || permissions.every((p) => permissionSet.has(p));

  return { can, canAny, canAll, isSuperAdmin, role: user?.role };
}
