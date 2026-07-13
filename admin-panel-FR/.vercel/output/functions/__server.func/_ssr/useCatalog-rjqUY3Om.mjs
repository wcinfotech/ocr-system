import { r as isApiError, t as apiClient } from "./client-DaqzDLTU.mjs";
import { t as ENDPOINTS } from "./endpoints-CxMhKP9P.mjs";
import { n as zt } from "../_libs/react-hot-toast.mjs";
import { n as toQuery, t as queryKeys } from "./queryKeys-BebIyJSY.mjs";
import { o as keepPreviousData } from "../_libs/tanstack__query-core.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useCatalog-rjqUY3Om.js
var plansService = {
	list: async (params) => {
		const { data } = await apiClient.get(ENDPOINTS.plans.list, { params: toQuery(params) });
		return data;
	},
	create: async (payload) => {
		const { data } = await apiClient.post(ENDPOINTS.plans.list, payload);
		return data;
	},
	update: async (id, payload) => {
		const { data } = await apiClient.put(ENDPOINTS.plans.detail(id), payload);
		return data;
	},
	remove: async (id) => {
		await apiClient.delete(ENDPOINTS.plans.detail(id));
	}
};
var subscriptionsService = {
	list: async (params) => {
		const { data } = await apiClient.get(ENDPOINTS.subscriptions.list, { params: toQuery(params) });
		return data;
	},
	assign: async (payload) => {
		const { data } = await apiClient.post(ENDPOINTS.subscriptions.assign, payload);
		return data;
	},
	renew: async (id) => {
		await apiClient.post(ENDPOINTS.subscriptions.renew(id));
	},
	expire: async (id) => {
		await apiClient.post(ENDPOINTS.subscriptions.expire(id));
	},
	cancel: async (id) => {
		await apiClient.post(ENDPOINTS.subscriptions.cancel(id));
	}
};
var billsService = {
	list: async (params) => {
		const { data } = await apiClient.get(ENDPOINTS.bills.list, { params: toQuery(params) });
		return data;
	},
	detail: async (id) => {
		const { data } = await apiClient.get(ENDPOINTS.bills.detail(id));
		return data;
	},
	remove: async (id) => {
		await apiClient.delete(ENDPOINTS.bills.detail(id));
	},
	restore: async (id) => {
		await apiClient.post(ENDPOINTS.bills.restore(id));
	}
};
var errMsg = (e, fallback) => isApiError(e) ? e.message : fallback;
var usePlans = (params) => useQuery({
	queryKey: queryKeys.plans.list(params),
	queryFn: () => plansService.list(params),
	placeholderData: keepPreviousData
});
var useCreatePlan = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload) => plansService.create(payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.plans.all });
			zt.success("Plan created");
		},
		onError: (e) => zt.error(errMsg(e, "Failed to create plan"))
	});
};
var useUpdatePlan = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => plansService.update(id, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.plans.all });
			zt.success("Plan updated");
		},
		onError: (e) => zt.error(errMsg(e, "Failed to update plan"))
	});
};
var useDeletePlan = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => plansService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.plans.all });
			zt.success("Plan deleted");
		},
		onError: (e) => zt.error(errMsg(e, "Failed to delete plan"))
	});
};
var useSubscriptions = (params) => useQuery({
	queryKey: queryKeys.subscriptions.list(params),
	queryFn: () => subscriptionsService.list(params),
	placeholderData: keepPreviousData
});
var useSubscriptionAction = () => {
	const qc = useQueryClient();
	const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
	return {
		renew: useMutation({
			mutationFn: (id) => subscriptionsService.renew(id),
			onSuccess: () => {
				invalidate();
				zt.success("Subscription renewed");
			},
			onError: (e) => zt.error(errMsg(e, "Failed to renew"))
		}),
		expire: useMutation({
			mutationFn: (id) => subscriptionsService.expire(id),
			onSuccess: () => {
				invalidate();
				zt.success("Subscription expired");
			},
			onError: (e) => zt.error(errMsg(e, "Failed to expire"))
		}),
		cancel: useMutation({
			mutationFn: (id) => subscriptionsService.cancel(id),
			onSuccess: () => {
				invalidate();
				zt.success("Subscription canceled");
			},
			onError: (e) => zt.error(errMsg(e, "Failed to cancel"))
		})
	};
};
var useBills = (params) => useQuery({
	queryKey: queryKeys.bills.list(params),
	queryFn: () => billsService.list(params),
	placeholderData: keepPreviousData
});
var useDeleteBill = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => billsService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.bills.all });
			zt.success("Bill deleted");
		},
		onError: (e) => zt.error(errMsg(e, "Failed to delete bill"))
	});
};
var useRestoreBill = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => billsService.restore(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.bills.all });
			zt.success("Bill restored");
		},
		onError: (e) => zt.error(errMsg(e, "Failed to restore bill"))
	});
};
//#endregion
export { usePlans as a, useSubscriptions as c, useDeletePlan as i, useUpdatePlan as l, useCreatePlan as n, useRestoreBill as o, useDeleteBill as r, useSubscriptionAction as s, useBills as t };
