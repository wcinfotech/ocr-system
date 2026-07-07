import { createFileRoute } from "@tanstack/react-router";
import { Box, Typography, IconButton, Tooltip, Stack, Switch } from "@mui/material";
import RenewIcon from "@mui/icons-material/AutorenewOutlined";
import ExpireIcon from "@mui/icons-material/EventBusyOutlined";
import CancelIcon from "@mui/icons-material/CancelOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { SearchInput, FilterSelect, StatusChip } from "@/components/common/Filters";
import { PermissionGate } from "@/permissions/PermissionGate";
import { PERMISSIONS } from "@/permissions/permissions";
import { useListParams } from "@/hooks/useListParams";
import { useSubscriptions, useSubscriptionAction } from "@/hooks/queries/useCatalog";
import { formatDate } from "@/utils/format";
import type { Subscription } from "@/types";

export const Route = createFileRoute("/_admin/subscriptions")({
  head: () => ({ meta: [{ title: "Subscriptions — Admin Panel" }] }),
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const lp = useListParams({ sortBy: "endDate", sortDir: "asc" });
  const { data, isLoading, isFetching, isError, refetch } = useSubscriptions(lp.params);
  const { renew, expire, cancel } = useSubscriptionAction();

  const rows = data?.data ?? [];

  const columns: Column<Subscription>[] = [
    { key: "userName", label: "User", sortable: true, render: (s) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.userName}</Typography> },
    { key: "planName", label: "Plan" },
    { key: "status", label: "Status", render: (s) => <StatusChip status={s.status} /> },
    { key: "startDate", label: "Start", sortable: true, render: (s) => formatDate(s.startDate) },
    { key: "endDate", label: "End", sortable: true, render: (s) => formatDate(s.endDate) },
    { key: "autoRenew", label: "Auto-renew", align: "center", render: (s) => <Switch checked={s.autoRenew} size="small" readOnly /> },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (s) => (
        <PermissionGate permission={PERMISSIONS.SUBSCRIPTIONS_MANAGE}>
          <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
            <Tooltip title="Renew">
              <IconButton size="small" color="success" onClick={() => renew.mutate(s.id)}>
                <RenewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Expire">
              <IconButton size="small" color="warning" onClick={() => expire.mutate(s.id)}>
                <ExpireIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton size="small" color="error" onClick={() => cancel.mutate(s.id)}>
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </PermissionGate>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader title="Subscriptions" subtitle="Track and manage user subscriptions." />
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(s) => s.id}
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
        emptyTitle="No subscriptions"
        emptyDescription="Subscriptions will appear here once users subscribe."
        toolbar={
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <SearchInput value={lp.search} onChange={lp.setSearch} placeholder="Search subscriptions…" />
            <FilterSelect
              label="Status"
              value={(lp.filters?.status as string) ?? "all"}
              onChange={(v) => lp.setFilter("status", v)}
              options={[
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Expired", value: "expired" },
                { label: "Canceled", value: "canceled" },
                { label: "Pending", value: "pending" },
              ]}
            />
          </Box>
        }
      />
    </Box>
  );
}
