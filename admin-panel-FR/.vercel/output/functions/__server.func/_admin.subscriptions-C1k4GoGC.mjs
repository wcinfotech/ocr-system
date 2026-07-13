import { _ as EventBusyOutlined_default, c as CancelOutlined_default, en as require_jsx_runtime, tt as AutorenewOutlined_default } from "./_libs/@mui/icons-material+[...].mjs";
import { J as Typography, U as Box, X as IconButton, f as Switch, m as Tooltip, p as Stack } from "./_libs/@mui/material+[...].mjs";
import { i as formatDate } from "./_ssr/format-CPIzLQoT.mjs";
import { n as PERMISSIONS } from "./_ssr/AuthContext-87_GBZZr.mjs";
import { t as DataTable } from "./_ssr/DataTable-CUY1bpUh.mjs";
import { t as useListParams } from "./_ssr/useListParams-DZ-LPTQa.mjs";
import { t as PageHeader } from "./_ssr/PageHeader-9ov710wi.mjs";
import { n as SearchInput, r as StatusChip, t as FilterSelect } from "./_ssr/Filters-DJMF8a9f.mjs";
import { t as PermissionGate } from "./_ssr/PermissionGate-BICGWk7Q.mjs";
import { c as useSubscriptions, s as useSubscriptionAction } from "./_ssr/useCatalog-rjqUY3Om.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.subscriptions-C1k4GoGC.js
var import_jsx_runtime = require_jsx_runtime();
function SubscriptionsPage() {
	const lp = useListParams({
		sortBy: "endDate",
		sortDir: "asc"
	});
	const { data, isLoading, isFetching, isError, refetch } = useSubscriptions(lp.params);
	const { renew, expire, cancel } = useSubscriptionAction();
	const rows = data?.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Subscriptions",
		subtitle: "Track and manage user subscriptions."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
		columns: [
			{
				key: "userName",
				label: "User",
				sortable: true,
				render: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					variant: "body2",
					sx: { fontWeight: 600 },
					children: s.userName
				})
			},
			{
				key: "planName",
				label: "Plan"
			},
			{
				key: "status",
				label: "Status",
				render: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status: s.status })
			},
			{
				key: "startDate",
				label: "Start",
				sortable: true,
				render: (s) => formatDate(s.startDate)
			},
			{
				key: "endDate",
				label: "End",
				sortable: true,
				render: (s) => formatDate(s.endDate)
			},
			{
				key: "autoRenew",
				label: "Auto-renew",
				align: "center",
				render: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: s.autoRenew,
					size: "small",
					readOnly: true
				})
			},
			{
				key: "actions",
				label: "",
				align: "right",
				render: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionGate, {
					permission: PERMISSIONS.SUBSCRIPTIONS_MANAGE,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
						direction: "row",
						spacing: .5,
						sx: { justifyContent: "flex-end" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								title: "Renew",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									size: "small",
									color: "success",
									onClick: () => renew.mutate(s.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutorenewOutlined_default, { fontSize: "small" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								title: "Expire",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									size: "small",
									color: "warning",
									onClick: () => expire.mutate(s.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventBusyOutlined_default, { fontSize: "small" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								title: "Cancel",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									size: "small",
									color: "error",
									onClick: () => cancel.mutate(s.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CancelOutlined_default, { fontSize: "small" })
								})
							})
						]
					})
				})
			}
		],
		rows,
		rowKey: (s) => s.id,
		total: data?.total ?? 0,
		page: lp.page,
		pageSize: lp.pageSize,
		onPageChange: lp.setPage,
		onPageSizeChange: lp.setPageSize,
		sortBy: lp.sortBy,
		sortDir: lp.sortDir,
		onSortChange: lp.setSort,
		loading: isLoading || isFetching,
		error: isError,
		onRetry: refetch,
		emptyTitle: "No subscriptions",
		emptyDescription: "Subscriptions will appear here once users subscribe.",
		toolbar: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
			sx: {
				display: "flex",
				gap: 1.5,
				flexWrap: "wrap",
				alignItems: "center"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
				value: lp.search,
				onChange: lp.setSearch,
				placeholder: "Search subscriptions…"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
				label: "Status",
				value: lp.filters?.status ?? "all",
				onChange: (v) => lp.setFilter("status", v),
				options: [
					{
						label: "All",
						value: "all"
					},
					{
						label: "Active",
						value: "active"
					},
					{
						label: "Expired",
						value: "expired"
					},
					{
						label: "Canceled",
						value: "canceled"
					},
					{
						label: "Pending",
						value: "pending"
					}
				]
			})]
		})
	})] });
}
//#endregion
export { SubscriptionsPage as component };
