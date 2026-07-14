import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { a as useAuth, i as ROLE_PERMISSION_FALLBACK } from "./AuthContext-Bj2jbtLU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/usePermissions-D7xIyXuL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Permission checks derived from the signed-in user. The backend is the source
* of truth: prefer an explicit `user.permissions` array; fall back to the
* role -> permission map only if permissions are not provided.
*/
function usePermissions() {
	const { user } = useAuth();
	const permissionSet = (0, import_react.useMemo)(() => {
		if (!user) return /* @__PURE__ */ new Set();
		const explicit = user.permissions;
		const list = explicit && explicit.length > 0 ? explicit : ROLE_PERMISSION_FALLBACK[user.role] ?? [];
		return new Set(list);
	}, [user]);
	const isSuperAdmin = permissionSet.has("*");
	const can = (permission) => {
		if (!permission) return true;
		if (isSuperAdmin) return true;
		return permissionSet.has(permission);
	};
	const canAny = (permissions) => isSuperAdmin || permissions.some((p) => permissionSet.has(p));
	const canAll = (permissions) => isSuperAdmin || permissions.every((p) => permissionSet.has(p));
	return {
		can,
		canAny,
		canAll,
		isSuperAdmin,
		role: user?.role
	};
}
//#endregion
export { usePermissions as t };
