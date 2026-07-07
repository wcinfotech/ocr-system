/** Formatting helpers — keep display logic consistent and DRY. */

export const formatCurrency = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(
    value ?? 0,
  );

export const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value ?? 0);

export const formatPercent = (value: number, digits = 1) =>
  `${(value ?? 0).toFixed(digits)}%`;

export const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

export const formatDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const formatBytesMb = (mb?: number) => {
  if (mb === undefined || mb === null) return "—";
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(0)} MB`;
};

export const initialsOf = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

/** Trigger a client-side CSV download from rows of objects. */
export const downloadCsv = <T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[],
) => {
  if (!rows.length) return;
  const cols = columns ?? Object.keys(rows[0]).map((k) => ({ key: k as keyof T, label: k }));
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
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
