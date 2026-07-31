import { o as __toESM } from "./_runtime.mjs";
import { A as RestoreOutlined_default, N as FileDownloadOutlined_default, P as DeleteOutlined_default, en as require_jsx_runtime } from "./_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "./_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { J as Typography, U as Box, X as IconButton, m as Tooltip, p as Stack } from "./_libs/@mui/material+[...].mjs";
import { i as formatDate, r as formatCurrency, s as formatPercent } from "./_ssr/format-CPIzLQoT.mjs";
import { t as ConfirmDialog } from "./_ssr/ConfirmDialog-BpC-lVsT.mjs";
import { n as PERMISSIONS } from "./_ssr/AuthContext-Bj2jbtLU.mjs";
import { t as DataTable } from "./_ssr/DataTable-CUY1bpUh.mjs";
import { t as useListParams } from "./_ssr/useListParams-DZ-LPTQa.mjs";
import { t as PageHeader } from "./_ssr/PageHeader-9ov710wi.mjs";
import { n as SearchInput, r as StatusChip, t as FilterSelect } from "./_ssr/Filters-DJMF8a9f.mjs";
import { t as PermissionGate } from "./_ssr/PermissionGate-CfxL_kdH.mjs";
import { o as useRestoreBill, r as useDeleteBill, t as useBills } from "./_ssr/useCatalog-B0M2MMjf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.bills-CgDXJvFl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BillsPage() {
	const lp = useListParams({
		sortBy: "createdAt",
		sortDir: "desc"
	});
	const { data, isLoading, isFetching, isError, refetch } = useBills(lp.params);
	const remove = useDeleteBill();
	const restore = useRestoreBill();
	const [toDelete, setToDelete] = (0, import_react.useState)(null);
	const rows = data?.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Bills",
			subtitle: "All uploaded bills, OCR results and processing status."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			columns: [
				{
					key: "fileName",
					label: "Bill",
					sortable: true,
					render: (b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "body2",
						sx: { fontWeight: 600 },
						noWrap: true,
						children: b.fileName
					})
				},
				{
					key: "userName",
					label: "User"
				},
				{
					key: "amount",
					label: "Amount",
					align: "right",
					render: (b) => b.amount ? formatCurrency(b.amount, b.currency) : "—"
				},
				{
					key: "ocrConfidence",
					label: "OCR",
					align: "right",
					render: (b) => b.ocrConfidence != null ? formatPercent(b.ocrConfidence) : "—"
				},
				{
					key: "status",
					label: "Status",
					render: (b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status: b.status })
				},
				{
					key: "createdAt",
					label: "Uploaded",
					sortable: true,
					render: (b) => formatDate(b.createdAt)
				},
				{
					key: "actions",
					label: "",
					align: "right",
					render: (b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
						direction: "row",
						spacing: .5,
						sx: { justifyContent: "flex-end" },
						children: [b.fileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							title: "Download",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
								size: "small",
								component: "a",
								href: b.fileUrl,
								target: "_blank",
								rel: "noopener",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDownloadOutlined_default, { fontSize: "small" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionGate, {
							permission: PERMISSIONS.BILLS_MANAGE,
							children: b.status === "deleted" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								title: "Restore",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									size: "small",
									color: "success",
									onClick: () => restore.mutate(b.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestoreOutlined_default, { fontSize: "small" })
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								title: "Delete",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									size: "small",
									color: "error",
									onClick: () => setToDelete(b),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteOutlined_default, { fontSize: "small" })
								})
							})
						})]
					})
				}
			],
			rows,
			rowKey: (b) => b.id,
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
			emptyTitle: "No bills found",
			emptyDescription: "Uploaded bills will appear here.",
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
					placeholder: "Search bills…"
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
							label: "Processing",
							value: "processing"
						},
						{
							label: "Processed",
							value: "processed"
						},
						{
							label: "Failed",
							value: "failed"
						},
						{
							label: "Deleted",
							value: "deleted"
						}
					]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
			open: !!toDelete,
			title: "Delete bill?",
			description: `Delete "${toDelete?.fileName}"? You can restore it later.`,
			confirmLabel: "Delete",
			destructive: true,
			loading: remove.isPending,
			onClose: () => setToDelete(null),
			onConfirm: () => {
				if (toDelete) remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
			}
		})
	] });
}
//#endregion
export { BillsPage as component };
