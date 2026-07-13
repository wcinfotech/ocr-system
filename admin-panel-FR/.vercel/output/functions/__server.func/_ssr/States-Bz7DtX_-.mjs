import { ct as Inbox_default, en as require_jsx_runtime, st as ErrorOutlineOutlined_default } from "../_libs/@mui/icons-material+[...].mjs";
import { H as Button, J as Typography, U as Box, Z as CircularProgress } from "../_libs/@mui/material+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/States-Bz7DtX_-.js
var import_jsx_runtime = require_jsx_runtime();
/** Full-screen / block loading spinner. */
function Loader({ label = "Loading…", minHeight = 240 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
		sx: {
			display: "grid",
			placeItems: "center",
			minHeight,
			gap: 1.5
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircularProgress, {
			size: 32,
			thickness: 4
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
			variant: "body2",
			color: "text.secondary",
			children: label
		})]
	});
}
function EmptyState({ title = "Nothing here yet", description = "There is no data to display.", icon: Icon = Inbox_default, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
		sx: {
			display: "grid",
			placeItems: "center",
			textAlign: "center",
			py: 8,
			px: 3,
			gap: 1.5
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
				sx: {
					width: 64,
					height: 64,
					borderRadius: "50%",
					display: "grid",
					placeItems: "center",
					bgcolor: "primary.light",
					color: "primary.main"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { fontSize: "large" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "h4",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "body2",
				color: "text.secondary",
				sx: { maxWidth: 420 },
				children: description
			}),
			action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
				sx: { mt: 1 },
				children: action
			})
		]
	});
}
function ErrorState({ message = "Failed to load data.", onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
		sx: {
			display: "grid",
			placeItems: "center",
			textAlign: "center",
			py: 8,
			px: 3,
			gap: 1.5
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
				sx: {
					width: 64,
					height: 64,
					borderRadius: "50%",
					display: "grid",
					placeItems: "center",
					bgcolor: (t) => t.palette.error.main + "1f",
					color: "error.main"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorOutlineOutlined_default, { fontSize: "large" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "h4",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "body2",
				color: "text.secondary",
				sx: { maxWidth: 420 },
				children: message
			}),
			onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outlined",
				onClick: onRetry,
				sx: { mt: 1 },
				children: "Try again"
			})
		]
	});
}
//#endregion
export { ErrorState as n, Loader as r, EmptyState as t };
