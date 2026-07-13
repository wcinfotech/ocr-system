//#region node_modules/.nitro/vite/services/ssr/assets/queryKeys-BebIyJSY.js
/** Convert ListParams into a flat query object for Axios. */
var toQuery = (params) => {
	const q = {
		page: params.page,
		pageSize: params.pageSize
	};
	if (params.search) q.search = params.search;
	if (params.sortBy) q.sortBy = params.sortBy;
	if (params.sortDir) q.sortDir = params.sortDir;
	if (params.filters) {
		for (const [k, v] of Object.entries(params.filters)) if (v !== void 0 && v !== "" && v !== "all") q[k] = String(v);
	}
	return q;
};
var queryKeys = {
	dashboard: {
		stats: ["dashboard", "stats"],
		charts: ["dashboard", "charts"],
		recentUsers: ["dashboard", "recent-users"],
		recentBills: ["dashboard", "recent-bills"]
	},
	users: {
		all: ["users"],
		list: (p) => [
			"users",
			"list",
			p
		],
		detail: (id) => [
			"users",
			"detail",
			id
		]
	},
	plans: {
		all: ["plans"],
		list: (p) => [
			"plans",
			"list",
			p
		]
	},
	subscriptions: {
		all: ["subscriptions"],
		list: (p) => [
			"subscriptions",
			"list",
			p
		]
	},
	bills: {
		all: ["bills"],
		list: (p) => [
			"bills",
			"list",
			p
		]
	},
	tickets: {
		all: ["tickets"],
		list: (p) => [
			"tickets",
			"list",
			p
		],
		detail: (id) => [
			"tickets",
			"detail",
			id
		]
	},
	admins: {
		all: ["admins"],
		list: (p) => [
			"admins",
			"list",
			p
		],
		detail: (id) => [
			"admins",
			"detail",
			id
		]
	},
	roles: { all: ["roles"] },
	permissions: { all: ["permissions"] },
	activityLogs: { list: (p) => [
		"activityLogs",
		"list",
		p
	] },
	auditLogs: { list: (p) => [
		"auditLogs",
		"list",
		p
	] },
	settings: { all: ["settings"] }
};
//#endregion
export { toQuery as n, queryKeys as t };
