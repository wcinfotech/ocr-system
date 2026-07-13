import { At as alpha, _ as EventBusyOutlined_default, b as PersonOffOutlined_default, en as require_jsx_runtime, g as DocumentScannerOutlined_default, h as CloudOutlined_default, nt as ReceiptLongOutlined_default, rt as PeopleAltOutlined_default, tt as AutorenewOutlined_default, v as PaymentsOutlined_default, x as HowToRegOutlined_default, y as TodayOutlined_default } from "./_libs/@mui/icons-material+[...].mjs";
import { G as Avatar, J as Typography, K as Chip, U as Box, V as Card, h as Skeleton } from "./_libs/@mui/material+[...].mjs";
import { n as ErrorState, r as Loader, t as EmptyState } from "./_ssr/States-Bz7DtX_-.mjs";
import { c as initialsOf, i as formatDate, n as formatBytesMb, o as formatNumber, r as formatCurrency, s as formatPercent } from "./_ssr/format-CPIzLQoT.mjs";
import { t as colors } from "./_ssr/theme-BYCmjw9S.mjs";
import { t as queryKeys } from "./_ssr/queryKeys-BebIyJSY.mjs";
import { n as useQuery } from "./_libs/tanstack__react-query.mjs";
import { t as PageHeader } from "./_ssr/PageHeader-9ov710wi.mjs";
import { r as StatusChip } from "./_ssr/Filters-DJMF8a9f.mjs";
import { t as dashboardService } from "./_ssr/dashboard.service-BHIJqJmc.mjs";
import { t as motion } from "./_libs/framer-motion+[...].mjs";
import { a as YAxis, c as Line, d as Pie, f as Cell, i as LineChart, l as CartesianGrid, m as Tooltip, n as PieChart, o as XAxis, p as ResponsiveContainer, r as BarChart, s as Area, t as AreaChart, u as Bar } from "./_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.dashboard-qklCiNOE.js
var import_jsx_runtime = require_jsx_runtime();
function StatCard({ label, value, icon: Icon, color = "#2563EB", hint, loading, index = 0 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		component: motion.div,
		initial: {
			opacity: 0,
			y: 12
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .3,
			delay: index * .04
		},
		sx: {
			p: 2.5,
			height: "100%"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
			sx: {
				display: "flex",
				alignItems: "flex-start",
				justifyContent: "space-between",
				gap: 2
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
				sx: { minWidth: 0 },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "body2",
						color: "text.secondary",
						noWrap: true,
						sx: { fontWeight: 600 },
						children: label
					}),
					loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
						width: 90,
						height: 40
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "h2",
						sx: {
							mt: .5,
							fontSize: "1.6rem"
						},
						children: value
					}),
					hint && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
						variant: "caption",
						color: "text.secondary",
						children: hint
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
				sx: {
					flexShrink: 0,
					width: 44,
					height: 44,
					borderRadius: 2.5,
					display: "grid",
					placeItems: "center",
					color,
					bgcolor: alpha(color, .12)
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {})
			})]
		})
	});
}
function ChartCard({ title, subtitle, height = 280, action, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		sx: {
			p: 2.5,
			height: "100%"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
			sx: {
				display: "flex",
				justifyContent: "space-between",
				alignItems: "flex-start",
				mb: 2
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "h4",
				children: title
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
				variant: "body2",
				color: "text.secondary",
				children: subtitle
			})] }), action]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
			sx: { height },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children
			})
		})]
	});
}
var axisProps = {
	stroke: colors.textSecondary,
	fontSize: 12,
	tickLine: false,
	axisLine: false
};
function AreaTrend({ data, color = colors.primary }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
		data,
		margin: {
			top: 8,
			right: 8,
			left: -16,
			bottom: 0
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: `grad-${color}`,
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: color,
					stopOpacity: .35
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: color,
					stopOpacity: 0
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
				strokeDasharray: "3 3",
				vertical: false,
				stroke: colors.border
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
				dataKey: "label",
				...axisProps
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { ...axisProps }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
				borderRadius: 12,
				border: `1px solid ${colors.border}`
			} }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
				type: "monotone",
				dataKey: "value",
				stroke: color,
				strokeWidth: 2.5,
				fill: `url(#grad-${color})`
			})
		]
	});
}
function BarSeries({ data, color = colors.info }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
		data,
		margin: {
			top: 8,
			right: 8,
			left: -16,
			bottom: 0
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
				strokeDasharray: "3 3",
				vertical: false,
				stroke: colors.border
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
				dataKey: "label",
				...axisProps
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { ...axisProps }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
				cursor: { fill: colors.primaryLight },
				contentStyle: {
					borderRadius: 12,
					border: `1px solid ${colors.border}`
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
				dataKey: "value",
				fill: color,
				radius: [
					6,
					6,
					0,
					0
				],
				maxBarSize: 40
			})
		]
	});
}
function LineSeries({ data, color = colors.success }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
		data,
		margin: {
			top: 8,
			right: 8,
			left: -16,
			bottom: 0
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
				strokeDasharray: "3 3",
				vertical: false,
				stroke: colors.border
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
				dataKey: "label",
				...axisProps
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { ...axisProps }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
				borderRadius: 12,
				border: `1px solid ${colors.border}`
			} }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
				type: "monotone",
				dataKey: "value",
				stroke: color,
				strokeWidth: 2.5,
				dot: false
			})
		]
	});
}
var PIE_COLORS = [
	colors.primary,
	colors.info,
	colors.success,
	colors.warning,
	colors.danger
];
function DonutSeries({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
		data,
		dataKey: "value",
		nameKey: "label",
		innerRadius: 60,
		outerRadius: 90,
		paddingAngle: 3,
		children: data.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: PIE_COLORS[i % PIE_COLORS.length] }, i))
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
		borderRadius: 12,
		border: `1px solid ${colors.border}`
	} })] });
}
var useDashboardStats = () => useQuery({
	queryKey: queryKeys.dashboard.stats,
	queryFn: dashboardService.stats
});
var useDashboardCharts = () => useQuery({
	queryKey: queryKeys.dashboard.charts,
	queryFn: dashboardService.charts
});
var useRecentUsers = (limit = 5) => useQuery({
	queryKey: [...queryKeys.dashboard.recentUsers, limit],
	queryFn: () => dashboardService.recentUsers(limit)
});
var useRecentBills = (limit = 5) => useQuery({
	queryKey: [...queryKeys.dashboard.recentBills, limit],
	queryFn: () => dashboardService.recentBills(limit)
});
function DashboardPage() {
	const stats = useDashboardStats();
	const charts = useDashboardCharts();
	const recentUsers = useRecentUsers();
	const recentBills = useRecentBills();
	const s = stats.data;
	const cards = [
		{
			label: "Total Users",
			value: s ? formatNumber(s.totalUsers) : "—",
			icon: PeopleAltOutlined_default,
			color: colors.primary
		},
		{
			label: "Active Users",
			value: s ? formatNumber(s.activeUsers) : "—",
			icon: HowToRegOutlined_default,
			color: colors.success
		},
		{
			label: "Inactive Users",
			value: s ? formatNumber(s.inactiveUsers) : "—",
			icon: PersonOffOutlined_default,
			color: colors.textSecondary
		},
		{
			label: "Total Bills",
			value: s ? formatNumber(s.totalBills) : "—",
			icon: ReceiptLongOutlined_default,
			color: colors.info
		},
		{
			label: "Bills Today",
			value: s ? formatNumber(s.billsToday) : "—",
			icon: TodayOutlined_default,
			color: colors.warning
		},
		{
			label: "Revenue",
			value: s ? formatCurrency(s.revenue, s.currency) : "—",
			icon: PaymentsOutlined_default,
			color: colors.primary
		},
		{
			label: "Subscriptions",
			value: s ? formatNumber(s.subscriptions) : "—",
			icon: AutorenewOutlined_default,
			color: colors.success
		},
		{
			label: "Expired Plans",
			value: s ? formatNumber(s.expiredPlans) : "—",
			icon: EventBusyOutlined_default,
			color: colors.danger
		},
		{
			label: "OCR Success Rate",
			value: s ? formatPercent(s.ocrSuccessRate) : "—",
			icon: DocumentScannerOutlined_default,
			color: colors.info
		},
		{
			label: "Storage Used",
			value: s ? formatBytesMb(s.storageUsedMb) : "—",
			icon: CloudOutlined_default,
			color: colors.warning
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Dashboard",
			subtitle: "Overview of platform performance and activity."
		}),
		stats.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
			message: "Could not load dashboard metrics.",
			onRetry: () => stats.refetch()
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
			sx: {
				display: "grid",
				gap: 2,
				gridTemplateColumns: {
					xs: "1fr 1fr",
					sm: "repeat(3, 1fr)",
					lg: "repeat(5, 1fr)"
				},
				mb: 3
			},
			children: cards.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
				...c,
				loading: stats.isLoading,
				index: i
			}, c.label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
			sx: {
				display: "grid",
				gap: 2,
				gridTemplateColumns: {
					xs: "1fr",
					lg: "2fr 1fr"
				},
				mb: 3
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
				title: "Revenue",
				subtitle: "Revenue over time",
				children: charts.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaTrend, { data: charts.data.revenue }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyChart, { loading: charts.isLoading })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
				title: "Top Plans",
				subtitle: "Distribution by plan",
				children: charts.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DonutSeries, { data: charts.data.topPlans }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyChart, { loading: charts.isLoading })
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
			sx: {
				display: "grid",
				gap: 2,
				gridTemplateColumns: {
					xs: "1fr",
					md: "repeat(3, 1fr)"
				},
				mb: 3
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
					title: "Daily Users",
					height: 220,
					children: charts.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineSeries, { data: charts.data.dailyUsers }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyChart, { loading: charts.isLoading })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
					title: "Monthly Growth",
					height: 220,
					children: charts.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaTrend, {
						data: charts.data.monthlyGrowth,
						color: colors.success
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyChart, { loading: charts.isLoading })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
					title: "Bills Upload",
					height: 220,
					children: charts.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarSeries, { data: charts.data.billsUpload }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyChart, { loading: charts.isLoading })
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
			sx: {
				display: "grid",
				gap: 2,
				gridTemplateColumns: {
					xs: "1fr",
					md: "1fr 1fr"
				}
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecentList, {
				title: "Latest Users",
				loading: recentUsers.isLoading,
				error: recentUsers.isError,
				empty: !recentUsers.data?.length,
				rows: (recentUsers.data ?? []).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
					sx: {
						display: "flex",
						alignItems: "center",
						gap: 1.5,
						py: 1.25
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							sx: {
								width: 34,
								height: 34,
								bgcolor: "primary.main",
								fontSize: "0.8rem"
							},
							children: initialsOf(u.name)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
							sx: {
								minWidth: 0,
								flex: 1
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "body2",
								noWrap: true,
								sx: { fontWeight: 600 },
								children: u.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "caption",
								color: "text.secondary",
								noWrap: true,
								sx: { display: "block" },
								children: u.email
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status: u.status })
					]
				}, u.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecentList, {
				title: "Latest Bills",
				loading: recentBills.isLoading,
				error: recentBills.isError,
				empty: !recentBills.data?.length,
				rows: (recentBills.data ?? []).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
					sx: {
						display: "flex",
						alignItems: "center",
						gap: 1.5,
						py: 1.25
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, {
							sx: {
								minWidth: 0,
								flex: 1
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
								variant: "body2",
								noWrap: true,
								sx: { fontWeight: 600 },
								children: b.fileName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Typography, {
								variant: "caption",
								color: "text.secondary",
								noWrap: true,
								sx: { display: "block" },
								children: [
									b.userName,
									" · ",
									formatDate(b.createdAt)
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							size: "small",
							variant: "outlined",
							label: b.amount ? formatCurrency(b.amount, b.currency) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { status: b.status })
					]
				}, b.id))
			})]
		})
	] });
}
function EmptyChart({ loading }) {
	return loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, { minHeight: 200 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "No data",
		description: "Metrics will appear once available."
	});
}
function RecentList({ title, rows, loading, error, empty }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		sx: { p: 2.5 },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
			variant: "h4",
			sx: { mb: 1 },
			children: title
		}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, { minHeight: 200 }) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {}) : empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Nothing yet",
			description: "No recent records."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
			sx: { divide: 1 },
			children: rows
		})]
	});
}
//#endregion
export { DashboardPage as component };
