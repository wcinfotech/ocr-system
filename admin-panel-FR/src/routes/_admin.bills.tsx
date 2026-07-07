import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Box, Typography, IconButton, Tooltip, Stack } from "@mui/material";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import RestoreIcon from "@mui/icons-material/RestoreOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { SearchInput, FilterSelect, StatusChip } from "@/components/common/Filters";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PermissionGate } from "@/permissions/PermissionGate";
import { PERMISSIONS } from "@/permissions/permissions";
import { useListParams } from "@/hooks/useListParams";
import { useBills, useDeleteBill, useRestoreBill } from "@/hooks/queries/useCatalog";
import { formatCurrency, formatDate, formatPercent } from "@/utils/format";
import type { Bill } from "@/types";

export const Route = createFileRoute("/_admin/bills")({
  head: () => ({ meta: [{ title: "Bills — Admin Panel" }] }),
  component: BillsPage,
});

function BillsPage() {
  const lp = useListParams({ sortBy: "createdAt", sortDir: "desc" });
  const { data, isLoading, isFetching, isError, refetch } = useBills(lp.params);
  const remove = useDeleteBill();
  const restore = useRestoreBill();
  const [toDelete, setToDelete] = useState<Bill | null>(null);

  const rows = data?.data ?? [];

  const columns: Column<Bill>[] = [
    { key: "fileName", label: "Bill", sortable: true, render: (b) => <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{b.fileName}</Typography> },
    { key: "userName", label: "User" },
    { key: "amount", label: "Amount", align: "right", render: (b) => (b.amount ? formatCurrency(b.amount, b.currency) : "—") },
    { key: "ocrConfidence", label: "OCR", align: "right", render: (b) => (b.ocrConfidence != null ? formatPercent(b.ocrConfidence) : "—") },
    { key: "status", label: "Status", render: (b) => <StatusChip status={b.status} /> },
    { key: "createdAt", label: "Uploaded", sortable: true, render: (b) => formatDate(b.createdAt) },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (b) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
          {b.fileUrl && (
            <Tooltip title="Download">
              <IconButton size="small" component="a" href={b.fileUrl} target="_blank" rel="noopener">
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <PermissionGate permission={PERMISSIONS.BILLS_MANAGE}>
            {b.status === "deleted" ? (
              <Tooltip title="Restore">
                <IconButton size="small" color="success" onClick={() => restore.mutate(b.id)}>
                  <RestoreIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={() => setToDelete(b)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </PermissionGate>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader title="Bills" subtitle="All uploaded bills, OCR results and processing status." />
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(b) => b.id}
        total={data?.total ?? 0}
        page={lp.page}
        pageSize={lp.pageSize}
        onPageChange={lp.setPage}
        onPageSizeChange={lp.setPageSize}
        sortBy={lp.sortBy}
        sortDir={lp.sortDir}
        onSortChange={lp.setSort}
        loading={isLoading || isFetching}
        error={isError}
        onRetry={refetch}
        emptyTitle="No bills found"
        emptyDescription="Uploaded bills will appear here."
        toolbar={
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <SearchInput value={lp.search} onChange={lp.setSearch} placeholder="Search bills…" />
            <FilterSelect
              label="Status"
              value={(lp.filters?.status as string) ?? "all"}
              onChange={(v) => lp.setFilter("status", v)}
              options={[
                { label: "All", value: "all" },
                { label: "Processing", value: "processing" },
                { label: "Processed", value: "processed" },
                { label: "Failed", value: "failed" },
                { label: "Deleted", value: "deleted" },
              ]}
            />
          </Box>
        }
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete bill?"
        description={`Delete "${toDelete?.fileName}"? You can restore it later.`}
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </Box>
  );
}
