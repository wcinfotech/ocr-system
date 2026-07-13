import { t as apiClient } from "./client-DaqzDLTU.mjs";
import { t as ENDPOINTS } from "./endpoints-CxMhKP9P.mjs";
import { n as toQuery } from "./queryKeys-BebIyJSY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard.service-BHIJqJmc.js
var dashboardService = {
	stats: async () => {
		const { data } = await apiClient.get(ENDPOINTS.dashboard.stats);
		return data;
	},
	charts: async () => {
		const { data } = await apiClient.get(ENDPOINTS.dashboard.charts);
		return data;
	},
	recentUsers: async (limit = 5) => {
		const { data } = await apiClient.get(ENDPOINTS.dashboard.recentUsers, { params: { limit } });
		return data;
	},
	recentBills: async (limit = 5) => {
		const { data } = await apiClient.get(ENDPOINTS.dashboard.recentBills, { params: { limit } });
		return data;
	}
};
var usersService = {
	list: async (params) => {
		const { data } = await apiClient.get(ENDPOINTS.users.list, { params: toQuery(params) });
		return data;
	},
	detail: async (id) => {
		const { data } = await apiClient.get(ENDPOINTS.users.detail(id));
		return data;
	},
	update: async (id, payload) => {
		const { data } = await apiClient.patch(ENDPOINTS.users.detail(id), payload);
		return data;
	},
	suspend: async (id) => {
		await apiClient.post(ENDPOINTS.users.suspend(id));
	},
	activate: async (id) => {
		await apiClient.post(ENDPOINTS.users.activate(id));
	},
	remove: async (id) => {
		await apiClient.delete(ENDPOINTS.users.detail(id));
	}
};
//#endregion
export { usersService as n, dashboardService as t };
