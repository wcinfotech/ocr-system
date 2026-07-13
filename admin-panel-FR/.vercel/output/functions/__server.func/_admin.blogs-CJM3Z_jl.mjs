import { o as __toESM } from "./_runtime.mjs";
import { C as ImageOutlined_default, D as UploadFileOutlined_default, E as PreviewOutlined_default, F as EditOutlined_default, L as CodeOutlined_default, O as DeleteOutlineOutlined_default, S as EditNoteOutlined_default, T as CloudUploadOutlined_default, en as require_jsx_runtime, it as ArticleOutlined_default, k as AddOutlined_default, w as CloseOutlined_default } from "./_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "./_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { D as Grid, F as DialogContent, H as Button, I as DialogActions, J as Typography, K as Chip, L as Dialog, N as DialogTitle, Q as Paper, U as Box, X as IconButton, Y as Alert, Z as CircularProgress, c as TableCell, d as Tab, f as Switch, i as TableRow, k as FormControlLabel, l as TableBody, n as Tabs, o as TableHead, p as Stack, s as TableContainer, t as TextField, u as Table, w as LinearProgress } from "./_libs/@mui/material+[...].mjs";
import { n as env, t as apiClient } from "./_ssr/client-DaqzDLTU.mjs";
import { n as zt } from "./_libs/react-hot-toast.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/tanstack__react-query.mjs";
import { t as PageHeader } from "./_ssr/PageHeader-9ov710wi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.blogs-CJM3Z_jl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var blogService = {
	list: async () => {
		const { data } = await apiClient.get("/blogs/admin/all");
		return data.data;
	},
	create: async (payload) => {
		const { data } = await apiClient.post("/blogs/admin/create", payload);
		return data.data;
	},
	update: async (id, payload) => {
		const { data } = await apiClient.put(`/blogs/admin/update/${id}`, payload);
		return data.data;
	},
	remove: async (id) => {
		await apiClient.delete(`/blogs/admin/delete/${id}`);
	},
	importMd: async (file) => {
		const formData = new FormData();
		formData.append("mdFile", file);
		const { data } = await apiClient.post("/blogs/admin/import-md", formData, { headers: { "Content-Type": "multipart/form-data" } });
		return data.data;
	},
	uploadImage: async (file) => {
		const formData = new FormData();
		formData.append("featuredImage", file);
		const { data } = await apiClient.post("/blogs/admin/upload-image", formData, { headers: { "Content-Type": "multipart/form-data" } });
		return data.data;
	}
};
var useBlogs = () => useQuery({
	queryKey: ["blogs"],
	queryFn: () => blogService.list()
});
var useCreateBlog = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (blog) => blogService.create(blog),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["blogs"] });
			zt.success("Blog post created successfully");
		},
		onError: (err) => {
			zt.error(err.message || "Failed to create blog post");
		}
	});
};
var useUpdateBlog = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }) => blogService.update(id, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["blogs"] });
			zt.success("Blog post updated successfully");
		},
		onError: (err) => {
			zt.error(err.message || "Failed to update blog post");
		}
	});
};
var useDeleteBlog = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => blogService.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["blogs"] });
			zt.success("Blog post deleted successfully");
		},
		onError: (err) => {
			zt.error(err.message || "Failed to delete blog post");
		}
	});
};
function BlogsPage() {
	const { data: blogs, isLoading, isError } = useBlogs();
	const createMutation = useCreateBlog();
	const updateMutation = useUpdateBlog();
	const deleteMutation = useDeleteBlog();
	const [openDialog, setOpenDialog] = (0, import_react.useState)(false);
	const [editingBlog, setEditingBlog] = (0, import_react.useState)(null);
	const [title, setTitle] = (0, import_react.useState)("");
	const [excerpt, setExcerpt] = (0, import_react.useState)("");
	const [content, setContent] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("General");
	const [author, setAuthor] = (0, import_react.useState)("Escannora Team");
	const [featuredImage, setFeaturedImage] = (0, import_react.useState)("");
	const [isPublished, setIsPublished] = (0, import_react.useState)(true);
	const [imageUploading, setImageUploading] = (0, import_react.useState)(false);
	const [imageDragActive, setImageDragActive] = (0, import_react.useState)(false);
	const [editorTab, setEditorTab] = (0, import_react.useState)(0);
	const [CKEditorComponent, setCKEditorComponent] = (0, import_react.useState)(null);
	const [editorLoaded, setEditorLoaded] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (typeof window !== "undefined") Promise.all([import("./_libs/@ckeditor/ckeditor5-react+[...].mjs").then((n) => n.t).then((m) => m.CKEditor), import("./_libs/@ckeditor/ckeditor5-build-classic+[...].mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))]).then(([CKEditor, ClassicEditor]) => {
			setCKEditorComponent(() => ({
				CKEditor,
				ClassicEditor: ClassicEditor.default || ClassicEditor
			}));
			setEditorLoaded(true);
		}).catch((err) => {
			console.error("Failed to load CKEditor", err);
		});
	}, []);
	const fileInputRef = (0, import_react.useRef)(null);
	const imageInputRef = (0, import_react.useRef)(null);
	const handleOpenCreate = () => {
		setEditingBlog(null);
		setTitle("");
		setExcerpt("");
		setContent("");
		setCategory("General");
		setAuthor("Escannora Team");
		setFeaturedImage("");
		setIsPublished(true);
		setEditorTab(0);
		setImageUploading(false);
		setOpenDialog(true);
	};
	const handleOpenEdit = (blog) => {
		setEditingBlog(blog);
		setTitle(blog.title);
		setExcerpt(blog.excerpt);
		setContent(blog.content);
		setCategory(blog.category);
		setAuthor(blog.author || "Escannora Team");
		setFeaturedImage(blog.featuredImage || "");
		setIsPublished(blog.isPublished);
		setEditorTab(0);
		setImageUploading(false);
		setOpenDialog(true);
	};
	const handleImageUpload = (0, import_react.useCallback)(async (file) => {
		if (!file.type.startsWith("image/")) {
			zt.error("Please select an image file (JPG, PNG, WebP, GIF).");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			zt.error("Image must be under 5 MB.");
			return;
		}
		setImageUploading(true);
		try {
			const result = await blogService.uploadImage(file);
			const fullUrl = `${env.API_BASE_URL}${result.url}`;
			setFeaturedImage(fullUrl);
			zt.success("Image uploaded successfully!");
		} catch (err) {
			zt.error(err.message || "Image upload failed.");
		} finally {
			setImageUploading(false);
			if (imageInputRef.current) imageInputRef.current.value = "";
		}
	}, []);
	const handleImageDrop = (0, import_react.useCallback)((e) => {
		e.preventDefault();
		e.stopPropagation();
		setImageDragActive(false);
		const file = e.dataTransfer.files?.[0];
		if (file) handleImageUpload(file);
	}, [handleImageUpload]);
	const handleImageInputChange = (e) => {
		const file = e.target.files?.[0];
		if (file) handleImageUpload(file);
	};
	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to permanently delete this blog post?")) deleteMutation.mutate(id);
	};
	const handleImportMarkdown = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			zt.loading("Parsing markdown file...", { id: "md-import" });
			const parsed = await blogService.importMd(file);
			if (parsed.title) setTitle(parsed.title);
			if (parsed.excerpt) setExcerpt(parsed.excerpt);
			if (parsed.category) setCategory(parsed.category);
			if (parsed.content) {
				const formattedHtml = parsed.content.split(/\r?\n\r?\n/).map((para) => {
					if (para.startsWith("#")) {
						const depth = (para.match(/^#+/) || ["#"])[0].length;
						return `<h${depth} class="text-xl font-bold mt-4 mb-2">${para.replace(/^#+\s*/, "")}</h${depth}>`;
					}
					return `<p class="mb-3 leading-relaxed">${para}</p>`;
				}).join("\n");
				setContent(formattedHtml);
			}
			zt.success("Markdown file imported successfully!", { id: "md-import" });
		} catch (err) {
			zt.error(err.message || "Failed to import markdown file", { id: "md-import" });
		} finally {
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		const payload = {
			title,
			excerpt,
			content,
			category,
			author,
			featuredImage,
			isPublished
		};
		if (editingBlog?._id) updateMutation.mutate({
			id: editingBlog._id,
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
			children: "Failed to load blog posts. Check your server connection."
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
					title: "Blog Articles",
					subtitle: "Publish customer guides, compliance articles, and log technical feature releases.",
					icon: ArticleOutlined_default
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
					children: "New Article"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "file",
				ref: fileInputRef,
				accept: ".md",
				style: { display: "none" },
				onChange: handleImportMarkdown
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
							sx: { fontWeight: 700 },
							children: "Title"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							sx: { fontWeight: 700 },
							children: "Category"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							sx: { fontWeight: 700 },
							children: "Author"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							sx: { fontWeight: 700 },
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							sx: { fontWeight: 700 },
							children: "Publish Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							align: "right",
							sx: { fontWeight: 700 },
							children: "Actions"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: blogs && blogs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					align: "center",
					sx: { py: 8 },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "body2",
						color: "text.secondary",
						children: "No articles found. Click \"New Article\" or import a markdown file."
					})
				}) }) : blogs?.map((blog) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					hover: true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "body2",
							sx: { fontWeight: 600 },
							children: blog.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
							variant: "caption",
							color: "text.secondary",
							display: "block",
							children: ["/", blog.slug]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							label: blog.category,
							size: "small",
							variant: "outlined",
							sx: { fontWeight: 600 }
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: blog.author || "Escannora Team" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							label: blog.isPublished ? "Published" : "Draft",
							color: blog.isPublished ? "success" : "default",
							size: "small",
							sx: { fontWeight: 600 }
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "N/A" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							align: "right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
								direction: "row",
								spacing: .5,
								justifyContent: "flex-end",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									color: "primary",
									onClick: () => handleOpenEdit(blog),
									size: "small",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditOutlined_default, { fontSize: "small" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									color: "error",
									onClick: () => handleDelete(blog._id),
									size: "small",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteOutlineOutlined_default, { fontSize: "small" })
								})]
							})
						})
					]
				}, blog._id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
				open: openDialog,
				onClose: () => setOpenDialog(false),
				maxWidth: "md",
				fullWidth: true,
				scroll: "paper",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						sx: {
							fontWeight: 700,
							pb: 1,
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
							variant: "h6",
							sx: { fontWeight: 700 },
							children: editingBlog ? "Edit Blog Article" : "Create New Article"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outlined",
							size: "small",
							startIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadFileOutlined_default, {}),
							onClick: () => fileInputRef.current?.click(),
							sx: {
								textTransform: "none",
								borderRadius: 2,
								fontWeight: 600
							},
							children: "Import .md File"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
						dividers: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
							spacing: 3,
							sx: { mt: 1 },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, {
									container: true,
									spacing: 2,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
											item: true,
											xs: 12,
											sm: 8,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
												label: "Article Title",
												fullWidth: true,
												required: true,
												value: title,
												onChange: (e) => setTitle(e.target.value)
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
											item: true,
											xs: 12,
											sm: 4,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
												label: "Category",
												fullWidth: true,
												required: true,
												value: category,
												onChange: (e) => setCategory(e.target.value)
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
											item: true,
											xs: 12,
											sm: 6,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
												label: "Author Name",
												fullWidth: true,
												value: author,
												onChange: (e) => setAuthor(e.target.value)
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
										variant: "subtitle2",
										sx: {
											fontWeight: 700,
											mb: 1
										},
										children: "Featured Image"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										ref: imageInputRef,
										accept: "image/jpeg,image/png,image/webp,image/gif",
										style: { display: "none" },
										onChange: handleImageInputChange
									}),
									featuredImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
										sx: {
											position: "relative",
											borderRadius: 2.5,
											overflow: "hidden",
											border: "1px solid",
											borderColor: "divider",
											maxHeight: 220
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
											component: "img",
											src: featuredImage,
											alt: "Featured",
											sx: {
												width: "100%",
												maxHeight: 220,
												objectFit: "cover",
												display: "block"
											}
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
											sx: {
												position: "absolute",
												top: 0,
												left: 0,
												right: 0,
												bottom: 0,
												bgcolor: "rgba(0,0,0,0.35)",
												opacity: 0,
												transition: "opacity 0.2s",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												gap: 1.5,
												"&:hover": { opacity: 1 }
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "contained",
												size: "small",
												startIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUploadOutlined_default, {}),
												onClick: () => imageInputRef.current?.click(),
												sx: {
													bgcolor: "rgba(255,255,255,0.9)",
													color: "#333",
													textTransform: "none",
													fontWeight: 600,
													"&:hover": { bgcolor: "#fff" }
												},
												children: "Replace"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "contained",
												size: "small",
												startIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloseOutlined_default, {}),
												onClick: () => setFeaturedImage(""),
												sx: {
													bgcolor: "rgba(244,67,54,0.85)",
													color: "#fff",
													textTransform: "none",
													fontWeight: 600,
													"&:hover": { bgcolor: "#f44336" }
												},
												children: "Remove"
											})]
										})]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
										onDragEnter: (e) => {
											e.preventDefault();
											e.stopPropagation();
											setImageDragActive(true);
										},
										onDragLeave: (e) => {
											e.preventDefault();
											e.stopPropagation();
											setImageDragActive(false);
										},
										onDragOver: (e) => {
											e.preventDefault();
											e.stopPropagation();
										},
										onDrop: handleImageDrop,
										onClick: () => !imageUploading && imageInputRef.current?.click(),
										sx: {
											border: "2px dashed",
											borderColor: imageDragActive ? "primary.main" : "divider",
											borderRadius: 2.5,
											py: 4,
											px: 2,
											textAlign: "center",
											cursor: imageUploading ? "default" : "pointer",
											bgcolor: imageDragActive ? "action.hover" : "transparent",
											transition: "all 0.2s ease",
											"&:hover": {
												borderColor: "primary.light",
												bgcolor: "action.hover"
											}
										},
										children: imageUploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircularProgress, {
												size: 32,
												sx: { mb: 1.5 }
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
												variant: "body2",
												color: "text.secondary",
												sx: { fontWeight: 600 },
												children: "Uploading image…"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinearProgress, { sx: {
												mt: 1.5,
												mx: "auto",
												maxWidth: 200,
												borderRadius: 1
											} })
										] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageOutlined_default, { sx: {
												fontSize: 40,
												color: "text.disabled",
												mb: 1
											} }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
												variant: "body2",
												sx: {
													fontWeight: 600,
													color: "text.primary"
												},
												children: imageDragActive ? "Drop image here" : "Click or drag an image to upload"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
												variant: "caption",
												color: "text.secondary",
												display: "block",
												sx: { mt: .5 },
												children: "JPG, PNG, WebP, or GIF — Max 5 MB"
											})
										] })
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									label: "Short Excerpt / Summary",
									fullWidth: true,
									required: true,
									multiline: true,
									rows: 2,
									value: excerpt,
									onChange: (e) => setExcerpt(e.target.value),
									placeholder: "A brief summary shown on the blog index cards..."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
									sx: {
										borderBottom: 1,
										borderColor: "divider",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										mb: 1.5
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
										value: editorTab,
										onChange: (_, val) => setEditorTab(val),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
												icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditNoteOutlined_default, { fontSize: "small" }),
												iconPosition: "start",
												label: "Visual Editor",
												sx: {
													textTransform: "none",
													fontWeight: 600
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
												icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeOutlined_default, { fontSize: "small" }),
												iconPosition: "start",
												label: "Write HTML / Code",
												sx: {
													textTransform: "none",
													fontWeight: 600
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
												icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewOutlined_default, { fontSize: "small" }),
												iconPosition: "start",
												label: "Live Preview",
												sx: {
													textTransform: "none",
													fontWeight: 600
												}
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
										variant: "caption",
										color: "text.secondary",
										children: "HTML markup is fully supported."
									})]
								}), editorTab === 0 ? editorLoaded && CKEditorComponent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
									sx: {
										"& .ck-editor__editable_inline": {
											minHeight: 280,
											maxHeight: 400,
											fontFamily: "inherit",
											px: 2,
											borderRadius: "0 0 10px 10px !important",
											borderTop: "none !important"
										},
										"& .ck-toolbar": {
											borderRadius: "10px 10px 0 0 !important",
											borderColor: "divider !important",
											bgcolor: "action.hover !important"
										},
										"& .ck.ck-editor__main>.ck-editor__editable": {
											borderColor: "divider !important",
											"&:focus": {
												borderColor: "primary.main !important",
												boxShadow: "none !important"
											}
										}
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CKEditorComponent.CKEditor, {
										editor: CKEditorComponent.ClassicEditor,
										data: content,
										onChange: (event, editor) => {
											const data = editor.getData();
											setContent(data);
										},
										config: { placeholder: "Write your article body here..." }
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
									sx: {
										display: "flex",
										flexDirection: "column",
										justifyContent: "center",
										alignItems: "center",
										minHeight: 280,
										border: "1px dashed",
										borderColor: "divider",
										borderRadius: 3
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircularProgress, {
										size: 32,
										sx: { mb: 1.5 }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
										variant: "body2",
										color: "text.secondary",
										sx: { fontWeight: 600 },
										children: "Loading Visual Editor..."
									})]
								}) : editorTab === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									placeholder: "<p>Write your article body here. Support for rich tags, images and links...</p>",
									fullWidth: true,
									required: true,
									multiline: true,
									rows: 12,
									value: content,
									onChange: (e) => setContent(e.target.value),
									sx: {
										fontFamily: "monospace",
										"& .MuiInputBase-input": {
											fontFamily: "Consolas, Courier, monospace",
											fontSize: 13
										}
									}
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paper, {
									variant: "outlined",
									sx: {
										p: 3.5,
										minHeight: 275,
										maxHeight: 400,
										overflowY: "auto",
										borderRadius: 2,
										bgcolor: "grey.50"
									},
									children: content ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "blog-preview-content",
										dangerouslySetInnerHTML: { __html: content }
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
										variant: "body2",
										color: "text.secondary",
										align: "center",
										sx: { mt: 8 },
										children: "Nothing to preview yet. Start writing in the editor!"
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControlLabel, {
									control: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: isPublished,
										onChange: (e) => setIsPublished(e.target.checked),
										color: "primary"
									}),
									label: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
										variant: "body2",
										sx: { fontWeight: 600 },
										children: "Publish immediately"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
										variant: "caption",
										color: "text.secondary",
										children: "Make this post instantly visible on the public website."
									})] })
								})
							]
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
							children: editingBlog ? "Save Changes" : "Publish Article"
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { BlogsPage as component };
