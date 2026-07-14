import { r as isApiError, t as apiClient } from "./client-oeguNz2X.mjs";
import { t as ENDPOINTS } from "./endpoints-CxMhKP9P.mjs";
import { n as zt } from "../_libs/react-hot-toast.mjs";
import { n as toQuery, t as queryKeys } from "./queryKeys-BebIyJSY.mjs";
import { o as keepPreviousData } from "../_libs/tanstack__query-core.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useAdmins-FqfJiGDk.js
var adminsService = {
	list: async (params) => {
		const { data } = await apiClient.get(ENDPOINTS.admins.list, { params: toQuery(params) });
		return data;
	},
	create: async (payload) => {
		const { data } = await apiClient.post(ENDPOINTS.admins.list, payload);
		return data;
	},
	update: async (id, payload) => {
		const { data } = await apiClient.patch(ENDPOINTS.admins.detail(id), payload);
		return data;
	},
	remove: async (id) => {
		await apiClient.delete(ENDPOINTS.admins.detail(id));
	},
	listRoles: async () => {
		const { data } = await apiClient.get(ENDPOINTS.roles.list);
		return data.data;
	},
	listPermissions: async () => {
		const { data } = await apiClient.get(ENDPOINTS.permissions.list);
		return data.data;
	}
};
var errMsg = (e, fallback) => isApiError(e) ? e.message : fallback;
var useAdmins = (params) => useQuery({
	queryKey: queryKeys.admins.list(params),
	queryFn: () => adminsService.list(params),
	placeholderData: keepPreviousData
});
var useCreateAdmin = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload) => adminsService.create(payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.admins.all });
			zt.success("Admin account created successfully");
		},
		onError: (e) => zt.error(errMsg(e, "Failed to create admin"))
	});
};
var useUpdateAdmin = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => adminsService.update(id, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.admins.all });
			zt.success("Admin account updated successfully");
		},
		onError: (e) => zt.error(errMsg(e, "Failed to update admin"))
	});
};
var useDeleteAdmin = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => adminsService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.admins.all });
			zt.success("Admin account deleted");
		},
		onError: (e) => zt.error(errMsg(e, "Failed to delete admin"))
	});
};
var useRoles = () => useQuery({
	queryKey: queryKeys.roles.all,
	queryFn: () => adminsService.listRoles()
});
var usePermissions = () => useQuery({
	queryKey: queryKeys.permissions.all,
	queryFn: () => adminsService.listPermissions()
});
//#endregion
export { useRoles as a, usePermissions as i, useCreateAdmin as n, useUpdateAdmin as o, useDeleteAdmin as r, useAdmins as t };
