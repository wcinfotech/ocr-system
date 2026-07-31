import { o as __toESM } from "./_runtime.mjs";
import { F as EditOutlined_default, I as Add_default, P as DeleteOutlined_default, en as require_jsx_runtime } from "./_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "./_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { E as InputAdornment, F as DialogContent, H as Button, I as DialogActions, J as Typography, K as Chip, L as Dialog, N as DialogTitle, U as Box, X as IconButton, _ as MenuItem, m as Tooltip, p as Stack, t as TextField } from "./_libs/@mui/material+[...].mjs";
import { n as formatBytesMb, o as formatNumber, r as formatCurrency } from "./_ssr/format-CPIzLQoT.mjs";
import { t as ConfirmDialog } from "./_ssr/ConfirmDialog-BpC-lVsT.mjs";
import { n as PERMISSIONS } from "./_ssr/AuthContext-Bj2jbtLU.mjs";
import { t as usePermissions } from "./_ssr/usePermissions-D7xIyXuL.mjs";
import { t as DataTable } from "./_ssr/DataTable-CUY1bpUh.mjs";
import { t as useListParams } from "./_ssr/useListParams-DZ-LPTQa.mjs";
import { t as PageHeader } from "./_ssr/PageHeader-9ov710wi.mjs";
import { n as SearchInput, r as StatusChip } from "./_ssr/Filters-DJMF8a9f.mjs";
import { t as PermissionGate } from "./_ssr/PermissionGate-CfxL_kdH.mjs";
import { a as usePlans, i as useDeletePlan, l as useUpdatePlan, n as useCreatePlan } from "./_ssr/useCatalog-B0M2MMjf.mjs";
import { a as stringType, i as objectType, n as coerce, r as enumType } from "./_libs/zod.mjs";
import { n as Controller, r as useForm, t as u } from "./_libs/@hookform/resolvers+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.plans-DNiH7rJE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var schema = objectType({
	name: stringType().min(1, "Name is required").max(60),
	price: coerce.number().min(0, "Price must be positive"),
	currency: stringType().min(1),
	ocrLimit: coerce.number().int().min(0),
	storageMb: coerce.number().int().min(0),
	durationDays: coerce.number().int().min(1, "At least 1 day"),
	status: enumType(["active", "archived"])
});
function PlanFormDialog({ open, plan, loading, onClose, onSubmit }) {
	const [benefits, setBenefits] = (0, import_react.useState)([]);
	const [benefitInput, setBenefitInput] = (0, import_react.useState)("");
	const { control, handleSubmit, reset, formState: { errors } } = useForm({
		resolver: u(schema),
		defaultValues: {
			name: "",
			price: 0,
			currency: "USD",
			ocrLimit: 100,
			storageMb: 1024,
			durationDays: 30,
			status: "active"
		}
	});
	(0, import_react.useEffect)(() => {
		if (open) {
			reset({
				name: plan?.name ?? "",
				price: plan?.price ?? 0,
				currency: plan?.currency ?? "USD",
				ocrLimit: plan?.ocrLimit ?? 100,
				storageMb: plan?.storageMb ?? 1024,
				durationDays: plan?.durationDays ?? 30,
				status: plan?.status ?? "active"
			});
			setBenefits(plan?.benefits ?? []);
			setBenefitInput("");
		}
	}, [
		open,
		plan,
		reset
	]);
	const addBenefit = () => {
		const v = benefitInput.trim();
		if (v && !benefits.includes(v)) setBenefits((b) => [...b, v]);
		setBenefitInput("");
	};
	const submit = (values) => onSubmit({
		...values,
		benefits
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onClose,
		maxWidth: "sm",
		fullWidth: true,
		slotProps: { paper: { sx: { borderRadius: 3 } } },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				sx: { fontWeight: 700 },
				children: plan ? "Edit plan" : "Create plan"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
				component: "form",
				id: "plan-form",
				onSubmit: handleSubmit(submit),
				sx: {
					display: "grid",
					gap: 2,
					pt: 1
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controller, {
						name: "name",
						control,
						render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							...field,
							label: "Plan name",
							fullWidth: true,
							error: !!errors.name,
							helperText: errors.name?.message
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
						sx: {
							display: "grid",
							gridTemplateColumns: "2fr 1fr",
							gap: 2
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controller, {
							name: "price",
							control,
							render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
								...field,
								type: "number",
								label: "Price",
								error: !!errors.price,
								helperText: errors.price?.message
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controller, {
							name: "currency",
							control,
							render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
								...field,
								select: true,
								label: "Currency",
								children: [
									"USD",
									"EUR",
									"GBP",
									"INR"
								].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
									value: c,
									children: c
								}, c))
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
						sx: {
							display: "grid",
							gridTemplateColumns: "1fr 1fr 1fr",
							gap: 2
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controller, {
								name: "ocrLimit",
								control,
								render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									...field,
									type: "number",
									label: "OCR limit",
									error: !!errors.ocrLimit
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controller, {
								name: "storageMb",
								control,
								render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									...field,
									type: "number",
									label: "Storage",
									slotProps: { input: { endAdornment: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputAdornment, {
										position: "end",
										children: "MB"
									}) } }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controller, {
								name: "durationDays",
								control,
								render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									...field,
									type: "number",
									label: "Duration",
									error: !!errors.durationDays,
									slotProps: { input: { endAdornment: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputAdornment, {
										position: "end",
										children: "days"
									}) } }
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controller, {
						name: "status",
						control,
						render: ({ field }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TextField, {
							...field,
							select: true,
							label: "Status",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
								value: "active",
								children: "Active"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
								value: "archived",
								children: "Archived"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						label: "Add benefit",
						value: benefitInput,
						onChange: (e) => setBenefitInput(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addBenefit();
							}
						},
						helperText: "Press Enter to add"
					}),
					benefits.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
						sx: {
							display: "flex",
							flexWrap: "wrap",
							gap: 1
						},
						children: benefits.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							label: b,
							onDelete: () => setBenefits((prev) => prev.filter((x) => x !== b))
						}, b))
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogActions, {
				sx: {
					px: 3,
					pb: 2.5
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					color: "inherit",
					onClick: onClose,
					disabled: loading,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					form: "plan-form",
					variant: "contained",
					disabled: loading,
					children: plan ? "Save changes" : "Create plan"
				})]
			})
		]
	});
}
function PlansPage() {
	const { can } = usePermissions();
	const canManage = can(PERMISSIONS.PLANS_MANAGE);
	const lp = useListParams();
	const { data, isLoading, isFetching, isError, refetch } = usePlans(lp.params);
	const create = useCreatePlan();
	const update = useUpdatePlan();
	const remove = useDeletePlan();
	const [formOpen, setFormOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [toDelete, setToDelete] = (0, import_react.useState)(null);
	const rows = data?.data ?? [];
	const openCreate = () => {
		setEditing(null);
		setFormOpen(true);
	};
	const openEdit = (p) => {
		setEditing(p);
		setFormOpen(true);
	};
	const handleSubmit = (payload) => {
		if (editing) update.mutate({
			id: editing.id,
			payload
		}, { onSuccess: () => setFormOpen(false) });
		else create.mutate(payload, { onSuccess: () => setFormOpen(false) });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Plans",
			subtitle: "Create and manage subscription plans.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionGate, {
				permission: PERMISSIONS.PLANS_MANAGE,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "contained",
					startIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Add_default, {}),
					onClick: openCreate,
					children: "Create plan"
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			columns: [
				{
					key: "name",
					label: "Plan",
					sortable: true,
					render: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "body2",
						sx: { fontWeight: 600 },
						children: p.name
					})
				},
				{
					key: "price",
					label: "Price",
					align: "right",
					sortable: true,
					render: (p) => formatCurrency(p.price, p.currency)
				},
				{
					key: "ocrLimit",
					label: "OCR Limit",
					align: "right",
					render: (p) => formatNumber(p.ocrLimit)
				},
				{
					key: "storageMb",
					label: "Storage",
					align: "right",
					render: (p) => formatBytesMb(p.storageMb)
				},
				{
					key: "durationDays",
					label: "Duration",
					align: "right",
					render: (p) => `${p.durationDays} days`
				},
				{
					key: "benefits",
					label: "Benefits",
					render: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
						direction: "row",
						spacing: .5,
						sx: {
							flexWrap: "wrap",
							gap: .5
						},
						children: [(p.benefits ?? []).slice(0, 2).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							size: "small",
							variant: "outlined",
							label: b
						}, b)), (p.benefits?.length ?? 0) > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							size: "small",
							label: `+${p.benefits.length - 2}`
						})]
					})
				},
				{
					key: "status",
					label: "Status",
					render: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status: p.status })
				},
				{
					key: "actions",
					label: "",
					align: "right",
					render: (p) => canManage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
						direction: "row",
						spacing: .5,
						sx: { justifyContent: "flex-end" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							title: "Edit",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
								size: "small",
								onClick: () => openEdit(p),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditOutlined_default, { fontSize: "small" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							title: "Delete",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
								size: "small",
								color: "error",
								onClick: () => setToDelete(p),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteOutlined_default, { fontSize: "small" })
							})
						})]
					}) : null
				}
			],
			rows,
			rowKey: (p) => p.id,
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
			emptyTitle: "No plans yet",
			emptyDescription: "Create your first subscription plan to get started.",
			toolbar: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
				value: lp.search,
				onChange: lp.setSearch,
				placeholder: "Search plans…"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanFormDialog, {
			open: formOpen,
			plan: editing,
			loading: create.isPending || update.isPending,
			onClose: () => setFormOpen(false),
			onSubmit: handleSubmit
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
			open: !!toDelete,
			title: "Delete plan?",
			description: `Delete "${toDelete?.name}"? Users on this plan may be affected.`,
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
export { PlansPage as component };
