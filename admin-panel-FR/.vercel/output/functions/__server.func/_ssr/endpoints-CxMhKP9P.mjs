//#region node_modules/.nitro/vite/services/ssr/assets/endpoints-CxMhKP9P.js
/**
* Central registry of backend endpoints. Change paths here only — never inline
* URL strings in services or components.
* TODO(backend): align these paths with the actual external API contract.
*/
var ENDPOINTS = {
	auth: {
		login: "/admin/auth/login",
		logout: "/admin/auth/logout",
		me: "/admin/auth/me",
		refresh: "/admin/auth/refresh",
		forgotPassword: "/admin/auth/forgot-password"
	},
	dashboard: {
		stats: "/admin/dashboard/stats",
		charts: "/admin/dashboard/charts",
		recentUsers: "/admin/dashboard/recent-users",
		recentBills: "/admin/dashboard/recent-bills"
	},
	users: {
		list: "/admin/users",
		detail: (id) => `/admin/users/${id}`,
		suspend: (id) => `/admin/users/${id}/suspend`,
		activate: (id) => `/admin/users/${id}/activate`,
		export: "/admin/users/export"
	},
	plans: {
		list: "/admin/plans",
		detail: (id) => `/admin/plans/${id}`
	},
	subscriptions: {
		list: "/admin/subscriptions",
		detail: (id) => `/admin/subscriptions/${id}`,
		assign: "/admin/subscriptions/assign",
		renew: (id) => `/admin/subscriptions/${id}/renew`,
		expire: (id) => `/admin/subscriptions/${id}/expire`,
		cancel: (id) => `/admin/subscriptions/${id}/cancel`,
		history: (id) => `/admin/subscriptions/${id}/history`
	},
	bills: {
		list: "/admin/bills",
		detail: (id) => `/admin/bills/${id}`,
		restore: (id) => `/admin/bills/${id}/restore`,
		download: (id) => `/admin/bills/${id}/download`
	},
	payments: {
		list: "/admin/payments",
		refund: (id) => `/admin/payments/${id}/refund`
	},
	support: {
		list: "/admin/tickets",
		detail: (id) => `/admin/tickets/${id}`,
		reply: (id) => `/admin/tickets/${id}/reply`
	},
	notifications: {
		list: "/admin/notifications",
		send: "/admin/notifications/send"
	},
	analytics: {
		overview: "/admin/analytics",
		export: "/admin/analytics/export"
	},
	admins: {
		list: "/admin/admins",
		detail: (id) => `/admin/admins/${id}`
	},
	roles: { list: "/admin/roles" },
	permissions: { list: "/admin/permissions" },
	activityLogs: { list: "/admin/activity-logs" },
	auditLogs: { list: "/admin/audit-logs" },
	settings: {
		get: "/admin/settings",
		update: "/admin/settings"
	}
};
//#endregion
export { ENDPOINTS as t };
