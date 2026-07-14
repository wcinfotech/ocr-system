import { o as __toESM } from "./_runtime.mjs";
import { X as SettingsOutlined_default, en as require_jsx_runtime, l as SaveOutlined_default } from "./_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "./_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { D as Grid, H as Button, J as Typography, M as Divider, Q as Paper, U as Box, Y as Alert, Z as CircularProgress, f as Switch, k as FormControlLabel, p as Stack, t as TextField } from "./_libs/@mui/material+[...].mjs";
import { i as useUpdateSettings, r as useSettings } from "./_ssr/useLogs-BmClLmdR.mjs";
import { t as PageHeader } from "./_ssr/PageHeader-9ov710wi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.settings-JiOLjeZJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const { data: settings, isLoading, isError } = useSettings();
	const updateSettings = useUpdateSettings();
	const [supportEmail, setSupportEmail] = (0, import_react.useState)("");
	const [contactPhone, setContactPhone] = (0, import_react.useState)("");
	const [contactAddress, setContactAddress] = (0, import_react.useState)("");
	const [maxStorageLimitMb, setMaxStorageLimitMb] = (0, import_react.useState)(10240);
	const [ocrRetryLimit, setOcrRetryLimit] = (0, import_react.useState)(3);
	const [maintenanceMode, setMaintenanceMode] = (0, import_react.useState)(false);
	const [emailNotifications, setEmailNotifications] = (0, import_react.useState)(true);
	const [activityLogRetention, setActivityLogRetention] = (0, import_react.useState)(false);
	const [activityLogSavePayload, setActivityLogSavePayload] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (settings) {
			setSupportEmail(settings.supportEmail || "");
			setContactPhone(settings.contactPhone || "");
			setContactAddress(settings.contactAddress || "");
			setMaxStorageLimitMb(settings.maxStorageLimitMb ?? 10240);
			setOcrRetryLimit(settings.ocrRetryLimit ?? 3);
			setMaintenanceMode(settings.maintenanceMode ?? false);
			setEmailNotifications(settings.emailNotifications ?? true);
			setActivityLogRetention(settings.activityLogRetention ?? false);
			setActivityLogSavePayload(settings.activityLogSavePayload ?? false);
		}
	}, [settings]);
	const handleSave = (e) => {
		e.preventDefault();
		if (!settings) return;
		updateSettings.mutate({
			...settings,
			supportEmail,
			contactPhone,
			contactAddress,
			maxStorageLimitMb: Number(maxStorageLimitMb),
			ocrRetryLimit: Number(ocrRetryLimit),
			maintenanceMode,
			emailNotifications,
			activityLogRetention,
			activityLogSavePayload,
			allowedUploadTypes: settings.allowedUploadTypes || [
				"pdf",
				"jpg",
				"jpeg",
				"png",
				"webp"
			]
		});
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
			children: "Failed to load system settings. Please try again later."
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
		sx: { p: 1 },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "System Settings",
			subtitle: "Manage company contact details, SMTP logs, OCR parameters, and system maintenance.",
			icon: SettingsOutlined_default
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
			component: "form",
			onSubmit: handleSave,
			sx: {
				mt: 3,
				maxWidth: 960
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, {
				container: true,
				spacing: 3.5,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
						item: true,
						xs: 12,
						md: 6,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Paper, {
							elevation: 0,
							sx: {
								p: 3,
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider",
								height: "100%"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
									variant: "h6",
									sx: {
										fontWeight: 700,
										mb: 1
									},
									children: "Contact & Support Details"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
									variant: "caption",
									color: "text.secondary",
									display: "block",
									sx: { mb: 3 },
									children: "These contact details are fed directly into the public website Contact Us page."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
									spacing: 2.5,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "Support Email Address",
											variant: "outlined",
											fullWidth: true,
											required: true,
											type: "email",
											value: supportEmail,
											onChange: (e) => setSupportEmail(e.target.value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "Contact Phone Number",
											variant: "outlined",
											fullWidth: true,
											value: contactPhone,
											onChange: (e) => setContactPhone(e.target.value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "Corporate HQ Address",
											variant: "outlined",
											fullWidth: true,
											multiline: true,
											rows: 3,
											value: contactAddress,
											onChange: (e) => setContactAddress(e.target.value)
										})
									]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
						item: true,
						xs: 12,
						md: 6,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Paper, {
							elevation: 0,
							sx: {
								p: 3,
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider",
								height: "100%"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
									variant: "h6",
									sx: {
										fontWeight: 700,
										mb: 1
									},
									children: "OCR & File Quotas"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
									variant: "caption",
									color: "text.secondary",
									display: "block",
									sx: { mb: 3 },
									children: "Manage maximum server file retention storage quotas and OCR queue retry parameters."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
									spacing: 2.5,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "Max Storage Limit (MB)",
											variant: "outlined",
											type: "number",
											fullWidth: true,
											required: true,
											value: maxStorageLimitMb,
											onChange: (e) => setMaxStorageLimitMb(Number(e.target.value))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
											label: "OCR Retry Rate Limit",
											variant: "outlined",
											type: "number",
											fullWidth: true,
											required: true,
											value: ocrRetryLimit,
											onChange: (e) => setOcrRetryLimit(Number(e.target.value))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, { sx: { my: 1 } }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
											variant: "subtitle2",
											sx: { fontWeight: 700 },
											children: "Allowed Upload Format Enforcements"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
											variant: "body2",
											color: "text.secondary",
											children: ["Currently active formats: ", settings?.allowedUploadTypes?.join(", ") || "pdf, jpg, jpeg, png, webp"]
										})
									]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
						item: true,
						xs: 12,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Paper, {
							elevation: 0,
							sx: {
								p: 3,
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
									variant: "h6",
									sx: {
										fontWeight: 700,
										mb: 1
									},
									children: "System Administration & Logging"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
									variant: "caption",
									color: "text.secondary",
									display: "block",
									sx: { mb: 3 },
									children: "Configure global notification toggles, debug logging parameters, and server maintenance states."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, {
									container: true,
									spacing: 3,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
										item: true,
										xs: 12,
										sm: 6,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
											spacing: 2.5,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControlLabel, {
												control: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
													checked: emailNotifications,
													onChange: (e) => setEmailNotifications(e.target.checked),
													color: "primary"
												}),
												label: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
													sx: { ml: 1 },
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
														variant: "body2",
														sx: { fontWeight: 600 },
														children: "Global Email Notifications"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
														variant: "caption",
														color: "text.secondary",
														children: "Trigger automatic SMTP invoices, account changes, and system alert updates."
													})]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControlLabel, {
												control: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
													checked: activityLogRetention,
													onChange: (e) => setActivityLogRetention(e.target.checked),
													color: "primary"
												}),
												label: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
													sx: { ml: 1 },
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
														variant: "body2",
														sx: { fontWeight: 600 },
														children: "7-Day Log Auto-Retention"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
														variant: "caption",
														color: "text.secondary",
														children: "Automatically purge system log histories older than 7 days from databases."
													})]
												})
											})]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
										item: true,
										xs: 12,
										sm: 6,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Stack, {
											spacing: 2.5,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControlLabel, {
												control: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
													checked: activityLogSavePayload,
													onChange: (e) => setActivityLogSavePayload(e.target.checked),
													color: "primary"
												}),
												label: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
													sx: { ml: 1 },
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
														variant: "body2",
														sx: { fontWeight: 600 },
														children: "Capture Request/Response Payloads"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
														variant: "caption",
														color: "text.secondary",
														children: "Log raw HTTP response JSON objects to debug transaction payloads."
													})]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormControlLabel, {
												control: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
													checked: maintenanceMode,
													onChange: (e) => setMaintenanceMode(e.target.checked),
													color: "error"
												}),
												label: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
													sx: { ml: 1 },
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
														variant: "body2",
														sx: {
															fontWeight: 600,
															color: maintenanceMode ? "error.main" : "text.primary"
														},
														children: "Maintenance Mode"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
														variant: "caption",
														color: "text.secondary",
														children: "Instantly restrict access to standard client workspace pages with a warning."
													})]
												})
											})]
										})
									})]
								})
							]
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
				sx: {
					mt: 4,
					display: "flex",
					justifyContent: "flex-end",
					gap: 2
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "contained",
					size: "large",
					disabled: updateSettings.isPending,
					startIcon: updateSettings.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircularProgress, { size: 20 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaveOutlined_default, {}),
					sx: {
						bgcolor: "#7c4dff",
						color: "#fff",
						textTransform: "none",
						fontWeight: 700,
						px: 4,
						py: 1.25,
						borderRadius: 2.5,
						"&:hover": { bgcolor: "#651fff" }
					},
					children: updateSettings.isPending ? "Saving Settings..." : "Save Configuration"
				})
			})]
		})]
	});
}
//#endregion
export { SettingsPage as component };
