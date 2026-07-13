import { o as __toESM } from "./_runtime.mjs";
import { L as CodeOutlined_default, R as RotateLeft_default, en as require_jsx_runtime, ot as Search_default, z as Refresh_default } from "./_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "./_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { F as DialogContent, H as Button, I as DialogActions, J as Typography, L as Dialog, N as DialogTitle, Q as Paper, U as Box, X as IconButton, _ as MenuItem, f as Switch, g as Select, m as Tooltip, t as TextField } from "./_libs/@mui/material+[...].mjs";
import { a as formatDateTime } from "./_ssr/format-CPIzLQoT.mjs";
import { t as DataTable } from "./_ssr/DataTable-CUY1bpUh.mjs";
import { t as useListParams } from "./_ssr/useListParams-DZ-LPTQa.mjs";
import { i as useUpdateSettings, r as useSettings, t as useActivityLogs } from "./_ssr/useLogs-BDCnmhLQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.activity-logs-BSUmJI7U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ActivityLogsPage() {
	const lp = useListParams({
		sortBy: "timestamp",
		sortDir: "desc",
		pageSize: 20
	});
	const [searchText, setSearchText] = (0, import_react.useState)(lp.search || "");
	const [methodFilter, setMethodFilter] = (0, import_react.useState)(lp.filters?.method || "All methods");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)(lp.filters?.statusCode || "Status code");
	const [dateFilter, setDateFilter] = (0, import_react.useState)(lp.filters?.date || "");
	const { data, isLoading, isError, refetch, isFetching } = useActivityLogs(lp.params);
	const { data: settings, isLoading: settingsLoading } = useSettings();
	const updateSettings = useUpdateSettings();
	const [selectedPayloadLog, setSelectedPayloadLog] = (0, import_react.useState)(null);
	const rows = data?.data ?? [];
	const totalLogs = data?.total ?? 0;
	const totalPages = Math.ceil(totalLogs / lp.pageSize) || 1;
	const currentPageStr = `${lp.page + 1} / ${totalPages}`;
	const pageSizeStr = `${lp.pageSize}`;
	const avgResponseStr = `${data?.avgResponseTime ?? 0} ms`;
	const capturedRowsOnPage = rows.filter((l) => l.requestBody || l.responseBody).length;
	const handleRetentionToggle = (e) => {
		if (!settings) return;
		updateSettings.mutate({
			...settings,
			activityLogRetention: e.target.checked
		});
	};
	const handlePayloadToggle = (e) => {
		if (!settings) return;
		updateSettings.mutate({
			...settings,
			activityLogSavePayload: e.target.checked
		});
	};
	const handleApplyFilters = () => {
		lp.setSearch(searchText);
		lp.setFilter("method", methodFilter !== "All methods" ? methodFilter : "");
		lp.setFilter("statusCode", statusFilter !== "Status code" ? statusFilter : "");
		lp.setFilter("date", dateFilter);
	};
	const handleResetFilters = () => {
		setSearchText("");
		setMethodFilter("All methods");
		setStatusFilter("Status code");
		setDateFilter("");
		lp.setSearch("");
		lp.setFilter("method", "");
		lp.setFilter("statusCode", "");
		lp.setFilter("date", "");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
		sx: { p: 1 },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
				sx: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 3
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
					sx: {
						display: "flex",
						alignItems: "center",
						gap: 1.5
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { sx: {
						width: 4,
						height: 28,
						bgcolor: "#8b5cf6",
						borderRadius: 1
					} }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "h5",
						sx: {
							fontWeight: 750,
							color: "text.primary",
							fontSize: "1.5rem"
						},
						children: "API Logs"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					variant: "body2",
					color: "text.secondary",
					sx: {
						mt: .5,
						fontSize: "0.85rem"
					},
					children: "All API request logs from backend, with filters, response capture toggle, and request/response inspector"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outlined",
					startIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Refresh_default, {}),
					onClick: () => refetch(),
					sx: {
						color: "text.primary",
						borderColor: "grey.300",
						textTransform: "none",
						fontWeight: 500,
						px: 2,
						"&:hover": {
							borderColor: "grey.400",
							bgcolor: "grey.50"
						}
					},
					children: "Refresh"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
				sx: {
					display: "grid",
					gridTemplateColumns: {
						xs: "1fr",
						sm: "1fr 1fr",
						md: "1fr 1fr 1fr 1fr"
					},
					gap: 2.5,
					mb: 4
				},
				children: [
					{
						label: "Total Logs",
						value: totalLogs.toLocaleString()
					},
					{
						label: "Current Page",
						value: currentPageStr
					},
					{
						label: "Page Size",
						value: pageSizeStr
					},
					{
						label: "Avg Response",
						value: avgResponseStr
					}
				].map((card, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Paper, {
					elevation: 0,
					sx: {
						p: 2.5,
						borderRadius: 3,
						border: "1px solid",
						borderColor: "grey.100",
						bgcolor: "#fafafa",
						"&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "caption",
						sx: {
							color: "text.secondary",
							fontWeight: 550
						},
						children: card.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "h4",
						sx: {
							fontWeight: 800,
							mt: 1,
							color: "text.primary",
							fontSize: "1.8rem"
						},
						children: card.value
					})]
				}, idx))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Paper, {
				elevation: 0,
				sx: {
					p: 2.5,
					borderRadius: 3,
					border: "1px solid",
					borderColor: "grey.100",
					bgcolor: "background.paper",
					mb: 3
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
					sx: {
						display: "flex",
						gap: 1.5,
						flexWrap: "wrap",
						alignItems: "center",
						mb: 2
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							size: "small",
							placeholder: "Search path, method, IP, user-agent",
							value: searchText,
							onChange: (e) => setSearchText(e.target.value),
							sx: {
								flexGrow: 1,
								minWidth: 260
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							size: "small",
							value: methodFilter,
							onChange: (e) => setMethodFilter(e.target.value),
							sx: { minWidth: 150 },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "All methods",
									children: "All methods"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "GET",
									children: "GET"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "POST",
									children: "POST"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "PUT",
									children: "PUT"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "DELETE",
									children: "DELETE"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "PATCH",
									children: "PATCH"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							size: "small",
							value: statusFilter,
							onChange: (e) => setStatusFilter(e.target.value),
							sx: { minWidth: 150 },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "Status code",
									children: "Status code"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "200",
									children: "200"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "201",
									children: "201"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "204",
									children: "204"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "400",
									children: "400"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "401",
									children: "401"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "403",
									children: "403"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "404",
									children: "404"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: "500",
									children: "500"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							size: "small",
							type: "date",
							value: dateFilter,
							onChange: (e) => setDateFilter(e.target.value),
							sx: { minWidth: 150 }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "contained",
							onClick: handleApplyFilters,
							startIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search_default, {}),
							sx: {
								bgcolor: "#7c4dff",
								color: "#fff",
								textTransform: "none",
								fontWeight: 600,
								"&:hover": { bgcolor: "#651fff" }
							},
							children: "Apply Filters"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outlined",
							onClick: handleResetFilters,
							startIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateLeft_default, {}),
							sx: {
								color: "text.primary",
								borderColor: "grey.300",
								textTransform: "none",
								fontWeight: 500,
								"&:hover": {
									borderColor: "grey.400",
									bgcolor: "grey.50"
								}
							},
							children: "Reset"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							size: "small",
							value: lp.pageSize,
							onChange: (e) => lp.setPageSize(Number(e.target.value)),
							sx: {
								minWidth: 110,
								ml: "auto"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: 10,
									children: "10 / page"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: 20,
									children: "20 / page"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: 50,
									children: "50 / page"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: 100,
									children: "100 / page"
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
					sx: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						pt: 2,
						borderTop: "1px dashed",
						borderColor: "grey.200",
						flexWrap: "wrap",
						gap: 2
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
						sx: {
							display: "flex",
							gap: 4,
							flexWrap: "wrap",
							alignItems: "center"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
							sx: {
								display: "flex",
								alignItems: "flex-start",
								gap: 1.5
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: settings?.activityLogSavePayload ?? false,
								onChange: handlePayloadToggle,
								disabled: settingsLoading || updateSettings.isPending,
								size: "small",
								color: "primary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "body2",
								sx: {
									fontWeight: 600,
									color: "text.primary"
								},
								children: "Capture responses"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "caption",
								color: "text.secondary",
								children: "Only request metadata/body is saved. View icon appears only for rows with stored response."
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
							sx: {
								display: "flex",
								alignItems: "flex-start",
								gap: 1.5
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: settings?.activityLogRetention ?? false,
								onChange: handleRetentionToggle,
								disabled: settingsLoading || updateSettings.isPending,
								size: "small",
								color: "primary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "body2",
								sx: {
									fontWeight: 600,
									color: "text.primary"
								},
								children: "7-Day Retention"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "caption",
								color: "text.secondary",
								children: "Automatically delete logs older than 7 days from the system."
							})] })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
						sx: {
							bgcolor: "grey.50",
							border: "1px solid",
							borderColor: "grey.200",
							borderRadius: 2,
							px: 1.5,
							py: .5
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
							variant: "caption",
							sx: {
								fontWeight: 600,
								color: "text.secondary"
							},
							children: ["Captured rows on page: ", capturedRowsOnPage]
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				columns: [
					{
						key: "timestamp",
						label: "TIME",
						sortable: true,
						render: (l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "body2",
							color: "text.secondary",
							children: formatDateTime(l.timestamp)
						})
					},
					{
						key: "method",
						label: "METHOD",
						render: (l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
							sx: {
								bgcolor: "grey.100",
								color: "text.primary",
								px: 1.5,
								py: .5,
								borderRadius: 1.5,
								display: "inline-block",
								fontFamily: "monospace",
								fontWeight: 700,
								fontSize: "0.75rem"
							},
							children: l.method || "GET"
						})
					},
					{
						key: "url",
						label: "ENDPOINT",
						render: (l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "body2",
							sx: {
								fontFamily: "monospace",
								color: "text.primary",
								fontWeight: 500,
								wordBreak: "break-all"
							},
							children: l.url || l.action || "—"
						})
					},
					{
						key: "statusCode",
						label: "STATUS",
						render: (l) => {
							const code = l.statusCode || 200;
							let bgColor = "#5c6bc0";
							if (code >= 400) bgColor = "#ef5350";
							else if (code >= 300) bgColor = "#ff9800";
							else if (code >= 201 && code < 300) bgColor = "#4caf50";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
								sx: {
									bgcolor: bgColor,
									color: "#fff",
									px: 1.5,
									py: .5,
									borderRadius: 3,
									display: "inline-block",
									fontWeight: 700,
									fontSize: "0.75rem",
									textAlign: "center",
									minWidth: 40
								},
								children: code
							});
						}
					},
					{
						key: "adminName",
						label: "ACTOR",
						render: (l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "body2",
							sx: { fontWeight: 600 },
							children: l.adminName || "Guest"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "caption",
							color: "text.secondary",
							sx: { fontFamily: "monospace" },
							children: l.ip || "127.0.0.1"
						})] })
					},
					{
						key: "responseTime",
						label: "RESPONSE TIME",
						render: (l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "body2",
							sx: {
								fontWeight: 500,
								color: "text.secondary"
							},
							children: l.responseTime !== void 0 ? `${l.responseTime} ms` : "—"
						})
					},
					{
						key: "payload",
						label: "",
						align: "center",
						render: (l) => {
							if (!(!!l.requestBody || !!l.responseBody)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "caption",
								color: "text.disabled",
								children: "—"
							});
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								title: "View Request/Response Payloads",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									size: "small",
									color: "primary",
									onClick: () => setSelectedPayloadLog(l),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeOutlined_default, {
										fontSize: "small",
										sx: { color: "#7c4dff" }
									})
								})
							});
						}
					}
				],
				rows,
				rowKey: (l) => l.id,
				total: totalLogs,
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
				emptyTitle: "No activity logs found",
				emptyDescription: "Try adjusting your search or filters."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!selectedPayloadLog,
				onClose: () => setSelectedPayloadLog(null),
				maxWidth: "md",
				fullWidth: true,
				children: selectedPayloadLog && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						sx: { pb: 1 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "h6",
							component: "span",
							sx: { fontWeight: 600 },
							children: "API Payload Details"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
							variant: "body2",
							color: "text.secondary",
							sx: { mt: .5 },
							children: [
								selectedPayloadLog.method,
								" ",
								selectedPayloadLog.url,
								" (",
								selectedPayloadLog.statusCode ?? 200,
								")"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
						dividers: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
							sx: {
								display: "grid",
								gridTemplateColumns: {
									xs: "1fr",
									md: "1fr 1fr"
								},
								gap: 2.5
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "subtitle2",
								sx: {
									mb: 1,
									fontWeight: 600,
									color: "text.primary"
								},
								children: "Request Body"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paper, {
								variant: "outlined",
								sx: {
									p: 2,
									bgcolor: "grey.50",
									maxHeight: 400,
									overflowY: "auto",
									fontFamily: "monospace",
									fontSize: "0.8rem",
									whiteSpace: "pre-wrap",
									wordBreak: "break-all"
								},
								children: selectedPayloadLog.requestBody ? JSON.stringify(selectedPayloadLog.requestBody, null, 2) : "No request body payload"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "subtitle2",
								sx: {
									mb: 1,
									fontWeight: 600,
									color: "text.primary"
								},
								children: "Response Body"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paper, {
								variant: "outlined",
								sx: {
									p: 2,
									bgcolor: "grey.50",
									maxHeight: 400,
									overflowY: "auto",
									fontFamily: "monospace",
									fontSize: "0.8rem",
									whiteSpace: "pre-wrap",
									wordBreak: "break-all"
								},
								children: selectedPayloadLog.responseBody ? JSON.stringify(selectedPayloadLog.responseBody, null, 2) : "No response body payload"
							})] })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogActions, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setSelectedPayloadLog(null),
						children: "Close"
					}) })
				] })
			})
		]
	});
}
//#endregion
export { ActivityLogsPage as component };
