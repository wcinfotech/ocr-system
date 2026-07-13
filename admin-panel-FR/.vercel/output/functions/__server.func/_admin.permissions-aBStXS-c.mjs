import { o as __toESM } from "./_runtime.mjs";
import { en as require_jsx_runtime } from "./_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "./_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { J as Typography, K as Chip, U as Box } from "./_libs/@mui/material+[...].mjs";
import { t as DataTable } from "./_ssr/DataTable-CUY1bpUh.mjs";
import { t as PageHeader } from "./_ssr/PageHeader-9ov710wi.mjs";
import { n as SearchInput } from "./_ssr/Filters-DJMF8a9f.mjs";
import { i as usePermissions } from "./_ssr/useAdmins-DDznUA8Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.permissions-aBStXS-c.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PermissionsPage() {
	const { data: permissions = [], isLoading, isError, refetch } = usePermissions();
	const [search, setSearch] = (0, import_react.useState)("");
	const filtered = permissions.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.key.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Box, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Permission Catalog",
		subtitle: "Manage the system capability registry. These keys guard back-end controllers and front-end navigation routers."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
		columns: [
			{
				key: "key",
				label: "Rule Key",
				sortable: true,
				render: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					variant: "body2",
					sx: {
						fontFamily: "monospace",
						fontWeight: 700,
						color: "primary.main"
					},
					children: p.key
				})
			},
			{
				key: "name",
				label: "Permission Name",
				sortable: true,
				render: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Typography, {
					variant: "body2",
					sx: { fontWeight: 600 },
					children: p.name
				})
			},
			{
				key: "category",
				label: "Category Module",
				sortable: true,
				render: (p) => {
					let color = "default";
					if (p.category === "RBAC") color = "error";
					else if (p.category === "Users") color = "primary";
					else if (p.category === "Subscriptions" || p.category === "Plans") color = "info";
					else if (p.category === "Support") color = "success";
					else if (p.category === "Settings") color = "warning";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						label: p.category,
						size: "small",
						color,
						variant: "filled",
						sx: {
							fontWeight: 700,
							borderRadius: 1.5,
							fontSize: "0.65rem"
						}
					});
				}
			}
		],
		rows: filtered,
		rowKey: (p) => p.key,
		total: filtered.length,
		page: 1,
		pageSize: filtered.length,
		onPageChange: () => {},
		onPageSizeChange: () => {},
		loading: isLoading,
		error: isError,
		onRetry: refetch,
		emptyTitle: "No permissions found",
		emptyDescription: "Try clearing your search filters.",
		toolbar: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
			sx: {
				display: "flex",
				gap: 1.5,
				flexWrap: "wrap",
				alignItems: "center"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
				value: search,
				onChange: setSearch,
				placeholder: "Search permission registry…"
			})
		})
	})] });
}
//#endregion
export { PermissionsPage as component };
