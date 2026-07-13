//#region node_modules/.nitro/vite/services/ssr/assets/format-CPIzLQoT.js
/** Formatting helpers — keep display logic consistent and DRY. */
var formatCurrency = (value, currency = "USD") => new Intl.NumberFormat("en-US", {
	style: "currency",
	currency,
	maximumFractionDigits: 0
}).format(value ?? 0);
var formatNumber = (value) => new Intl.NumberFormat("en-US").format(value ?? 0);
var formatPercent = (value, digits = 1) => `${(value ?? 0).toFixed(digits)}%`;
var formatDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-US", {
	year: "numeric",
	month: "short",
	day: "numeric"
}) : "—";
var formatDateTime = (iso) => iso ? new Date(iso).toLocaleString("en-US", {
	year: "numeric",
	month: "short",
	day: "numeric",
	hour: "2-digit",
	minute: "2-digit"
}) : "—";
var formatBytesMb = (mb) => {
	if (mb === void 0 || mb === null) return "—";
	if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
	return `${mb.toFixed(0)} MB`;
};
var initialsOf = (name) => (name ?? "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
/** Trigger a client-side CSV download from rows of objects. */
var downloadCsv = (rows, filename, columns) => {
	if (!rows.length) return;
	const cols = columns ?? Object.keys(rows[0]).map((k) => ({
		key: k,
		label: k
	}));
	const escape = (v) => `"${String(v ?? "").replace(/"/g, "\"\"")}"`;
	const header = cols.map((c) => escape(c.label)).join(",");
	const body = rows.map((r) => cols.map((c) => escape(r[c.key])).join(",")).join("\n");
	const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
};
//#endregion
export { formatDateTime as a, initialsOf as c, formatDate as i, formatBytesMb as n, formatNumber as o, formatCurrency as r, formatPercent as s, downloadCsv as t };
