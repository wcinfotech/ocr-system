import { o as __toESM } from "../_runtime.mjs";
import { en as require_jsx_runtime, ot as Search_default } from "../_libs/@mui/icons-material+[...].mjs";
import { n as require_react } from "../_libs/@ckeditor/ckeditor5-react+[...].mjs";
import { E as InputAdornment, K as Chip, _ as MenuItem, t as TextField } from "../_libs/@mui/material+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Filters-DJMF8a9f.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Debounced search input to avoid firing a request on every keystroke. */
function SearchInput({ value, onChange, placeholder = "Search…", debounceMs = 350 }) {
	const [local, setLocal] = (0, import_react.useState)(value);
	(0, import_react.useEffect)(() => setLocal(value), [value]);
	(0, import_react.useEffect)(() => {
		const t = setTimeout(() => {
			if (local !== value) onChange(local);
		}, debounceMs);
		return () => clearTimeout(t);
	}, [local]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
		size: "small",
		value: local,
		onChange: (e) => setLocal(e.target.value),
		placeholder,
		slotProps: { input: { startAdornment: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputAdornment, {
			position: "start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search_default, { fontSize: "small" })
		}) } },
		sx: { minWidth: {
			xs: "100%",
			sm: 260
		} }
	});
}
function FilterSelect({ label, value, options, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
		select: true,
		size: "small",
		label,
		value,
		onChange: (e) => onChange(e.target.value),
		sx: { minWidth: 150 },
		children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItem, {
			value: o.value,
			children: o.label
		}, o.value))
	});
}
var STATUS_COLOR = {
	active: "success",
	processed: "success",
	inactive: "default",
	pending: "warning",
	processing: "warning",
	suspended: "error",
	failed: "error",
	expired: "error",
	canceled: "default",
	deleted: "error",
	archived: "default",
	open: "warning",
	closed: "success"
};
function StatusChip({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
		size: "small",
		label: status.charAt(0).toUpperCase() + status.slice(1),
		color: STATUS_COLOR[status] ?? "default",
		variant: STATUS_COLOR[status] === "default" || !STATUS_COLOR[status] ? "outlined" : "filled",
		sx: { "& .MuiChip-label": { px: 1.25 } }
	});
}
//#endregion
export { SearchInput as n, StatusChip as r, FilterSelect as t };
