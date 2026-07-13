import { en as require_jsx_runtime } from "../_libs/@mui/icons-material+[...].mjs";
import { U as Box, V as Card, a as TablePagination, c as TableCell, h as Skeleton, i as TableRow, l as TableBody, o as TableHead, r as TableSortLabel, s as TableContainer, u as Table, z as Checkbox } from "../_libs/@mui/material+[...].mjs";
import { n as ErrorState, t as EmptyState } from "./States-Bz7DtX_-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/DataTable-CUY1bpUh.js
var import_jsx_runtime = require_jsx_runtime();
function DataTable({ columns, rows, rowKey, total, page, pageSize, onPageChange, onPageSizeChange, sortBy, sortDir, onSortChange, loading, error, onRetry, emptyTitle, emptyDescription, selectable, selected = [], onSelectedChange, toolbar }) {
	const allSelected = rows.length > 0 && selected.length === rows.length;
	const someSelected = selected.length > 0 && !allSelected;
	const toggleAll = () => onSelectedChange?.(allSelected ? [] : rows.map(rowKey));
	const toggleOne = (id) => onSelectedChange?.(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
	const handleSort = (key) => {
		if (!onSortChange) return;
		onSortChange(key, sortBy === key && sortDir === "asc" ? "desc" : "asc");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		toolbar && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, {
			sx: {
				p: 2,
				borderBottom: 1,
				borderColor: "divider"
			},
			children: toolbar
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [selectable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			padding: "checkbox",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
				checked: allSelected,
				indeterminate: someSelected,
				onChange: toggleAll
			})
		}), columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			align: col.align,
			sx: {
				width: col.width,
				whiteSpace: "nowrap"
			},
			children: col.sortable && onSortChange ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableSortLabel, {
				active: sortBy === col.key,
				direction: sortBy === col.key ? sortDir : "asc",
				onClick: () => handleSort(col.key),
				children: col.label
			}) : col.label
		}, col.key))] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [loading && Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [selectable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			padding: "checkbox",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
				variant: "rounded",
				width: 18,
				height: 18
			})
		}), columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { width: "70%" }) }, col.key))] }, `sk-${i}`)), !loading && rows.map((row) => {
			const id = rowKey(row);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
				hover: true,
				selected: selected.includes(id),
				children: [selectable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					padding: "checkbox",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						checked: selected.includes(id),
						onChange: () => toggleOne(id)
					})
				}), columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					align: col.align,
					children: col.render ? col.render(row) : row[col.key]
				}, col.key))]
			}, id);
		})] })] }) }),
		!loading && error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry }),
		!loading && !error && rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: emptyTitle,
			description: emptyDescription
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablePagination, {
			component: "div",
			count: total,
			page,
			onPageChange: (_, p) => onPageChange(p),
			rowsPerPage: pageSize,
			onRowsPerPageChange: (e) => onPageSizeChange(parseInt(e.target.value, 10)),
			rowsPerPageOptions: [
				10,
				25,
				50,
				100
			]
		})
	] });
}
//#endregion
export { DataTable as t };
