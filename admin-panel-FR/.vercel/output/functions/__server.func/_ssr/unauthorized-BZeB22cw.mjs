import { en as require_jsx_runtime, t as LockOutlined_default } from "../_libs/@mui/icons-material+[...].mjs";
import { H as Button, J as Typography, U as Box } from "../_libs/@mui/material+[...].mjs";
import { t as AdminProviders } from "./AdminProviders-B9vriE2v.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/unauthorized-BZeB22cw.js
var import_jsx_runtime = require_jsx_runtime();
function UnauthorizedPage() {
	const navigate = useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
		sx: {
			minHeight: "100vh",
			display: "grid",
			placeItems: "center",
			bgcolor: "background.default",
			p: 3
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
			sx: {
				textAlign: "center",
				maxWidth: 420
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
					sx: {
						width: 72,
						height: 72,
						borderRadius: "50%",
						mx: "auto",
						mb: 2,
						display: "grid",
						placeItems: "center",
						bgcolor: "primary.light",
						color: "primary.main"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOutlined_default, { fontSize: "large" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					variant: "h2",
					gutterBottom: true,
					children: "Access denied"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					variant: "body2",
					color: "text.secondary",
					sx: { mb: 3 },
					children: "You don't have permission to view this page. Contact your administrator if you believe this is a mistake."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "contained",
					onClick: () => navigate({ to: "/dashboard" }),
					children: "Back to dashboard"
				})
			]
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminProviders, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnauthorizedPage, {}) });
//#endregion
export { SplitComponent as component };
