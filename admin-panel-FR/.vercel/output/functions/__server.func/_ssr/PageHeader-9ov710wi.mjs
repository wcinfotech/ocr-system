import { en as require_jsx_runtime } from "../_libs/@mui/icons-material+[...].mjs";
import { J as Typography, U as Box } from "../_libs/@mui/material+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PageHeader-9ov710wi.js
var import_jsx_runtime = require_jsx_runtime();
function PageHeader({ title, subtitle, actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
		sx: {
			display: "grid",
			gridTemplateColumns: "minmax(0,1fr) auto",
			alignItems: "center",
			gap: 2,
			mb: 3
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
			sx: { minWidth: 0 },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "h1",
				noWrap: true,
				children: title
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "body2",
				color: "text.secondary",
				sx: { mt: .5 },
				children: subtitle
			})]
		}), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
			sx: {
				display: "flex",
				gap: 1.5,
				flexShrink: 0
			},
			children: actions
		})]
	});
}
//#endregion
export { PageHeader as t };
