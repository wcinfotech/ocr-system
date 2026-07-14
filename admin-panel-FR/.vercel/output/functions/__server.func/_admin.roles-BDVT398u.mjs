import { M as VisibilityOutlined_default, Z as SupportAgentOutlined_default, d as AccountBalanceOutlined_default, en as require_jsx_runtime, f as VerifiedUserOutlined_default, m as ShieldOutlined_default, p as SecurityOutlined_default, u as CheckCircleOutlined_default } from "./_libs/@mui/icons-material+[...].mjs";
import { B as CardContent, D as Grid, J as Typography, K as Chip, M as Divider, S as List, U as Box, V as Card, b as ListItemIcon, p as Stack, x as ListItem, y as ListItemText } from "./_libs/@mui/material+[...].mjs";
import { t as PageHeader } from "./_ssr/PageHeader-9ov710wi.mjs";
import { a as useRoles } from "./_ssr/useAdmins-FqfJiGDk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.roles-BDVT398u.js
var import_jsx_runtime = require_jsx_runtime();
function RolesPage() {
	const { data: roles = [], isLoading, isError, refetch } = useRoles();
	const getRoleIcon = (name) => {
		switch (name) {
			case "SUPER_ADMIN": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOutlined_default, {
				color: "error",
				sx: { fontSize: 32 }
			});
			case "ADMIN": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityOutlined_default, {
				color: "primary",
				sx: { fontSize: 32 }
			});
			case "MANAGER": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerifiedUserOutlined_default, {
				color: "warning",
				sx: { fontSize: 32 }
			});
			case "SUPPORT": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupportAgentOutlined_default, {
				color: "success",
				sx: { fontSize: 32 }
			});
			case "ACCOUNTANT": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountBalanceOutlined_default, {
				color: "secondary",
				sx: { fontSize: 32 }
			});
			default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisibilityOutlined_default, {
				color: "disabled",
				sx: { fontSize: 32 }
			});
		}
	};
	const getRoleDescription = (name) => {
		switch (name) {
			case "SUPER_ADMIN": return "Absolute system owner. Has access to all system APIs, audit logs, and developer options.";
			case "ADMIN": return "Standard administrator credentials. Manages users, plans, support tickets, and system settings.";
			case "MANAGER": return "Managerial credentials. Handles operations, views analytics, and oversees active client subscriptions.";
			case "SUPPORT": return "Support staff credentials. Dedicated to replying to customer tickets and checking invoice states.";
			case "ACCOUNTANT": return "Financial credentials. Reviews client payments, issues refunds, and tracks monthly billing invoices.";
			case "VIEWER": return "Read-only auditor credentials. Allowed to view user directories, logs, and dashboard metrics.";
			default: return "Custom system role defined in application settings.";
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Access Control Roles",
		subtitle: "View administrative roles, their permission templates, and operational scopes."
	}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
		sx: {
			py: 8,
			display: "flex",
			justifyContent: "center"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
			color: "text.secondary",
			children: "Loading roles catalog..."
		})
	}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
		sx: {
			py: 8,
			textAlign: "center"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
			color: "error",
			sx: { mb: 2 },
			children: "Failed to retrieve roles catalog."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outlined",
			onClick: () => refetch(),
			children: "Retry"
		})]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
		container: true,
		spacing: 3,
		children: roles.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
			item: true,
			xs: 12,
			md: 6,
			lg: 4,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				sx: {
					height: "100%",
					display: "flex",
					flexDirection: "col",
					borderRadius: 3.5,
					boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
					border: "1px solid",
					borderColor: "divider"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					sx: {
						flexGrow: 1,
						p: 3,
						display: "flex",
						flexDirection: "column"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
							direction: "row",
							spacing: 2,
							alignItems: "center",
							sx: { mb: 2 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
								sx: {
									p: 1.5,
									borderRadius: 3,
									bgcolor: "grey.50",
									display: "flex",
									alignItems: "center",
									justifyContent: "center"
								},
								children: getRoleIcon(role.name)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "h6",
								sx: { fontWeight: 800 },
								children: role.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								label: role.name === "SUPER_ADMIN" ? "Unlimited access" : `${role.permissions.length} default rules`,
								size: "small",
								color: role.name === "SUPER_ADMIN" ? "error" : "primary",
								variant: role.name === "SUPER_ADMIN" ? "filled" : "outlined",
								sx: {
									fontWeight: 700,
									mt: .5,
									borderRadius: 1.5,
									fontSize: "0.65rem"
								}
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "body2",
							color: "text.secondary",
							sx: {
								mb: 3,
								minHeight: 40,
								lineHeight: 1.5
							},
							children: getRoleDescription(role.name)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
							sx: {
								mt: 2.5,
								flexGrow: 1
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "subtitle2",
								sx: {
									fontWeight: 750,
									mb: 1,
									fontSize: "0.75rem",
									textTransform: "uppercase",
									letterSpacing: .5,
									color: "text.secondary"
								},
								children: "Permission Template Rules"
							}), role.permissions.includes("*") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
								variant: "body2",
								color: "error.main",
								sx: {
									fontWeight: 650,
									display: "flex",
									alignItems: "center",
									gap: 1
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCircleOutlined_default, {
									color: "error",
									fontSize: "inherit"
								}), " Wildcard permission override (*)"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
								dense: true,
								disablePadding: true,
								sx: {
									maxHeight: 200,
									overflowY: "auto"
								},
								children: role.permissions.map((perm) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ListItem, {
									disableGutters: true,
									sx: { py: .25 },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListItemIcon, {
										sx: { minWidth: 24 },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCircleOutlined_default, {
											color: "primary",
											sx: { fontSize: 14 }
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListItemText, {
										primary: perm,
										primaryTypographyProps: {
											variant: "caption",
											sx: {
												fontFamily: "monospace",
												color: "text.primary",
												fontWeight: 550
											}
										}
									})]
								}, perm))
							})]
						})
					]
				})
			})
		}, role.name))
	})] });
}
//#endregion
export { RolesPage as component };
