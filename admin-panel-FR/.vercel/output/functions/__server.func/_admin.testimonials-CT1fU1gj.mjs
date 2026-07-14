import { o as __toESM } from "./_runtime.mjs";
import { F as EditOutlined_default, O as DeleteOutlineOutlined_default, Y as RateReviewOutlined_default, en as require_jsx_runtime, k as AddOutlined_default } from "./_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "./_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { D as Grid, F as DialogContent, H as Button, I as DialogActions, J as Typography, K as Chip, L as Dialog, N as DialogTitle, Q as Paper, U as Box, X as IconButton, Y as Alert, Z as CircularProgress, c as TableCell, f as Switch, i as TableRow, k as FormControlLabel, l as TableBody, o as TableHead, p as Stack, s as TableContainer, t as TextField, u as Table } from "./_libs/@mui/material+[...].mjs";
import { t as apiClient } from "./_ssr/client-oeguNz2X.mjs";
import { n as zt } from "./_libs/react-hot-toast.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { t as PageHeader } from "./_ssr/PageHeader-9ov710wi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.testimonials-CT1fU1gj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var testimonialService = {
	list: async () => {
		const { data } = await apiClient.get("/testimonials/admin/all");
		return data.data;
	},
	create: async (payload) => {
		const { data } = await apiClient.post("/testimonials/admin/create", payload);
		return data.data;
	},
	update: async (id, payload) => {
		const { data } = await apiClient.put(`/testimonials/admin/update/${id}`, payload);
		return data.data;
	},
	remove: async (id) => {
		await apiClient.delete(`/testimonials/admin/delete/${id}`);
	}
};
var useTestimonials = () => useQuery({
	queryKey: ["testimonials"],
	queryFn: () => testimonialService.list()
});
var useCreateTestimonial = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (testimonial) => testimonialService.create(testimonial),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["testimonials"] });
			zt.success("Testimonial created successfully");
		},
		onError: (err) => {
			zt.error(err.message || "Failed to create testimonial");
		}
	});
};
var useUpdateTestimonial = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => testimonialService.update(id, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["testimonials"] });
			zt.success("Testimonial updated successfully");
		},
		onError: (err) => {
			zt.error(err.message || "Failed to update testimonial");
		}
	});
};
var useDeleteTestimonial = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => testimonialService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["testimonials"] });
			zt.success("Testimonial deleted successfully");
		},
		onError: (err) => {
			zt.error(err.message || "Failed to delete testimonial");
		}
	});
};
function TestimonialsPage() {
	const { data: testimonials, isLoading, isError } = useTestimonials();
	const createMutation = useCreateTestimonial();
	const updateMutation = useUpdateTestimonial();
	const deleteMutation = useDeleteTestimonial();
	const [openDialog, setOpenDialog] = (0, import_react.useState)(false);
	const [editingTestimonial, setEditingTestimonial] = (0, import_react.useState)(null);
	const [author, setAuthor] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("");
	const [quote, setQuote] = (0, import_react.useState)("");
	const [order, setOrder] = (0, import_react.useState)(0);
	const [isPublished, setIsPublished] = (0, import_react.useState)(true);
	const handleOpenCreate = () => {
		setEditingTestimonial(null);
		setAuthor("");
		setRole("");
		setQuote("");
		setOrder(testimonials ? testimonials.length : 0);
		setIsPublished(true);
		setOpenDialog(true);
	};
	const handleOpenEdit = (item) => {
		setEditingTestimonial(item);
		setAuthor(item.author);
		setRole(item.role);
		setQuote(item.quote);
		setOrder(item.order ?? 0);
		setIsPublished(item.isPublished ?? true);
		setOpenDialog(true);
	};
	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to permanently delete this testimonial?")) deleteMutation.mutate(id);
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		const payload = {
			author,
			role,
			quote,
			order: Number(order),
			isPublished
		};
		if (editingTestimonial?._id) updateMutation.mutate({
			id: editingTestimonial._id,
			payload
		}, { onSuccess: () => setOpenDialog(false) });
		else createMutation.mutate(payload, { onSuccess: () => setOpenDialog(false) });
	};
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
		sx: {
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			minHeight: "60vh"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircularProgress, { color: "primary" })
	});
	if (isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
		sx: { p: 3 },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, {
			severity: "error",
			children: "Failed to load testimonials. Check your server connection."
		})
	});
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
					title: "Testimonials & Reviews",
					subtitle: "Manage the customer testimonials displayed on the marketing landing pages.",
					icon: RateReviewOutlined_default
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "contained",
					startIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddOutlined_default, {}),
					onClick: handleOpenCreate,
					sx: {
						bgcolor: "#7c4dff",
						color: "#fff",
						fontWeight: 700,
						textTransform: "none",
						borderRadius: 2.5,
						px: 3,
						"&:hover": { bgcolor: "#651fff" }
					},
					children: "Add Testimonial"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableContainer, {
				component: Paper,
				elevation: 0,
				sx: {
					border: "1px solid",
					borderColor: "divider",
					borderRadius: 3
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					sx: { bgcolor: "action.hover" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							sx: {
								fontWeight: 700,
								width: "20%"
							},
							children: "Author"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							sx: {
								fontWeight: 700,
								width: "20%"
							},
							children: "Role / Designation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							sx: {
								fontWeight: 700,
								width: "40%"
							},
							children: "Quote"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							sx: {
								fontWeight: 700,
								width: "8%"
							},
							children: "Order"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							sx: {
								fontWeight: 700,
								width: "12%"
							},
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							align: "right",
							sx: { fontWeight: 700 },
							children: "Actions"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: testimonials && testimonials.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					align: "center",
					sx: { py: 8 },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "body2",
						color: "text.secondary",
						children: "No testimonials found. Click \"Add Testimonial\" to create one."
					})
				}) }) : testimonials?.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					hover: true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							sx: { fontWeight: 600 },
							children: item.author
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: item.role }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
							variant: "body2",
							sx: {
								display: "-webkit-box",
								WebkitLineClamp: 2,
								WebkitBoxOrient: "vertical",
								overflow: "hidden",
								textOverflow: "ellipsis",
								color: "text.secondary",
								fontStyle: "italic"
							},
							children: [
								"\"",
								item.quote,
								"\""
							]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: item.order ?? 0 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							label: item.isPublished ? "Visible" : "Hidden",
							color: item.isPublished ? "success" : "default",
							size: "small",
							sx: { fontWeight: 600 }
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							align: "right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
								direction: "row",
								spacing: .5,
								justifyContent: "flex-end",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									color: "primary",
									onClick: () => handleOpenEdit(item),
									size: "small",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditOutlined_default, { fontSize: "small" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									color: "error",
									onClick: () => handleDelete(item._id),
									size: "small",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteOutlineOutlined_default, { fontSize: "small" })
								})]
							})
						})
					]
				}, item._id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
				open: openDialog,
				onClose: () => setOpenDialog(false),
				maxWidth: "sm",
				fullWidth: true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						sx: {
							fontWeight: 700,
							pb: 1
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "h6",
							sx: { fontWeight: 700 },
							children: editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
						dividers: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
							spacing: 3,
							sx: { mt: 1 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, {
								container: true,
								spacing: 2,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
										item: true,
										xs: 12,
										sm: 6,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "Author Name",
											fullWidth: true,
											required: true,
											value: author,
											onChange: (e) => setAuthor(e.target.value),
											placeholder: "e.g. Rajesh K."
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
										item: true,
										xs: 12,
										sm: 6,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "Role / Company",
											fullWidth: true,
											required: true,
											value: role,
											onChange: (e) => setRole(e.target.value),
											placeholder: "e.g. Operations Director, Fashion Hub"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
										item: true,
										xs: 12,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "Order Index",
											type: "number",
											fullWidth: true,
											required: true,
											value: order,
											onChange: (e) => setOrder(Number(e.target.value)),
											helperText: "Lower numbers will appear first in the scrolling feed."
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
										item: true,
										xs: 12,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "Quote / Review Content",
											fullWidth: true,
											required: true,
											multiline: true,
											rows: 4,
											value: quote,
											onChange: (e) => setQuote(e.target.value),
											placeholder: "Write the customer's review here..."
										})
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControlLabel, {
								control: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: isPublished,
									onChange: (e) => setIsPublished(e.target.checked),
									color: "primary"
								}),
								label: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
									variant: "body2",
									sx: { fontWeight: 600 },
									children: "Publish testimonial"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
									variant: "caption",
									color: "text.secondary",
									children: "Make this review instantly visible on the public website slider."
								})] })
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogActions, {
						sx: { p: 2.5 },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => setOpenDialog(false),
							color: "inherit",
							sx: {
								textTransform: "none",
								fontWeight: 600
							},
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							onClick: handleSubmit,
							variant: "contained",
							disabled: createMutation.isPending || updateMutation.isPending,
							sx: {
								bgcolor: "#7c4dff",
								color: "#fff",
								textTransform: "none",
								fontWeight: 700,
								px: 3,
								"&:hover": { bgcolor: "#651fff" }
							},
							children: editingTestimonial ? "Save Changes" : "Create Testimonial"
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { TestimonialsPage as component };
