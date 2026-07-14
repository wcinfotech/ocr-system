import { o as __toESM } from "./_runtime.mjs";
import { M as VisibilityOutlined_default, N as FileDownloadOutlined_default, en as require_jsx_runtime, j as ArrowForwardOutlined_default } from "./_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "./_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { F as DialogContent, G as Avatar, H as Button, I as DialogActions, J as Typography, K as Chip, L as Dialog, N as DialogTitle, Q as Paper, U as Box, X as IconButton, c as TableCell, i as TableRow, l as TableBody, m as Tooltip, o as TableHead, s as TableContainer, u as Table } from "./_libs/@mui/material+[...].mjs";
import { a as formatDateTime, c as initialsOf, t as downloadCsv } from "./_ssr/format-CPIzLQoT.mjs";
import { t as DataTable } from "./_ssr/DataTable-CUY1bpUh.mjs";
import { t as useListParams } from "./_ssr/useListParams-DZ-LPTQa.mjs";
import { n as useAuditLogs } from "./_ssr/useLogs-BmClLmdR.mjs";
import { t as PageHeader } from "./_ssr/PageHeader-9ov710wi.mjs";
import { n as SearchInput } from "./_ssr/Filters-DJMF8a9f.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.audit-logs-BsDefD8k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuditLogsPage() {
	const lp = useListParams({
		sortBy: "timestamp",
		sortDir: "desc"
	});
	const { data, isLoading, isError, refetch, isFetching } = useAuditLogs(lp.params);
	const [selected, setSelected] = (0, import_react.useState)([]);
	const [detailLog, setDetailLog] = (0, import_react.useState)(null);
	const rows = data?.data ?? [];
	const columns = [
		{
			key: "timestamp",
			label: "Timestamp",
			sortable: true,
			render: (l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "body2",
				color: "text.secondary",
				children: formatDateTime(l.timestamp)
			})
		},
		{
			key: "adminName",
			label: "Changed By",
			sortable: true,
			render: (l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
				sx: {
					display: "flex",
					alignItems: "center",
					gap: 1.25
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					sx: {
						width: 28,
						height: 28,
						bgcolor: "primary.main",
						fontSize: "0.75rem",
						fontWeight: 600
					},
					children: initialsOf(l.adminName)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					variant: "body2",
					sx: { fontWeight: 500 },
					children: l.adminName
				})]
			})
		},
		{
			key: "module",
			label: "Module",
			sortable: true,
			render: (l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
				label: l.module,
				size: "small",
				variant: "outlined",
				color: "primary",
				sx: { fontWeight: 550 }
			})
		},
		{
			key: "action",
			label: "Action",
			sortable: true,
			render: (l) => {
				let color = "text.primary";
				if (l.action.startsWith("Delete")) color = "error.main";
				else if (l.action.startsWith("Create") || l.action.startsWith("Assign")) color = "success.main";
				else if (l.action.startsWith("Update") || l.action.startsWith("Modify")) color = "info.main";
				else if (l.action.startsWith("Suspend")) color = "warning.main";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					variant: "body2",
					sx: {
						fontWeight: 600,
						color
					},
					children: l.action
				});
			}
		},
		{
			key: "details",
			label: "Details",
			render: (l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "body2",
				sx: { wordBreak: "break-all" },
				children: l.details
			})
		},
		{
			key: "changes",
			label: "Changes",
			align: "center",
			render: (l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
				title: "View value differences",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
					size: "small",
					color: "primary",
					onClick: () => setDetailLog(l),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisibilityOutlined_default, { fontSize: "small" })
				})
			})
		}
	];
	const getChangedKeys = (log) => {
		const oldVals = log.oldValues || {};
		const newVals = log.newValues || {};
		return Array.from(/* @__PURE__ */ new Set([...Object.keys(oldVals), ...Object.keys(newVals)])).filter((key) => {
			if (key === "_id" || key === "__v" || key === "updatedAt" || key === "createdAt") return false;
			return (typeof oldVals[key] === "object" ? JSON.stringify(oldVals[key]) : String(oldVals[key] ?? "")) !== (typeof newVals[key] === "object" ? JSON.stringify(newVals[key]) : String(newVals[key] ?? ""));
		});
	};
	const renderValue = (val) => {
		if (val === null || val === void 0) return "—";
		if (typeof val === "boolean") return val ? "True" : "False";
		if (Array.isArray(val)) return val.join(", ");
		if (typeof val === "object") return JSON.stringify(val);
		return String(val);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Audit Logs",
			subtitle: "Old vs new values, changed by, module and action.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outlined",
				startIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDownloadOutlined_default, {}),
				disabled: !rows.length,
				onClick: () => downloadCsv(rows, "audit-logs.csv", [
					{
						key: "timestamp",
						label: "Timestamp"
					},
					{
						key: "adminName",
						label: "Changed By"
					},
					{
						key: "module",
						label: "Module"
					},
					{
						key: "action",
						label: "Action"
					},
					{
						key: "details",
						label: "Details"
					}
				]),
				children: "Export CSV"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			columns,
			rows,
			rowKey: (l) => l.id,
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
			selectable: true,
			selected,
			onSelectedChange: setSelected,
			emptyTitle: "No audit logs found",
			emptyDescription: "Try adjusting your search or filters.",
			toolbar: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
				sx: {
					display: "flex",
					gap: 1.5,
					flexWrap: "wrap",
					alignItems: "center"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
						value: lp.search,
						onChange: lp.setSearch,
						placeholder: "Search audit logs..."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { sx: { flex: 1 } }),
					selected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
						variant: "body2",
						color: "text.secondary",
						children: [selected.length, " selected"]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: !!detailLog,
			onClose: () => setDetailLog(null),
			maxWidth: "md",
			fullWidth: true,
			children: detailLog && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					sx: { pb: 1 },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
						sx: {
							display: "flex",
							flexDirection: "row",
							gap: 1,
							alignItems: "center"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "h6",
								component: "span",
								sx: { fontWeight: 600 },
								children: "Audit Details"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								label: detailLog.module,
								size: "small",
								color: "primary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								label: detailLog.action,
								size: "small",
								variant: "outlined"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					dividers: true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
							sx: {
								display: "grid",
								gridTemplateColumns: {
									xs: "1fr",
									sm: "1fr 1fr"
								},
								gap: 2.5,
								mb: 3
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
									variant: "caption",
									color: "text.secondary",
									sx: { display: "block" },
									children: "Changed By"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
									variant: "body2",
									sx: { fontWeight: 500 },
									children: detailLog.adminName
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
									variant: "caption",
									color: "text.secondary",
									sx: { display: "block" },
									children: "Timestamp"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
									variant: "body2",
									children: formatDateTime(detailLog.timestamp)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
									sx: { gridColumn: { sm: "span 2" } },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
										variant: "caption",
										color: "text.secondary",
										sx: { display: "block" },
										children: "Action Details"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
										variant: "body2",
										children: detailLog.details
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "subtitle2",
							sx: {
								mb: 1.5,
								fontWeight: 600
							},
							children: "Value Differences"
						}),
						getChangedKeys(detailLog).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paper, {
							variant: "outlined",
							sx: {
								p: 2,
								textAlign: "center",
								bgcolor: "action.hover"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "body2",
								color: "text.secondary",
								children: "No field changes recorded or initial object creation."
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableContainer, {
							component: Paper,
							variant: "outlined",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, {
								size: "small",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									sx: { bgcolor: "action.hover" },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											sx: { fontWeight: 600 },
											children: "Field"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											sx: { fontWeight: 600 },
											children: "Old Value"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { sx: { width: 40 } }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											sx: { fontWeight: 600 },
											children: "New Value"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: getChangedKeys(detailLog).map((key) => {
									const oldVal = detailLog.oldValues?.[key];
									const newVal = detailLog.newValues?.[key];
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											sx: {
												fontFamily: "monospace",
												fontWeight: 600
											},
											children: key
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											sx: {
												bgcolor: "error.light",
												color: "error.contrastText",
												opacity: .85
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
												variant: "body2",
												sx: {
													fontFamily: "monospace",
													textDecoration: "line-through"
												},
												children: renderValue(oldVal)
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											align: "center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowForwardOutlined_default, {
												fontSize: "small",
												color: "action"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											sx: {
												bgcolor: "success.light",
												color: "success.contrastText",
												opacity: .85
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
												variant: "body2",
												sx: {
													fontFamily: "monospace",
													fontWeight: 600
												},
												children: renderValue(newVal)
											})
										})
									] }, key);
								}) })]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogActions, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setDetailLog(null),
					children: "Close"
				}) })
			] })
		})
	] });
}
//#endregion
export { AuditLogsPage as component };
