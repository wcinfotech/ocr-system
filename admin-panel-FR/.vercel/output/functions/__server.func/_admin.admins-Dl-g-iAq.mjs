import { o as __toESM } from "./_runtime.mjs";
import { F as EditOutlined_default, I as Add_default, P as DeleteOutlined_default, en as require_jsx_runtime } from "./_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "./_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { A as FormControl, D as Grid, F as DialogContent, G as Avatar, H as Button, I as DialogActions, J as Typography, K as Chip, L as Dialog, N as DialogTitle, O as FormGroup, T as InputLabel, U as Box, X as IconButton, _ as MenuItem, g as Select, k as FormControlLabel, m as Tooltip, p as Stack, t as TextField, z as Checkbox } from "./_libs/@mui/material+[...].mjs";
import { c as initialsOf, i as formatDate } from "./_ssr/format-CPIzLQoT.mjs";
import { a as useAuth, i as ROLE_PERMISSION_FALLBACK, n as PERMISSIONS, r as ROLES } from "./_ssr/AuthContext-Bj2jbtLU.mjs";
import { t as DataTable } from "./_ssr/DataTable-CUY1bpUh.mjs";
import { t as useListParams } from "./_ssr/useListParams-DZ-LPTQa.mjs";
import { t as PageHeader } from "./_ssr/PageHeader-9ov710wi.mjs";
import { n as SearchInput } from "./_ssr/Filters-DJMF8a9f.mjs";
import { t as ConfirmDialog } from "./_ssr/ConfirmDialog-BpC-lVsT.mjs";
import { t as PermissionGate } from "./_ssr/PermissionGate-CfxL_kdH.mjs";
import { i as usePermissions, n as useCreateAdmin, o as useUpdateAdmin, r as useDeleteAdmin, t as useAdmins } from "./_ssr/useAdmins-FqfJiGDk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admins-Dl-g-iAq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminsPage() {
	const { user: currentAdmin } = useAuth();
	const lp = useListParams({
		sortBy: "createdAt",
		sortDir: "desc"
	});
	const { data, isLoading, isError, refetch, isFetching } = useAdmins(lp.params);
	const { data: allPermissions = [] } = usePermissions();
	const createAdminMutation = useCreateAdmin();
	const updateAdminMutation = useUpdateAdmin();
	const deleteAdminMutation = useDeleteAdmin();
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editingAdmin, setEditingAdmin] = (0, import_react.useState)(null);
	const [toDelete, setToDelete] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("ADMIN");
	const [selectedPermissions, setSelectedPermissions] = (0, import_react.useState)([]);
	const rows = data?.data ?? [];
	(0, import_react.useEffect)(() => {
		if (editingAdmin) {
			setName(editingAdmin.name);
			setEmail(editingAdmin.email);
			setPassword("");
			setRole(editingAdmin.role);
			setSelectedPermissions(editingAdmin.permissions || []);
		} else {
			setName("");
			setEmail("");
			setPassword("");
			setRole("ADMIN");
			setSelectedPermissions(ROLE_PERMISSION_FALLBACK["ADMIN"]);
		}
	}, [editingAdmin, dialogOpen]);
	const handleRoleChange = (newRole) => {
		setRole(newRole);
		const defaults = ROLE_PERMISSION_FALLBACK[newRole] || [];
		setSelectedPermissions(defaults);
	};
	const handleTogglePermission = (permissionKey) => {
		setSelectedPermissions((prev) => prev.includes(permissionKey) ? prev.filter((p) => p !== permissionKey) : [...prev, permissionKey]);
	};
	const handleSave = () => {
		if (!name || !email || !editingAdmin && !password) return;
		const payload = {
			name,
			email,
			role,
			permissions: selectedPermissions,
			...password ? { password } : {}
		};
		if (editingAdmin) updateAdminMutation.mutate({
			id: editingAdmin.id,
			payload
		}, { onSuccess: () => {
			setDialogOpen(false);
			setEditingAdmin(null);
		} });
		else createAdminMutation.mutate(payload, { onSuccess: () => {
			setDialogOpen(false);
		} });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Admin Staff Accounts",
			subtitle: "Manage administrative accounts, assign roles, and configure specific page permission restrictions.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionGate, {
				permission: PERMISSIONS.ADMINS_MANAGE,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "contained",
					startIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Add_default, {}),
					onClick: () => {
						setEditingAdmin(null);
						setDialogOpen(true);
					},
					children: "Add Staff Member"
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			columns: [
				{
					key: "name",
					label: "Admin User",
					sortable: true,
					render: (a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
						sx: {
							display: "flex",
							alignItems: "center",
							gap: 1.5
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							sx: {
								width: 34,
								height: 34,
								bgcolor: "secondary.main",
								fontSize: "0.8rem"
							},
							children: initialsOf(a.name)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
							sx: { minWidth: 0 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "body2",
								sx: { fontWeight: 600 },
								noWrap: true,
								children: a.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "caption",
								color: "text.secondary",
								noWrap: true,
								sx: { display: "block" },
								children: a.email
							})]
						})]
					})
				},
				{
					key: "role",
					label: "Role",
					render: (a) => {
						let color = "default";
						if (a.role === "SUPER_ADMIN") color = "error";
						else if (a.role === "ADMIN") color = "primary";
						else if (a.role === "MANAGER") color = "warning";
						else if (a.role === "SUPPORT") color = "success";
						else if (a.role === "ACCOUNTANT") color = "secondary";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							label: a.role,
							size: "small",
							color,
							variant: "outlined",
							sx: {
								fontWeight: 700,
								borderRadius: 1.5
							}
						});
					}
				},
				{
					key: "permissions",
					label: "Permissions",
					render: (a) => {
						if (a.permissions?.includes("*")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							label: "All Permissions (*)",
							size: "small",
							color: "error",
							sx: {
								fontWeight: 600,
								fontSize: "0.7rem",
								borderRadius: 1.5
							}
						});
						const count = a.permissions?.length ?? 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							title: a.permissions?.join(", ") || "None",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								label: `${count} custom rules`,
								size: "small",
								variant: "filled",
								color: "default",
								sx: {
									fontWeight: 600,
									fontSize: "0.7rem",
									borderRadius: 1.5
								}
							})
						});
					}
				},
				{
					key: "createdAt",
					label: "Created",
					sortable: true,
					render: (a) => formatDate(a.createdAt)
				},
				{
					key: "actions",
					label: "",
					align: "right",
					render: (a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stack, {
						direction: "row",
						spacing: .5,
						sx: { justifyContent: "flex-end" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PermissionGate, {
							permission: PERMISSIONS.ADMINS_MANAGE,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								title: "Edit Staff Member",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									size: "small",
									onClick: () => {
										setEditingAdmin(a);
										setDialogOpen(true);
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditOutlined_default, { fontSize: "small" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								title: "Delete Account",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									size: "small",
									color: "error",
									disabled: currentAdmin?.id === a.id,
									onClick: () => setToDelete(a),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteOutlined_default, { fontSize: "small" })
								}) })
							})]
						})
					})
				}
			],
			rows,
			rowKey: (a) => a.id,
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
			emptyTitle: "No staff members found",
			emptyDescription: "Create administrative staff members to configure specific roles.",
			toolbar: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
				sx: {
					display: "flex",
					gap: 1.5,
					flexWrap: "wrap",
					alignItems: "center"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
					value: lp.search,
					onChange: lp.setSearch,
					placeholder: "Search admin accounts…"
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
			open: dialogOpen,
			onClose: () => setDialogOpen(false),
			maxWidth: "md",
			fullWidth: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					sx: { fontWeight: 700 },
					children: editingAdmin ? "Edit Staff Member Details" : "Create Administrative Account"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					dividers: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, {
						container: true,
						spacing: 3,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
							item: true,
							xs: 12,
							md: 6,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
								spacing: 2.5,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Name",
										value: name,
										onChange: (e) => setName(e.target.value),
										fullWidth: true,
										required: true,
										variant: "outlined",
										size: "small"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: "Email",
										value: email,
										onChange: (e) => setEmail(e.target.value),
										fullWidth: true,
										required: true,
										type: "email",
										variant: "outlined",
										size: "small",
										disabled: !!editingAdmin
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
										label: editingAdmin ? "Change Password (Leave blank to keep current)" : "Password",
										value: password,
										onChange: (e) => setPassword(e.target.value),
										fullWidth: true,
										required: !editingAdmin,
										type: "password",
										variant: "outlined",
										size: "small"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FormControl, {
										fullWidth: true,
										size: "small",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputLabel, { children: "System Role" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
											value: role,
											label: "System Role",
											onChange: (e) => handleRoleChange(e.target.value),
											children: Object.values(ROLES).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
												value: r,
												children: r
											}, r))
										})]
									})
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, {
							item: true,
							xs: 12,
							md: 6,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "subtitle2",
								sx: {
									fontWeight: 700,
									mb: 1.5
								},
								children: "Assign Route & Component Permissions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
								sx: {
									maxHeight: 320,
									overflowY: "auto",
									border: "1px solid",
									borderColor: "divider",
									borderRadius: 2,
									p: 2,
									bgcolor: "grey.50"
								},
								children: role === "SUPER_ADMIN" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
									sx: {
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
										py: 5
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
										label: "Full Admin Wildcard (*)",
										color: "error",
										variant: "filled",
										sx: { fontWeight: 800 }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
										variant: "caption",
										color: "text.secondary",
										sx: {
											mt: 1.5,
											textAlign: "center"
										},
										children: "Super Admin has absolute system override credentials and receives wildcard permissions."
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormGroup, { children: allPermissions.map((perm) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControlLabel, {
									control: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
										checked: selectedPermissions.includes(perm.key) || selectedPermissions.includes("*"),
										disabled: selectedPermissions.includes("*"),
										onChange: () => handleTogglePermission(perm.key),
										size: "small"
									}),
									label: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
										variant: "body2",
										sx: { fontWeight: 500 },
										children: perm.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
										variant: "caption",
										color: "text.secondary",
										children: [
											"Category: ",
											perm.category,
											" (",
											perm.key,
											")"
										]
									})] }),
									sx: {
										mb: 1.5,
										alignItems: "flex-start"
									}
								}, perm.key)) })
							})]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogActions, {
					sx: { p: 2.5 },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setDialogOpen(false),
						color: "inherit",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: handleSave,
						variant: "contained",
						disabled: !name || !email || !editingAdmin && !password || createAdminMutation.isPending || updateAdminMutation.isPending,
						children: editingAdmin ? "Save Changes" : "Create Account"
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
			open: !!toDelete,
			title: "Delete admin staff account?",
			description: `This will permanently delete administrative access for ${toDelete?.name} (${toDelete?.email}).`,
			confirmLabel: "Delete Account",
			destructive: true,
			loading: deleteAdminMutation.isPending,
			onClose: () => setToDelete(null),
			onConfirm: () => {
				if (toDelete) deleteAdminMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
			}
		})
	] });
}
//#endregion
export { AdminsPage as component };
