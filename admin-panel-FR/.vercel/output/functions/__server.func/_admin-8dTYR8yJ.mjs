import { o as __toESM } from "./_runtime.mjs";
import { $ as CreditCardOutlined_default, B as LogoutOutlined_default, G as KeyOutlined_default, H as FactCheckOutlined_default, J as SpaceDashboardOutlined_default, K as BadgeOutlined_default, Q as PersonOutlineOutlined_default, U as HistoryOutlined_default, V as Menu_default, W as AdminPanelSettingsOutlined_default, X as SettingsOutlined_default, Y as RateReviewOutlined_default, Z as SupportAgentOutlined_default, at as InsightsOutlined_default, en as require_jsx_runtime, et as NotificationsNoneOutlined_default, it as ArticleOutlined_default, nt as ReceiptLongOutlined_default, ot as Search_default, q as LayersOutlined_default, rt as PeopleAltOutlined_default, tt as AutorenewOutlined_default } from "./_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "./_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { E as InputAdornment, G as Avatar, J as Typography, M as Divider, U as Box, W as Badge, X as IconButton, _ as MenuItem, b as ListItemIcon, j as Drawer, m as Tooltip, t as TextField, v as Menu } from "./_libs/@mui/material+[...].mjs";
import { r as Loader } from "./_ssr/States-Bz7DtX_-.mjs";
import { c as initialsOf } from "./_ssr/format-CPIzLQoT.mjs";
import { a as useAuth, n as PERMISSIONS } from "./_ssr/AuthContext-Bj2jbtLU.mjs";
import { t as usePermissions } from "./_ssr/usePermissions-D7xIyXuL.mjs";
import { t as AdminProviders } from "./_ssr/AdminProviders-Cd0HQErc.mjs";
import { _ as useNavigate, f as Outlet, g as Link, l as useRouterState } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin-8dTYR8yJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Sidebar navigation. Visibility is permission-driven — never hardcoded. */
var NAV_ITEMS = [
	{
		label: "Dashboard",
		to: "/dashboard",
		icon: SpaceDashboardOutlined_default,
		permission: PERMISSIONS.DASHBOARD_VIEW,
		section: "Overview"
	},
	{
		label: "Users",
		to: "/users",
		icon: PeopleAltOutlined_default,
		permission: PERMISSIONS.USERS_VIEW,
		section: "Management"
	},
	{
		label: "Subscriptions",
		to: "/subscriptions",
		icon: AutorenewOutlined_default,
		permission: PERMISSIONS.SUBSCRIPTIONS_VIEW,
		section: "Management"
	},
	{
		label: "Plans",
		to: "/plans",
		icon: LayersOutlined_default,
		permission: PERMISSIONS.PLANS_VIEW,
		section: "Management"
	},
	{
		label: "Bills",
		to: "/bills",
		icon: ReceiptLongOutlined_default,
		permission: PERMISSIONS.BILLS_VIEW,
		section: "Management"
	},
	{
		label: "Payments",
		to: "/payments",
		icon: CreditCardOutlined_default,
		permission: PERMISSIONS.PAYMENTS_VIEW,
		section: "Finance"
	},
	{
		label: "Analytics",
		to: "/analytics",
		icon: InsightsOutlined_default,
		permission: PERMISSIONS.ANALYTICS_VIEW,
		section: "Finance"
	},
	{
		label: "Support Tickets",
		to: "/support",
		icon: SupportAgentOutlined_default,
		permission: PERMISSIONS.SUPPORT_VIEW,
		section: "Operations"
	},
	{
		label: "Blogs",
		to: "/blogs",
		icon: ArticleOutlined_default,
		section: "Operations"
	},
	{
		label: "Testimonials",
		to: "/testimonials",
		icon: RateReviewOutlined_default,
		section: "Operations"
	},
	{
		label: "Notifications",
		to: "/notifications",
		icon: NotificationsNoneOutlined_default,
		permission: PERMISSIONS.NOTIFICATIONS_VIEW,
		section: "Operations"
	},
	{
		label: "Roles",
		to: "/roles",
		icon: BadgeOutlined_default,
		permission: PERMISSIONS.ROLES_VIEW,
		section: "Access Control"
	},
	{
		label: "Permissions",
		to: "/permissions",
		icon: KeyOutlined_default,
		permission: PERMISSIONS.PERMISSIONS_VIEW,
		section: "Access Control"
	},
	{
		label: "Admins",
		to: "/admins",
		icon: AdminPanelSettingsOutlined_default,
		permission: PERMISSIONS.ADMINS_VIEW,
		section: "Access Control"
	},
	{
		label: "Activity Logs",
		to: "/activity-logs",
		icon: HistoryOutlined_default,
		permission: PERMISSIONS.ACTIVITY_LOGS_VIEW,
		section: "System"
	},
	{
		label: "Audit Logs",
		to: "/audit-logs",
		icon: FactCheckOutlined_default,
		permission: PERMISSIONS.AUDIT_LOGS_VIEW,
		section: "System"
	},
	{
		label: "System Settings",
		to: "/settings",
		icon: SettingsOutlined_default,
		permission: PERMISSIONS.SETTINGS_VIEW,
		section: "System"
	},
	{
		label: "Profile",
		to: "/profile",
		icon: PersonOutlineOutlined_default,
		section: "Account"
	}
];
function Sidebar({ onNavigate }) {
	const { can } = usePermissions();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const sections = NAV_ITEMS.filter((item) => can(item.permission)).reduce((acc, item) => {
		const name = item.section ?? "General";
		let group = acc.find((g) => g.name === name);
		if (!group) {
			group = {
				name,
				items: []
			};
			acc.push(group);
		}
		group.items.push(item);
		return acc;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
		component: "nav",
		"aria-label": "Primary",
		sx: {
			width: 264,
			flexShrink: 0,
			bgcolor: "background.paper",
			borderRight: 1,
			borderColor: "divider",
			height: "100%",
			display: "flex",
			flexDirection: "column"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
				sx: {
					px: 3,
					py: 2.5,
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-start"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/logo.png",
					alt: "Escannora Logo",
					style: {
						height: 48,
						objectFit: "contain"
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
				sx: {
					flex: 1,
					overflowY: "auto",
					px: 1.5,
					py: 2
				},
				children: sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
					sx: { mb: 2 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "caption",
						sx: {
							px: 1.5,
							color: "text.secondary",
							fontWeight: 700,
							textTransform: "uppercase",
							letterSpacing: "0.04em",
							fontSize: "0.68rem"
						},
						children: section.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
						sx: {
							mt: .75,
							display: "flex",
							flexDirection: "column",
							gap: .25
						},
						children: section.items.map((item) => {
							const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								title: "",
								disableHoverListener: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
									component: Link,
									to: item.to,
									onClick: onNavigate,
									sx: {
										display: "flex",
										alignItems: "center",
										gap: 1.5,
										px: 1.5,
										py: 1,
										borderRadius: 2,
										textDecoration: "none",
										color: active ? "primary.main" : "text.secondary",
										bgcolor: active ? "primary.light" : "transparent",
										fontWeight: active ? 700 : 500,
										fontSize: "0.9rem",
										transition: "background-color .15s ease, color .15s ease",
										"&:hover": {
											bgcolor: active ? "primary.light" : "action.hover",
											color: active ? "primary.main" : "text.primary"
										}
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { fontSize: "small" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label })]
								})
							}, item.to);
						})
					})]
				}, section.name))
			})
		]
	});
}
function Breadcrumbs() {
	const crumbs = useRouterState({ select: (s) => s.location.pathname }).split("/").filter(Boolean).map((p) => p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
		sx: {
			display: "flex",
			alignItems: "center",
			gap: .75,
			minWidth: 0
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
			variant: "body2",
			color: "text.secondary",
			children: "Admin"
		}), crumbs.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
			sx: {
				display: "flex",
				alignItems: "center",
				gap: .75,
				minWidth: 0
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "body2",
				color: "text.secondary",
				children: "/"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "body2",
				noWrap: true,
				sx: {
					fontWeight: i === crumbs.length - 1 ? 700 : 500,
					color: i === crumbs.length - 1 ? "text.primary" : "text.secondary"
				},
				children: c
			})]
		}, i))]
	});
}
function Navbar({ onMenuClick }) {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [anchor, setAnchor] = (0, import_react.useState)(null);
	const handleLogout = async () => {
		setAnchor(null);
		await logout();
		navigate({ to: "/login" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
		component: "header",
		sx: {
			height: 64,
			px: {
				xs: 2,
				md: 3
			},
			display: "flex",
			alignItems: "center",
			gap: 2,
			bgcolor: "background.paper",
			borderBottom: 1,
			borderColor: "divider"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
				onClick: onMenuClick,
				sx: { display: { lg: "none" } },
				"aria-label": "Open menu",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu_default, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
				sx: {
					display: {
						xs: "none",
						md: "block"
					},
					flex: "0 1 auto",
					minWidth: 0
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumbs, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { sx: { flex: 1 } }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
				size: "small",
				placeholder: "Search…",
				sx: {
					display: {
						xs: "none",
						sm: "block"
					},
					width: 240
				},
				slotProps: { input: { startAdornment: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputAdornment, {
					position: "start",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search_default, { fontSize: "small" })
				}) } }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
				"aria-label": "Notifications",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					color: "error",
					variant: "dot",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationsNoneOutlined_default, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
				onClick: (e) => setAnchor(e.currentTarget),
				sx: { p: .5 },
				"aria-label": "Account",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					src: user?.avatarUrl,
					sx: {
						width: 34,
						height: 34,
						bgcolor: "primary.main",
						fontSize: "0.85rem"
					},
					children: initialsOf(user?.name)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Menu, {
				anchorEl: anchor,
				open: !!anchor,
				onClose: () => setAnchor(null),
				transformOrigin: {
					horizontal: "right",
					vertical: "top"
				},
				anchorOrigin: {
					horizontal: "right",
					vertical: "bottom"
				},
				slotProps: { paper: { sx: {
					minWidth: 220,
					borderRadius: 2.5,
					mt: 1
				} } },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
						sx: {
							px: 2,
							py: 1.5
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "subtitle2",
							noWrap: true,
							children: user?.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "caption",
							color: "text.secondary",
							noWrap: true,
							sx: { display: "block" },
							children: user?.email
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MenuItem, {
						onClick: () => {
							setAnchor(null);
							navigate({ to: "/profile" });
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListItemIcon, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonOutlineOutlined_default, { fontSize: "small" }) }), "Profile"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MenuItem, {
						onClick: handleLogout,
						sx: { color: "error.main" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListItemIcon, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoutOutlined_default, {
							fontSize: "small",
							color: "error"
						}) }), "Logout"]
					})
				]
			})
		]
	});
}
function AppShell({ children }) {
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
		sx: {
			display: "flex",
			height: "100vh",
			bgcolor: "background.default"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
				sx: {
					display: {
						xs: "none",
						lg: "block"
					},
					height: "100%",
					position: "sticky",
					top: 0
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer, {
				open: mobileOpen,
				onClose: () => setMobileOpen(false),
				sx: {
					display: { lg: "none" },
					"& .MuiDrawer-paper": {
						width: 264,
						border: "none"
					}
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, { onNavigate: () => setMobileOpen(false) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
				sx: {
					flex: 1,
					minWidth: 0,
					display: "flex",
					flexDirection: "column",
					height: "100%"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
					sx: {
						position: "sticky",
						top: 0,
						zIndex: 10
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, { onMenuClick: () => setMobileOpen(true) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
					component: "main",
					sx: {
						flex: 1,
						overflowY: "auto",
						p: {
							xs: 2,
							md: 3,
							lg: 4
						},
						maxWidth: 1440,
						width: "100%",
						mx: "auto"
					},
					children
				})]
			})
		]
	});
}
/** Auth guard: redirects to /login when there is no active session. */
function Guard() {
	const { isAuthenticated, isInitializing } = useAuth();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!isInitializing && !isAuthenticated) navigate({
			to: "/login",
			replace: true
		});
	}, [
		isInitializing,
		isAuthenticated,
		navigate
	]);
	if (isInitializing || !isAuthenticated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {
		label: "Checking session…",
		minHeight: 400
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
function AdminLayout() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminProviders, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Guard, {}) });
}
//#endregion
export { AdminLayout as component };
