import { en as require_jsx_runtime } from "../_libs/@mui/icons-material+[...].mjs";
import { F as DialogContent, H as Button, I as DialogActions, L as Dialog, N as DialogTitle, P as DialogContentText } from "../_libs/@mui/material+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ConfirmDialog-BpC-lVsT.js
var import_jsx_runtime = require_jsx_runtime();
function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", destructive, loading, onConfirm, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onClose,
		maxWidth: "xs",
		fullWidth: true,
		slotProps: { paper: { sx: { borderRadius: 3 } } },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				sx: { fontWeight: 700 },
				children: title
			}),
			description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContentText, { children: description }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogActions, {
				sx: {
					px: 3,
					pb: 2.5
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onClose,
					color: "inherit",
					disabled: loading,
					children: cancelLabel
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onConfirm,
					variant: "contained",
					color: destructive ? "error" : "primary",
					disabled: loading,
					children: confirmLabel
				})]
			})
		]
	});
}
//#endregion
export { ConfirmDialog as t };
