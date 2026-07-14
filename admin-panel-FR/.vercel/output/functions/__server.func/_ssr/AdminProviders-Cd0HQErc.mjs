import { en as require_jsx_runtime } from "../_libs/@mui/icons-material+[...].mjs";
import { $ as ThemeProvider, R as CssBaseline } from "../_libs/@mui/material+[...].mjs";
import { t as AuthProvider } from "./AuthContext-Bj2jbtLU.mjs";
import { n as theme, t as colors } from "./theme-BYCmjw9S.mjs";
import { t as Fe } from "../_libs/react-hot-toast.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AdminProviders-Cd0HQErc.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Wraps the admin surface with MUI theme, baseline CSS, auth context and the
* toast portal. Kept client-only (routes using it set ssr:false) so Emotion and
* localStorage-based auth run in the browser without SSR hydration mismatch.
*/
function AdminProviders({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ThemeProvider, {
		theme,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CssBaseline, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fe, {
			position: "top-right",
			toastOptions: {
				style: {
					borderRadius: "12px",
					border: `1px solid ${colors.border}`,
					color: colors.textPrimary,
					fontSize: "0.875rem"
				},
				success: { iconTheme: {
					primary: colors.success,
					secondary: "#fff"
				} },
				error: { iconTheme: {
					primary: colors.danger,
					secondary: "#fff"
				} }
			}
		})] })]
	});
}
//#endregion
export { AdminProviders as t };
