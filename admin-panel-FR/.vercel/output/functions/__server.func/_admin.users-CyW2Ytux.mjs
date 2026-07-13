import { o as __toESM } from "./_runtime.mjs";
import { M as VisibilityOutlined_default, N as FileDownloadOutlined_default, P as DeleteOutlined_default, en as require_jsx_runtime, o as Close_default, r as BlockOutlined_default, u as CheckCircleOutlined_default } from "./_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "./_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { G as Avatar, H as Button, J as Typography, K as Chip, M as Divider, U as Box, X as IconButton, j as Drawer, m as Tooltip, p as Stack, w as LinearProgress } from "./_libs/@mui/material+[...].mjs";
import { c as initialsOf, i as formatDate, n as formatBytesMb, o as formatNumber, t as downloadCsv } from "./_ssr/format-CPIzLQoT.mjs";
import { r as isApiError } from "./_ssr/client-DaqzDLTU.mjs";
import { n as PERMISSIONS } from "./_ssr/AuthContext-87_GBZZr.mjs";
import { n as zt } from "./_libs/react-hot-toast.mjs";
import { t as DataTable } from "./_ssr/DataTable-CUY1bpUh.mjs";
import { t as useListParams } from "./_ssr/useListParams-DZ-LPTQa.mjs";
import { t as queryKeys } from "./_ssr/queryKeys-BebIyJSY.mjs";
import { o as keepPreviousData } from "./_libs/tanstack__query-core.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { t as PageHeader } from "./_ssr/PageHeader-9ov710wi.mjs";
import { n as SearchInput, r as StatusChip, t as FilterSelect } from "./_ssr/Filters-DJMF8a9f.mjs";
import { t as ConfirmDialog } from "./_ssr/ConfirmDialog-BpC-lVsT.mjs";
import { t as PermissionGate } from "./_ssr/PermissionGate-BICGWk7Q.mjs";
import { n as usersService } from "./_ssr/dashboard.service-BHIJqJmc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.users-CyW2Ytux.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
function UserDetailsDrawer({ user, open, onClose, actions }) {
	const storagePct = user?.storageUsedMb && user?.storageLimitMb ? Math.min(100, user.storageUsedMb / user.storageLimitMb * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer, {
		anchor: "right",
		open,
		onClose,
		slotProps: { paper: { sx: {
			width: {
				xs: "100%",
				sm: 420
			},
			p: 3
		} } },
		children: user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
				sx: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 3
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					variant: "h4",
					children: "User details"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
					onClick: onClose,
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Close_default, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
				sx: {
					display: "flex",
					alignItems: "center",
					gap: 2,
					mb: 3
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					sx: {
						width: 56,
						height: 56,
						bgcolor: "primary.main"
					},
					children: initialsOf(user.name)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
					sx: { minWidth: 0 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "h5",
						noWrap: true,
						children: user.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "body2",
						color: "text.secondary",
						noWrap: true,
						children: user.email
					})]
				})]
			}),
			actions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stack, {
				direction: "row",
				spacing: 1,
				sx: {
					mb: 2,
					flexWrap: "wrap",
					gap: 1
				},
				children: actions
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, { sx: { mb: 1 } })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "overline",
				color: "text.secondary",
				children: "Account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Status",
				value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status: user.status })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Joined",
				value: formatDate(user.createdAt)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, { sx: { my: 1 } }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "overline",
				color: "text.secondary",
				children: "Subscription"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Plan",
				value: user.planName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					size: "small",
					label: user.planName
				}) : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, { sx: { my: 1 } }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "overline",
				color: "text.secondary",
				children: "Usage"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
				label: "Bills uploaded",
				value: formatNumber(user.billsCount ?? 0)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
				sx: { py: 1 },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
					sx: {
						display: "flex",
						justifyContent: "space-between",
						mb: .5
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "body2",
						color: "text.secondary",
						children: "Storage"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
						variant: "body2",
						sx: { fontWeight: 600 },
						children: [
							formatBytesMb(user.storageUsedMb),
							" / ",
							formatBytesMb(user.storageLimitMb)
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinearProgress, {
					variant: "determinate",
					value: storagePct,
					sx: {
						height: 8,
						borderRadius: 4
					}
				})]
			})
		] })
	});
}
var errMsg = (e, fallback) => isApiError(e) ? e.message : fallback;
var useUsers = (params) => useQuery({
	queryKey: queryKeys.users.list(params),
	queryFn: () => usersService.list(params),
	placeholderData: keepPreviousData
});
var useSuspendUser = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => usersService.suspend(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.users.all });
			zt.success("User suspended");
		},
		onError: (e) => zt.error(errMsg(e, "Failed to suspend user"))
	});
};
var useActivateUser = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => usersService.activate(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.users.all });
			zt.success("User activated");
		},
		onError: (e) => zt.error(errMsg(e, "Failed to activate user"))
	});
};
var useDeleteUser = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => usersService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: queryKeys.users.all });
			zt.success("User deleted");
		},
		onError: (e) => zt.error(errMsg(e, "Failed to delete user"))
	});
};
function UsersPage() {
	const lp = useListParams({
		sortBy: "createdAt",
		sortDir: "desc"
	});
	const { data, isLoading, isError, refetch, isFetching } = useUsers(lp.params);
	const suspend = useSuspendUser();
	const activate = useActivateUser();
	const remove = useDeleteUser();
	const [selected, setSelected] = (0, import_react.useState)([]);
	const [detail, setDetail] = (0, import_react.useState)(null);
	const [toDelete, setToDelete] = (0, import_react.useState)(null);
	const rows = data?.data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Users",
			subtitle: "Manage platform users, subscriptions and access.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outlined",
				startIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDownloadOutlined_default, {}),
				disabled: !rows.length,
				onClick: () => downloadCsv(rows, "users.csv", [
					{
						key: "name",
						label: "Name"
					},
					{
						key: "email",
						label: "Email"
					},
					{
						key: "status",
						label: "Status"
					},
					{
						key: "planName",
						label: "Plan"
					},
					{
						key: "createdAt",
						label: "Joined"
					}
				]),
				children: "Export CSV"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			columns: [
				{
					key: "name",
					label: "User",
					sortable: true,
					render: (u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
						sx: {
							display: "flex",
							alignItems: "center",
							gap: 1.5
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							sx: {
								width: 34,
								height: 34,
								bgcolor: "primary.main",
								fontSize: "0.8rem"
							},
							children: initialsOf(u.name)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
							sx: { minWidth: 0 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "body2",
								sx: { fontWeight: 600 },
								noWrap: true,
								children: u.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "caption",
								color: "text.secondary",
								noWrap: true,
								sx: { display: "block" },
								children: u.email
							})]
						})]
					})
				},
				{
					key: "planName",
					label: "Plan",
					render: (u) => u.planName ?? "—"
				},
				{
					key: "status",
					label: "Status",
					sortable: true,
					render: (u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status: u.status })
				},
				{
					key: "billsCount",
					label: "Bills",
					align: "right",
					render: (u) => u.billsCount ?? 0
				},
				{
					key: "createdAt",
					label: "Joined",
					sortable: true,
					render: (u) => formatDate(u.createdAt)
				},
				{
					key: "actions",
					label: "",
					align: "right",
					render: (u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
						direction: "row",
						spacing: .5,
						sx: { justifyContent: "flex-end" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								title: "View",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									size: "small",
									onClick: () => setDetail(u),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisibilityOutlined_default, { fontSize: "small" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionGate, {
								permission: PERMISSIONS.USERS_SUSPEND,
								children: u.status === "suspended" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									title: "Activate",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
										size: "small",
										color: "success",
										onClick: () => activate.mutate(u.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCircleOutlined_default, { fontSize: "small" })
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									title: "Suspend",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
										size: "small",
										color: "warning",
										onClick: () => suspend.mutate(u.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockOutlined_default, { fontSize: "small" })
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionGate, {
								permission: PERMISSIONS.USERS_DELETE,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									title: "Delete",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
										size: "small",
										color: "error",
										onClick: () => setToDelete(u),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteOutlined_default, { fontSize: "small" })
									})
								})
							})
						]
					})
				}
			],
			rows,
			rowKey: (u) => u.id,
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
			emptyTitle: "No users found",
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
						placeholder: "Search users…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
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
								label: "Inactive",
								value: "inactive"
							},
							{
								label: "Suspended",
								value: "suspended"
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
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserDetailsDrawer, {
			user: detail,
			open: !!detail,
			onClose: () => setDetail(null),
			actions: detail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionGate, {
				permission: PERMISSIONS.USERS_SUSPEND,
				children: detail.status === "suspended" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "small",
					variant: "outlined",
					color: "success",
					onClick: () => activate.mutate(detail.id),
					children: "Activate"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "small",
					variant: "outlined",
					color: "warning",
					onClick: () => suspend.mutate(detail.id),
					children: "Suspend"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionGate, {
				permission: PERMISSIONS.USERS_DELETE,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "small",
					variant: "outlined",
					color: "error",
					onClick: () => setToDelete(detail),
					children: "Delete"
				})
			})] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
			open: !!toDelete,
			title: "Delete user?",
			description: `This will permanently delete ${toDelete?.name}. This action cannot be undone.`,
			confirmLabel: "Delete",
			destructive: true,
			loading: remove.isPending,
			onClose: () => setToDelete(null),
			onConfirm: () => {
				if (toDelete) remove.mutate(toDelete.id, { onSuccess: () => {
					setToDelete(null);
					setDetail(null);
				} });
			}
		})
	] });
}
//#endregion
export { UsersPage as component };
