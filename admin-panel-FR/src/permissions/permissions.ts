/**
 * RBAC definitions. Roles and permissions are DATA, never hardcoded into
 * component logic. Components/routes/buttons check permission strings via the
 * usePermissions hook or <PermissionGate>. The actual permission set for a
 * signed-in user comes from the backend (user.permissions / user.role).
 */

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SUPPORT: "SUPPORT",
  ACCOUNTANT: "ACCOUNTANT",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Canonical permission strings — extend as the backend defines more. */
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: "dashboard:view",
  // Users
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_EDIT: "users:edit",
  USERS_DELETE: "users:delete",
  USERS_SUSPEND: "users:suspend",
  // Subscriptions
  SUBSCRIPTIONS_VIEW: "subscriptions:view",
  SUBSCRIPTIONS_MANAGE: "subscriptions:manage",
  // Plans
  PLANS_VIEW: "plans:view",
  PLANS_MANAGE: "plans:manage",
  // Bills
  BILLS_VIEW: "bills:view",
  BILLS_MANAGE: "bills:manage",
  // Payments
  PAYMENTS_VIEW: "payments:view",
  PAYMENTS_MANAGE: "payments:manage",
  // Support
  SUPPORT_VIEW: "support:view",
  SUPPORT_MANAGE: "support:manage",
  // Notifications
  NOTIFICATIONS_VIEW: "notifications:view",
  NOTIFICATIONS_SEND: "notifications:send",
  // Analytics
  ANALYTICS_VIEW: "analytics:view",
  // RBAC
  ROLES_VIEW: "roles:view",
  ROLES_MANAGE: "roles:manage",
  PERMISSIONS_VIEW: "permissions:view",
  PERMISSIONS_MANAGE: "permissions:manage",
  ADMINS_VIEW: "admins:view",
  ADMINS_MANAGE: "admins:manage",
  // Logs
  ACTIVITY_LOGS_VIEW: "activity_logs:view",
  AUDIT_LOGS_VIEW: "audit_logs:view",
  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Wildcard — SUPER_ADMIN typically receives this from the backend. */
export const WILDCARD_PERMISSION = "*";

/**
 * Fallback role -> permission map used ONLY when the backend does not return an
 * explicit permission list on the user object. The backend remains the source
 * of truth; this keeps the UI functional if only a role is provided.
 * TODO(backend): prefer returning an explicit `permissions` array per user.
 */
export const ROLE_PERMISSION_FALLBACK: Record<Role, Permission[] | ["*"]> = {
  SUPER_ADMIN: [WILDCARD_PERMISSION] as ["*"],
  ADMIN: Object.values(PERMISSIONS),
  MANAGER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.SUBSCRIPTIONS_VIEW,
    PERMISSIONS.SUBSCRIPTIONS_MANAGE,
    PERMISSIONS.PLANS_VIEW,
    PERMISSIONS.BILLS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SUPPORT_VIEW,
  ],
  SUPPORT: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_MANAGE,
    PERMISSIONS.BILLS_VIEW,
  ],
  ACCOUNTANT: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_MANAGE,
    PERMISSIONS.BILLS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SUBSCRIPTIONS_VIEW,
  ],
  VIEWER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.BILLS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
};
