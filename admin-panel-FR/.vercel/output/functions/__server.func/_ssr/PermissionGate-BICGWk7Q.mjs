import { en as require_jsx_runtime } from "../_libs/@mui/icons-material+[...].mjs";
import { t as usePermissions } from "./usePermissions-BicXZrSq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PermissionGate-BICGWk7Q.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Conditionally renders children based on the user's permissions.
* Use to hide buttons, actions, sections and menu items — never hardcode roles.
*/
function PermissionGate({ permission, anyOf, allOf, children, fallback = null }) {
	const { can, canAny, canAll } = usePermissions();
	let allowed = true;
	if (permission) allowed = can(permission);
	if (allowed && anyOf) allowed = canAny(anyOf);
	if (allowed && allOf) allowed = canAll(allOf);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: allowed ? children : fallback });
}
//#endregion
export { PermissionGate as t };
