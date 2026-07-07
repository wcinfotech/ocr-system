import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Box, Button, Typography, IconButton, Tooltip, Stack, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { SearchInput, StatusChip } from "@/components/common/Filters";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PlanFormDialog } from "@/components/plans/PlanFormDialog";
import { PermissionGate } from "@/permissions/PermissionGate";
import { PERMISSIONS } from "@/permissions/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { useListParams } from "@/hooks/useListParams";
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from "@/hooks/queries/useCatalog";
import { formatCurrency, formatBytesMb, formatNumber } from "@/utils/format";
import type { Plan } from "@/types";
import type { PlanPayload } from "@/services/catalog.service";

export const Route = createFileRoute("/_admin/plans")({
  head: () => ({ meta: [{ title: "Plans — Admin Panel" }] }),
  component: PlansPage,
});

function PlansPage() {
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.PLANS_MANAGE);
  const lp = useListParams();
  const { data, isLoading, isFetching, isError, refetch } = usePlans(lp.params);
  const create = useCreatePlan();
  const update = useUpdatePlan();
  const remove = useDeletePlan();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [toDelete, setToDelete] = useState<Plan | null>(null);

  const rows = data?.data ?? [];

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p: Plan) => {
    setEditing(p);
    setFormOpen(true);
  };

  const handleSubmit = (payload: PlanPayload) => {
    if (editing) update.mutate({ id: editing.id, payload }, { onSuccess: () => setFormOpen(false) });
    else create.mutate(payload, { onSuccess: () => setFormOpen(false) });
  };

  const columns: Column<Plan>[] = [
    { key: "name", label: "Plan", sortable: true, render: (p) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.name}</Typography> },
    { key: "price", label: "Price", align: "right", sortable: true, render: (p) => formatCurrency(p.price, p.currency) },
    { key: "ocrLimit", label: "OCR Limit", align: "right", render: (p) => formatNumber(p.ocrLimit) },
    { key: "storageMb", label: "Storage", align: "right", render: (p) => formatBytesMb(p.storageMb) },
    { key: "durationDays", label: "Duration", align: "right", render: (p) => `${p.durationDays} days` },
    {
      key: "benefits",
      label: "Benefits",
      render: (p) => (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
          {(p.benefits ?? []).slice(0, 2).map((b) => (
            <Chip key={b} size="small" variant="outlined" label={b} />
          ))}
          {(p.benefits?.length ?? 0) > 2 && <Chip size="small" label={`+${p.benefits.length - 2}`} />}
        </Stack>
      ),
    },
    { key: "status", label: "Status", render: (p) => <StatusChip status={p.status} /> },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (p) =>
        canManage ? (
          <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => openEdit(p)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => setToDelete(p)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : null,
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Plans"
        subtitle="Create and manage subscription plans."
        actions={
          <PermissionGate permission={PERMISSIONS.PLANS_MANAGE}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Create plan
            </Button>
          </PermissionGate>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(p) => p.id}
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
        emptyTitle="No plans yet"
        emptyDescription="Create your first subscription plan to get started."
        toolbar={<SearchInput value={lp.search} onChange={lp.setSearch} placeholder="Search plans…" />}
      />

      <PlanFormDialog
        open={formOpen}
        plan={editing}
        loading={create.isPending || update.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete plan?"
        description={`Delete "${toDelete?.name}"? Users on this plan may be affected.`}
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
