import { o as __toESM } from "../_runtime.mjs";
import { M as VisibilityOutlined_default, en as require_jsx_runtime, n as VisibilityOffOutlined_default } from "../_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "../_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { C as Link, E as InputAdornment, H as Button, J as Typography, U as Box, V as Card, X as IconButton, Z as CircularProgress, k as FormControlLabel, t as TextField, z as Checkbox } from "../_libs/@mui/material+[...].mjs";
import { n as env, r as isApiError } from "./client-DaqzDLTU.mjs";
import { a as useAuth } from "./AuthContext-87_GBZZr.mjs";
import { t as colors } from "./theme-BYCmjw9S.mjs";
import { n as zt } from "../_libs/react-hot-toast.mjs";
import { t as AdminProviders } from "./AdminProviders-B9vriE2v.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as motion } from "../_libs/framer-motion+[...].mjs";
import { a as stringType, i as objectType, t as booleanType } from "../_libs/zod.mjs";
import { r as useForm, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-B6rhHv_D.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var schema = objectType({
	email: stringType().min(1, "Email is required").email("Enter a valid email"),
	password: stringType().min(6, "Password must be at least 6 characters"),
	remember: booleanType().optional()
});
function LoginPage() {
	const { login, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
		resolver: u(schema),
		defaultValues: {
			email: "",
			password: "",
			remember: true
		}
	});
	(0, import_react.useEffect)(() => {
		if (isAuthenticated) navigate({
			to: "/dashboard",
			replace: true
		});
	}, [isAuthenticated, navigate]);
	const onSubmit = async (values) => {
		try {
			await login(values);
			zt.success("Welcome back");
			navigate({
				to: "/dashboard",
				replace: true
			});
		} catch (e) {
			zt.error(isApiError(e) ? e.message : "Unable to sign in");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
		sx: {
			minHeight: "100vh",
			display: "grid",
			placeItems: "center",
			p: 2,
			background: `radial-gradient(1200px 600px at 100% 0%, ${colors.primaryLight}55, transparent), ${colors.background}`
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			component: motion.form,
			initial: {
				opacity: 0,
				y: 16
			},
			animate: {
				opacity: 1,
				y: 0
			},
			transition: { duration: .35 },
			onSubmit: handleSubmit(onSubmit),
			sx: {
				p: {
					xs: 3,
					sm: 5
				},
				width: "100%",
				maxWidth: 420
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
					sx: {
						display: "flex",
						alignItems: "center",
						gap: 1.5,
						mb: 3
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
						sx: {
							width: 40,
							height: 40,
							borderRadius: 2,
							display: "grid",
							placeItems: "center",
							color: "#fff",
							fontWeight: 800,
							background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`
						},
						children: "A"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "h5",
						sx: { fontWeight: 800 },
						children: env.APP_NAME
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					variant: "h2",
					sx: { mb: .5 },
					children: "Welcome back"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					variant: "body2",
					color: "text.secondary",
					sx: { mb: 3 },
					children: "Sign in to your admin account to continue."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					fullWidth: true,
					label: "Email",
					placeholder: "you@company.com",
					margin: "normal",
					autoComplete: "email",
					error: !!errors.email,
					helperText: errors.email?.message,
					...register("email")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
					fullWidth: true,
					label: "Password",
					type: showPassword ? "text" : "password",
					margin: "normal",
					autoComplete: "current-password",
					error: !!errors.password,
					helperText: errors.password?.message,
					slotProps: { input: { endAdornment: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputAdornment, {
						position: "end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							onClick: () => setShowPassword((s) => !s),
							edge: "end",
							"aria-label": "Toggle password visibility",
							children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisibilityOffOutlined_default, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisibilityOutlined_default, {})
						})
					}) } },
					...register("password")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
					sx: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						mt: 1,
						mb: 2
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControlLabel, {
						control: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							defaultChecked: true,
							...register("remember")
						}),
						label: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "body2",
							children: "Remember me"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						component: "button",
						type: "button",
						variant: "body2",
						underline: "hover",
						children: "Forgot password?"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					fullWidth: true,
					size: "large",
					variant: "contained",
					disabled: isSubmitting,
					startIcon: isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircularProgress, {
						size: 18,
						color: "inherit"
					}) : void 0,
					children: isSubmitting ? "Signing in…" : "Sign in"
				}),
				env.ENABLE_DEV_AUTH && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					variant: "caption",
					color: "text.secondary",
					sx: {
						display: "block",
						mt: 2,
						textAlign: "center"
					},
					children: "Dev mode: sign in with any credentials until the backend is connected."
				})
			]
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminProviders, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginPage, {}) });
//#endregion
export { SplitComponent as component };
