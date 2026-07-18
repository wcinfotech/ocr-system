import { o as __toESM } from "../_runtime.mjs";
import { en as require_jsx_runtime } from "../_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "../_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { A as redirect, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { a as stringType, i as objectType, t as booleanType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DfOjRqFd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-Lp1at0_z.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$22 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Admin Panel — Enterprise SaaS Dashboard" },
			{
				name: "description",
				content: "Secure enterprise admin dashboard for managing users, subscriptions, plans, bills, payments and analytics."
			},
			{
				name: "author",
				content: "Admin Panel"
			},
			{
				property: "og:title",
				content: "Admin Panel — Enterprise SaaS Dashboard"
			},
			{
				property: "og:description",
				content: "Secure enterprise admin dashboard for managing users, subscriptions, plans, bills, payments and analytics."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "icon",
			href: "/favicon.ico",
			type: "image/x-icon"
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$22.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
var $$splitComponentImporter$20 = () => import("./unauthorized-V5nZS4CY.mjs");
var Route$21 = createFileRoute("/unauthorized")({
	ssr: false,
	head: () => ({ meta: [{ title: "Unauthorized — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./login-DNXjJHHT.mjs");
var Route$20 = createFileRoute("/login")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
objectType({
	email: stringType().min(1, "Email is required").email("Enter a valid email"),
	password: stringType().min(6, "Password must be at least 6 characters"),
	remember: booleanType().optional()
});
var $$splitComponentImporter$18 = () => import("../_admin-8dTYR8yJ.mjs");
var Route$19 = createFileRoute("/_admin")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
/** Auth guard: redirects to /login when there is no active session. */
var Route$18 = createFileRoute("/")({ beforeLoad: () => {
	throw redirect({ to: "/dashboard" });
} });
var $$splitComponentImporter$17 = () => import("../_admin.users-CMgQkvw1.mjs");
var Route$17 = createFileRoute("/_admin/users")({
	head: () => ({ meta: [{ title: "Users — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("../_admin.testimonials-CT1fU1gj.mjs");
var Route$16 = createFileRoute("/_admin/testimonials")({
	head: () => ({ meta: [{ title: "Testimonials Management — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("../_admin.support-h1WAO8jb.mjs");
var Route$15 = createFileRoute("/_admin/support")({
	head: () => ({ meta: [{ title: "Support Tickets — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("../_admin.subscriptions-BRDVp7oQ.mjs");
var Route$14 = createFileRoute("/_admin/subscriptions")({
	head: () => ({ meta: [{ title: "Subscriptions — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("../_admin.settings-JiOLjeZJ.mjs");
var Route$13 = createFileRoute("/_admin/settings")({
	head: () => ({ meta: [{ title: "System Settings — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("../_admin.roles-BDVT398u.mjs");
var Route$12 = createFileRoute("/_admin/roles")({
	head: () => ({ meta: [{ title: "Roles — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("../_admin.profile-DVw4mJ2s.mjs");
var Route$11 = createFileRoute("/_admin/profile")({
	head: () => ({ meta: [{ title: "Profile — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("../_admin.plans-DNiH7rJE.mjs");
var Route$10 = createFileRoute("/_admin/plans")({
	head: () => ({ meta: [{ title: "Plans — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("../_admin.permissions-CKjNaIQD.mjs");
var Route$9 = createFileRoute("/_admin/permissions")({
	head: () => ({ meta: [{ title: "Permissions — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("../_admin.payments-C_3CLkZq.mjs");
var Route$8 = createFileRoute("/_admin/payments")({
	head: () => ({ meta: [{ title: "Payments — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("../_admin.notifications-C5XruviE.mjs");
var Route$7 = createFileRoute("/_admin/notifications")({
	head: () => ({ meta: [{ title: "Notifications — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("../_admin.dashboard-CvAgi4dl.mjs");
var Route$6 = createFileRoute("/_admin/dashboard")({
	head: () => ({ meta: [{ title: "Dashboard — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("../_admin.blogs-3_EdldFw.mjs");
var Route$5 = createFileRoute("/_admin/blogs")({
	head: () => ({ meta: [{ title: "Blog Management — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("../_admin.bills-CgDXJvFl.mjs");
var Route$4 = createFileRoute("/_admin/bills")({
	head: () => ({ meta: [{ title: "Bills — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("../_admin.audit-logs-BsDefD8k.mjs");
var Route$3 = createFileRoute("/_admin/audit-logs")({
	head: () => ({ meta: [{ title: "Audit Logs — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("../_admin.analytics-Bo-IU6J2.mjs");
var Route$2 = createFileRoute("/_admin/analytics")({
	head: () => ({ meta: [{ title: "Analytics — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("../_admin.admins-Dl-g-iAq.mjs");
var Route$1 = createFileRoute("/_admin/admins")({
	head: () => ({ meta: [{ title: "Admins — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("../_admin.activity-logs-BIzm1dy5.mjs");
var Route = createFileRoute("/_admin/activity-logs")({
	head: () => ({ meta: [{ title: "API Logs — Admin Panel" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var UnauthorizedRoute = Route$21.update({
	id: "/unauthorized",
	path: "/unauthorized",
	getParentRoute: () => Route$22
});
var LoginRoute = Route$20.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$22
});
var AdminRoute = Route$19.update({
	id: "/_admin",
	getParentRoute: () => Route$22
});
var IndexRoute = Route$18.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$22
});
var AdminUsersRoute = Route$17.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => AdminRoute
});
var AdminTestimonialsRoute = Route$16.update({
	id: "/testimonials",
	path: "/testimonials",
	getParentRoute: () => AdminRoute
});
var AdminSupportRoute = Route$15.update({
	id: "/support",
	path: "/support",
	getParentRoute: () => AdminRoute
});
var AdminSubscriptionsRoute = Route$14.update({
	id: "/subscriptions",
	path: "/subscriptions",
	getParentRoute: () => AdminRoute
});
var AdminSettingsRoute = Route$13.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AdminRoute
});
var AdminRolesRoute = Route$12.update({
	id: "/roles",
	path: "/roles",
	getParentRoute: () => AdminRoute
});
var AdminProfileRoute = Route$11.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => AdminRoute
});
var AdminPlansRoute = Route$10.update({
	id: "/plans",
	path: "/plans",
	getParentRoute: () => AdminRoute
});
var AdminPermissionsRoute = Route$9.update({
	id: "/permissions",
	path: "/permissions",
	getParentRoute: () => AdminRoute
});
var AdminPaymentsRoute = Route$8.update({
	id: "/payments",
	path: "/payments",
	getParentRoute: () => AdminRoute
});
var AdminNotificationsRoute = Route$7.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => AdminRoute
});
var AdminDashboardRoute = Route$6.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AdminRoute
});
var AdminBlogsRoute = Route$5.update({
	id: "/blogs",
	path: "/blogs",
	getParentRoute: () => AdminRoute
});
var AdminBillsRoute = Route$4.update({
	id: "/bills",
	path: "/bills",
	getParentRoute: () => AdminRoute
});
var AdminAuditLogsRoute = Route$3.update({
	id: "/audit-logs",
	path: "/audit-logs",
	getParentRoute: () => AdminRoute
});
var AdminAnalyticsRoute = Route$2.update({
	id: "/analytics",
	path: "/analytics",
	getParentRoute: () => AdminRoute
});
var AdminAdminsRoute = Route$1.update({
	id: "/admins",
	path: "/admins",
	getParentRoute: () => AdminRoute
});
var AdminRouteChildren = {
	AdminActivityLogsRoute: Route.update({
		id: "/activity-logs",
		path: "/activity-logs",
		getParentRoute: () => AdminRoute
	}),
	AdminAdminsRoute,
	AdminAnalyticsRoute,
	AdminAuditLogsRoute,
	AdminBillsRoute,
	AdminBlogsRoute,
	AdminDashboardRoute,
	AdminNotificationsRoute,
	AdminPaymentsRoute,
	AdminPermissionsRoute,
	AdminPlansRoute,
	AdminProfileRoute,
	AdminRolesRoute,
	AdminSettingsRoute,
	AdminSubscriptionsRoute,
	AdminSupportRoute,
	AdminTestimonialsRoute,
	AdminUsersRoute
};
var rootRouteChildren = {
	IndexRoute,
	AdminRoute: AdminRoute._addFileChildren(AdminRouteChildren),
	LoginRoute,
	UnauthorizedRoute
};
var routeTree = Route$22._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
