import { o as __toESM } from "../_runtime.mjs";
import { en as require_jsx_runtime } from "../_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "../_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { n as env, r as isApiError, t as apiClient } from "./client-oeguNz2X.mjs";
import { t as ENDPOINTS } from "./endpoints-CxMhKP9P.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AuthContext-Bj2jbtLU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var authService = {
	login: async (payload) => {
		const { data } = await apiClient.post(ENDPOINTS.auth.login, payload);
		return data;
	},
	logout: async () => {
		await apiClient.post(ENDPOINTS.auth.logout);
	},
	me: async () => {
		const { data } = await apiClient.get(ENDPOINTS.auth.me);
		return data;
	},
	forgotPassword: async (email) => {
		await apiClient.post(ENDPOINTS.auth.forgotPassword, { email });
	}
};
/**
* RBAC definitions. Roles and permissions are DATA, never hardcoded into
* component logic. Components/routes/buttons check permission strings via the
* usePermissions hook or <PermissionGate>. The actual permission set for a
* signed-in user comes from the backend (user.permissions / user.role).
*/
var ROLES = {
	SUPER_ADMIN: "SUPER_ADMIN",
	ADMIN: "ADMIN",
	MANAGER: "MANAGER",
	SUPPORT: "SUPPORT",
	ACCOUNTANT: "ACCOUNTANT",
	VIEWER: "VIEWER"
};
/** Canonical permission strings — extend as the backend defines more. */
var PERMISSIONS = {
	DASHBOARD_VIEW: "dashboard:view",
	USERS_VIEW: "users:view",
	USERS_CREATE: "users:create",
	USERS_EDIT: "users:edit",
	USERS_DELETE: "users:delete",
	USERS_SUSPEND: "users:suspend",
	SUBSCRIPTIONS_VIEW: "subscriptions:view",
	SUBSCRIPTIONS_MANAGE: "subscriptions:manage",
	PLANS_VIEW: "plans:view",
	PLANS_MANAGE: "plans:manage",
	BILLS_VIEW: "bills:view",
	BILLS_MANAGE: "bills:manage",
	PAYMENTS_VIEW: "payments:view",
	PAYMENTS_MANAGE: "payments:manage",
	SUPPORT_VIEW: "support:view",
	SUPPORT_MANAGE: "support:manage",
	NOTIFICATIONS_VIEW: "notifications:view",
	NOTIFICATIONS_SEND: "notifications:send",
	ANALYTICS_VIEW: "analytics:view",
	ROLES_VIEW: "roles:view",
	ROLES_MANAGE: "roles:manage",
	PERMISSIONS_VIEW: "permissions:view",
	PERMISSIONS_MANAGE: "permissions:manage",
	ADMINS_VIEW: "admins:view",
	ADMINS_MANAGE: "admins:manage",
	ACTIVITY_LOGS_VIEW: "activity_logs:view",
	AUDIT_LOGS_VIEW: "audit_logs:view",
	SETTINGS_VIEW: "settings:view",
	SETTINGS_MANAGE: "settings:manage"
};
/**
* Fallback role -> permission map used ONLY when the backend does not return an
* explicit permission list on the user object. The backend remains the source
* of truth; this keeps the UI functional if only a role is provided.
* TODO(backend): prefer returning an explicit `permissions` array per user.
*/
var ROLE_PERMISSION_FALLBACK = {
	SUPER_ADMIN: ["*"],
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
		PERMISSIONS.SUPPORT_VIEW
	],
	SUPPORT: [
		PERMISSIONS.DASHBOARD_VIEW,
		PERMISSIONS.USERS_VIEW,
		PERMISSIONS.SUPPORT_VIEW,
		PERMISSIONS.SUPPORT_MANAGE,
		PERMISSIONS.BILLS_VIEW
	],
	ACCOUNTANT: [
		PERMISSIONS.DASHBOARD_VIEW,
		PERMISSIONS.PAYMENTS_VIEW,
		PERMISSIONS.PAYMENTS_MANAGE,
		PERMISSIONS.BILLS_VIEW,
		PERMISSIONS.ANALYTICS_VIEW,
		PERMISSIONS.SUBSCRIPTIONS_VIEW
	],
	VIEWER: [
		PERMISSIONS.DASHBOARD_VIEW,
		PERMISSIONS.USERS_VIEW,
		PERMISSIONS.BILLS_VIEW,
		PERMISSIONS.ANALYTICS_VIEW
	]
};
var AuthContext = (0, import_react.createContext)(void 0);
var readStoredUser = () => {
	if (typeof window === "undefined") return null;
	const raw = window.localStorage.getItem(env.USER_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
};
/**
* DEV-ONLY fallback user, used when VITE_ENABLE_DEV_AUTH is true and the backend
* login endpoint is unreachable, so the UI can be navigated during development.
* TODO(backend): remove once the external API is connected.
*/
var devUser = {
	id: "dev-super-admin",
	name: "Dev Super Admin",
	email: "admin@local.dev",
	role: ROLES.SUPER_ADMIN,
	permissions: ["*"]
};
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [isInitializing, setIsInitializing] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		setUser(readStoredUser());
		setIsInitializing(false);
		const onUnauthorized = () => setUser(null);
		window.addEventListener("admin:unauthorized", onUnauthorized);
		return () => window.removeEventListener("admin:unauthorized", onUnauthorized);
	}, []);
	const persist = (0, import_react.useCallback)((token, u, refresh) => {
		window.localStorage.setItem(env.TOKEN_KEY, token);
		window.localStorage.setItem(env.USER_KEY, JSON.stringify(u));
		if (refresh) window.localStorage.setItem(env.REFRESH_TOKEN_KEY, refresh);
		setUser(u);
	}, []);
	const login = (0, import_react.useCallback)(async (payload) => {
		try {
			const res = await authService.login(payload);
			persist(res.accessToken, res.user, res.refreshToken);
		} catch (error) {
			const notReachable = isApiError(error) && (error.status === 0 || error.status === 404);
			if (env.ENABLE_DEV_AUTH && notReachable) {
				persist("dev-token", devUser);
				return;
			}
			throw error;
		}
	}, [persist]);
	const logout = (0, import_react.useCallback)(async () => {
		try {
			await authService.logout();
		} catch {} finally {
			window.localStorage.removeItem(env.TOKEN_KEY);
			window.localStorage.removeItem(env.USER_KEY);
			window.localStorage.removeItem(env.REFRESH_TOKEN_KEY);
			setUser(null);
		}
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		user,
		isAuthenticated: !!user,
		isInitializing,
		login,
		logout
	}), [
		user,
		isInitializing,
		login,
		logout
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
	return ctx;
}
//#endregion
export { useAuth as a, ROLE_PERMISSION_FALLBACK as i, PERMISSIONS as n, ROLES as r, AuthProvider as t };
