import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/permissions/permissions";

interface PermissionGateProps {
  /** Single permission required. */
  permission?: Permission;
  /** Any of these permissions grants access. */
  anyOf?: Permission[];
  /** All of these permissions are required. */
  allOf?: Permission[];
  children: ReactNode;
  /** Rendered when access is denied (defaults to nothing). */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on the user's permissions.
 * Use to hide buttons, actions, sections and menu items — never hardcode roles.
 */
export function PermissionGate({
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can, canAny, canAll } = usePermissions();

  let allowed = true;
  if (permission) allowed = can(permission);
  if (allowed && anyOf) allowed = canAny(anyOf);
  if (allowed && allOf) allowed = canAll(allOf);

  return <>{allowed ? children : fallback}</>;
}
