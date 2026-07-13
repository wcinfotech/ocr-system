import { en as require_jsx_runtime } from "../_libs/@mui/icons-material+[...].mjs";
import { U as Box } from "../_libs/@mui/material+[...].mjs";
import { t as EmptyState } from "./States-Bz7DtX_-.mjs";
import { t as PageHeader } from "./PageHeader-9ov710wi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ModulePlaceholder-BoWJf2ty.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Scaffold for modules whose backend endpoints are not yet wired. The full UI
* shell, routing and permission gating are in place — connect the service layer
* (src/services + src/hooks/queries) to activate.
* TODO(backend): replace with the module's data-driven UI once the API is live.
*/
function ModulePlaceholder({ title, subtitle, icon, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title,
		subtitle
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
		sx: {
			bgcolor: "background.paper",
			border: 1,
			borderColor: "divider",
			borderRadius: 3
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon,
			title: `${title} is ready to connect`,
			description: note ?? "The interface, routing and permissions are in place. Wire the service layer to your backend endpoint to activate this module."
		})
	})] });
}
//#endregion
export { ModulePlaceholder as t };
