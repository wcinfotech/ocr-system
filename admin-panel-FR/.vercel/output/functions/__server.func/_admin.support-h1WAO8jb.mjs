import { o as __toESM } from "./_runtime.mjs";
import { M as VisibilityOutlined_default, N as FileDownloadOutlined_default, a as SendOutlined_default, en as require_jsx_runtime, i as DoneAllOutlined_default, o as Close_default, s as DoneOutlined_default } from "./_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "./_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { G as Avatar, H as Button, J as Typography, K as Chip, M as Divider, U as Box, X as IconButton, j as Drawer, m as Tooltip, p as Stack, t as TextField } from "./_libs/@mui/material+[...].mjs";
import { c as initialsOf, i as formatDate, t as downloadCsv } from "./_ssr/format-CPIzLQoT.mjs";
import { r as isApiError, t as apiClient } from "./_ssr/client-oeguNz2X.mjs";
import { t as ENDPOINTS } from "./_ssr/endpoints-CxMhKP9P.mjs";
import { n as PERMISSIONS } from "./_ssr/AuthContext-Bj2jbtLU.mjs";
import { n as zt } from "./_libs/react-hot-toast.mjs";
import { t as DataTable } from "./_ssr/DataTable-CUY1bpUh.mjs";
import { t as useListParams } from "./_ssr/useListParams-DZ-LPTQa.mjs";
import { n as toQuery, t as queryKeys } from "./_ssr/queryKeys-BebIyJSY.mjs";
import { o as keepPreviousData } from "./_libs/tanstack__query-core.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { t as PageHeader } from "./_ssr/PageHeader-9ov710wi.mjs";
import { n as SearchInput, r as StatusChip, t as FilterSelect } from "./_ssr/Filters-DJMF8a9f.mjs";
import { t as PermissionGate } from "./_ssr/PermissionGate-CfxL_kdH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.support-h1WAO8jb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var supportService = {
	list: async (params) => {
		const { data } = await apiClient.get(ENDPOINTS.support.list, { params: toQuery(params) });
		return data;
	},
	detail: async (id) => {
		const { data } = await apiClient.get(ENDPOINTS.support.detail(id));
		return data;
	},
	reply: async (id, payload) => {
		await apiClient.post(ENDPOINTS.support.reply(id), payload);
	}
};
var errMsg = (e, fallback) => isApiError(e) ? e.message : fallback;
var useTickets = (params) => useQuery({
	queryKey: queryKeys.tickets.list(params),
	queryFn: () => supportService.list(params),
	placeholderData: keepPreviousData
});
var useReplyTicket = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => supportService.reply(id, payload),
		onSuccess: (_, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.tickets.all });
			zt.success(variables.payload.close ? "Ticket updated and closed" : "Reply submitted");
		},
		onError: (e) => zt.error(errMsg(e, "Failed to reply to ticket"))
	});
};
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
		sx: {
			display: "flex",
			justifyContent: "space-between",
			gap: 2,
			py: 1
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
			variant: "body2",
			color: "text.secondary",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
			variant: "body2",
			sx: {
				fontWeight: 600,
				textAlign: "right"
			},
			children: value
		})]
	});
}
function TicketDetailsDrawer({ ticket, open, onClose }) {
	const [replyText, setReplyText] = (0, import_react.useState)("");
	const replyMutation = useReplyTicket();
	const handleReplySubmit = (close) => {
		if (!ticket || !replyText.trim()) return;
		replyMutation.mutate({
			id: ticket.id,
			payload: {
				reply: replyText,
				close
			}
		}, { onSuccess: () => {
			setReplyText("");
			onClose();
		} });
	};
	const getPriorityColor = (priority) => {
		switch (priority) {
			case "high": return "error";
			case "medium": return "warning";
			default: return "info";
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer, {
		anchor: "right",
		open,
		onClose,
		slotProps: { paper: { sx: {
			width: {
				xs: "100%",
				sm: 460
			},
			p: 3
		} } },
		children: ticket && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
			sx: {
				display: "flex",
				flexDirection: "column",
				height: "100%"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
					sx: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "h4",
						sx: { mb: .5 },
						children: "Ticket Details"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
						variant: "caption",
						color: "text.secondary",
						children: ["ID: ", ticket.ticketId]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
						onClick: onClose,
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Close_default, {})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
					sx: {
						flex: 1,
						overflowY: "auto",
						pr: .5
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "overline",
							color: "text.secondary",
							children: "Status & Priority"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Status",
							value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status: ticket.status })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Priority",
							value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								size: "small",
								color: getPriorityColor(ticket.priority),
								label: ticket.priority.toUpperCase(),
								variant: "outlined"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Category",
							value: ticket.category || "General"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Created At",
							value: formatDate(ticket.createdAt)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, { sx: { my: 2 } }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "overline",
							color: "text.secondary",
							children: "User Information"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "User Name",
							value: ticket.userName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "User Email",
							value: ticket.userEmail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, { sx: { my: 2 } }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "overline",
							color: "text.secondary",
							children: "Inquiry Subject"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "body1",
							sx: {
								fontWeight: 700,
								mb: 2
							},
							children: ticket.subject
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "overline",
							color: "text.secondary",
							children: "Original Message"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
							sx: {
								p: 2,
								borderRadius: 1.5,
								bgcolor: "action.hover",
								border: "1px solid",
								borderColor: "divider",
								mb: 3
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "body2",
								sx: {
									whiteSpace: "pre-wrap",
									lineHeight: 1.6
								},
								children: ticket.message
							})
						})
					]
				}),
				ticket.status === "open" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
					sx: {
						pt: 2,
						borderTop: "1px solid",
						borderColor: "divider"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "subtitle2",
							sx: {
								mb: 1,
								fontWeight: 600
							},
							children: "Response Reply"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							fullWidth: true,
							multiline: true,
							rows: 4,
							placeholder: "Type your official reply to the customer...",
							value: replyText,
							onChange: (e) => setReplyText(e.target.value),
							sx: { mb: 2 },
							disabled: replyMutation.isPending
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
							direction: "row",
							spacing: 1.5,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								fullWidth: true,
								variant: "contained",
								endIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SendOutlined_default, {}),
								onClick: () => handleReplySubmit(false),
								disabled: !replyText.trim() || replyMutation.isPending,
								children: "Send Reply"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								fullWidth: true,
								variant: "outlined",
								color: "success",
								endIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoneAllOutlined_default, {}),
								onClick: () => handleReplySubmit(true),
								disabled: !replyText.trim() || replyMutation.isPending,
								children: "Reply & Close"
							})]
						})
					]
				}),
				ticket.status === "closed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
					sx: {
						pt: 2,
						borderTop: "1px solid",
						borderColor: "divider"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
						variant: "body2",
						color: "success.main",
						sx: {
							fontWeight: 600,
							textAlign: "center",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							gap: 1
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoneAllOutlined_default, { fontSize: "small" }), " This ticket is marked as resolved and closed."]
					})
				})
			]
		})
	});
}
function SupportPage() {
	const lp = useListParams({
		sortBy: "createdAt",
		sortDir: "desc"
	});
	const { data, isLoading, isError, refetch, isFetching } = useTickets(lp.params);
	const replyMutation = useReplyTicket();
	const [selected, setSelected] = (0, import_react.useState)([]);
	const [detail, setDetail] = (0, import_react.useState)(null);
	const rows = data?.data ?? [];
	const getPriorityColor = (priority) => {
		switch (priority) {
			case "high": return "error";
			case "medium": return "warning";
			default: return "info";
		}
	};
	const handleCloseTicket = (id) => {
		replyMutation.mutate({
			id,
			payload: {
				reply: "Ticket closed by administrator.",
				close: true
			}
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Support Tickets",
			subtitle: "Manage customer queries, technical requests, and system feedback.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outlined",
				startIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDownloadOutlined_default, {}),
				disabled: !rows.length,
				onClick: () => downloadCsv(rows, "tickets.csv", [
					{
						key: "ticketId",
						label: "Ticket ID"
					},
					{
						key: "userName",
						label: "User Name"
					},
					{
						key: "userEmail",
						label: "User Email"
					},
					{
						key: "subject",
						label: "Subject"
					},
					{
						key: "category",
						label: "Category"
					},
					{
						key: "priority",
						label: "Priority"
					},
					{
						key: "status",
						label: "Status"
					},
					{
						key: "createdAt",
						label: "Created"
					}
				]),
				children: "Export CSV"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			columns: [
				{
					key: "ticketId",
					label: "Ticket ID",
					sortable: true,
					render: (t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "body2",
						sx: {
							fontFamily: "monospace",
							fontWeight: 700
						},
						children: t.ticketId
					})
				},
				{
					key: "userName",
					label: "User",
					render: (t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
						sx: {
							display: "flex",
							alignItems: "center",
							gap: 1.5
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							sx: {
								width: 34,
								height: 34,
								bgcolor: "info.main",
								fontSize: "0.8rem"
							},
							children: initialsOf(t.userName)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
							sx: { minWidth: 0 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "body2",
								sx: { fontWeight: 600 },
								noWrap: true,
								children: t.userName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "caption",
								color: "text.secondary",
								noWrap: true,
								sx: { display: "block" },
								children: t.userEmail
							})]
						})]
					})
				},
				{
					key: "subject",
					label: "Subject",
					render: (t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
						sx: {
							maxWidth: 300,
							minWidth: 150
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "body2",
							sx: { fontWeight: 600 },
							noWrap: true,
							children: t.subject
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "caption",
							color: "text.secondary",
							noWrap: true,
							sx: { display: "block" },
							children: t.message
						})]
					})
				},
				{
					key: "category",
					label: "Category",
					render: (t) => t.category || "General"
				},
				{
					key: "priority",
					label: "Priority",
					render: (t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						size: "small",
						label: t.priority.toUpperCase(),
						color: getPriorityColor(t.priority),
						variant: "outlined",
						sx: {
							fontWeight: 600,
							fontSize: "0.65rem",
							height: 20
						}
					})
				},
				{
					key: "status",
					label: "Status",
					sortable: true,
					render: (t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status: t.status })
				},
				{
					key: "createdAt",
					label: "Created",
					sortable: true,
					render: (t) => formatDate(t.createdAt)
				},
				{
					key: "actions",
					label: "",
					align: "right",
					render: (t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
						direction: "row",
						spacing: .5,
						sx: { justifyContent: "flex-end" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							title: "View Details / Reply",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
								size: "small",
								onClick: () => setDetail(t),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisibilityOutlined_default, { fontSize: "small" })
							})
						}), t.status === "open" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionGate, {
							permission: PERMISSIONS.SUPPORT_MANAGE,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								title: "Mark as Resolved",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									size: "small",
									color: "success",
									onClick: () => handleCloseTicket(t.id),
									disabled: replyMutation.isPending,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoneOutlined_default, { fontSize: "small" })
								})
							})
						})]
					})
				}
			],
			rows,
			rowKey: (t) => t.id,
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
			emptyTitle: "No tickets found",
			emptyDescription: "All issues resolved! Or try adjusting search filters.",
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
						placeholder: "Search tickets…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
						label: "Status",
						value: lp.filters?.status ?? "all",
						onChange: (v) => lp.setFilter("status", v),
						options: [
							{
								label: "All Statuses",
								value: "all"
							},
							{
								label: "Open",
								value: "open"
							},
							{
								label: "Closed",
								value: "closed"
							}
						]
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
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketDetailsDrawer, {
			ticket: detail,
			open: !!detail,
			onClose: () => setDetail(null)
		})
	] });
}
//#endregion
export { SupportPage as component };
