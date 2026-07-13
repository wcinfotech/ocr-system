import { t as apiClient } from "./client-DaqzDLTU.mjs";
import { t as ENDPOINTS } from "./endpoints-CxMhKP9P.mjs";
import { n as zt } from "../_libs/react-hot-toast.mjs";
import { n as toQuery, t as queryKeys } from "./queryKeys-BebIyJSY.mjs";
import { o as keepPreviousData } from "../_libs/tanstack__query-core.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useLogs-BDCnmhLQ.js
var logsService = {
	listActivityLogs: async (params) => {
		const { data } = await apiClient.get(ENDPOINTS.activityLogs.list, { params: toQuery(params) });
		return data;
	},
	listAuditLogs: async (params) => {
		const { data } = await apiClient.get(ENDPOINTS.auditLogs.list, { params: toQuery(params) });
		return data;
	},
	getSettings: async () => {
		const { data } = await apiClient.get(ENDPOINTS.settings.get);
		return data;
	},
	updateSettings: async (settings) => {
		const { data } = await apiClient.put(ENDPOINTS.settings.update, settings);
		return data;
	}
};
var useActivityLogs = (params) => useQuery({
	queryKey: queryKeys.activityLogs.list(params),
	queryFn: () => logsService.listActivityLogs(params),
	placeholderData: keepPreviousData
});
var useAuditLogs = (params) => useQuery({
	queryKey: queryKeys.auditLogs.list(params),
	queryFn: () => logsService.listAuditLogs(params),
	placeholderData: keepPreviousData
});
var useSettings = () => useQuery({
	queryKey: queryKeys.settings.all,
	queryFn: () => logsService.getSettings()
});
var useUpdateSettings = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (settings) => logsService.updateSettings(settings),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.settings.all });
			zt.success("System settings updated successfully");
		},
		onError: () => {
			zt.error("Failed to update system settings");
		}
	});
};
//#endregion
export { useUpdateSettings as i, useAuditLogs as n, useSettings as r, useActivityLogs as t };
