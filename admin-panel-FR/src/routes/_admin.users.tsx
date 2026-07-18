import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Box, Button, Avatar, Typography, IconButton, Tooltip, Stack } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import BlockIcon from "@mui/icons-material/BlockOutlined";
import CheckIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { SearchInput, FilterSelect, StatusChip } from "@/components/common/Filters";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PermissionGate } from "@/permissions/PermissionGate";
import { PERMISSIONS } from "@/permissions/permissions";
import { UserDetailsDrawer } from "@/components/users/UserDetailsDrawer";
import { useListParams } from "@/hooks/useListParams";
import {
  useUsers,
  useSuspendUser,
  useActivateUser,
  useDeleteUser,
} from "@/hooks/queries/useUsers";
import { initialsOf, formatDate, downloadCsv } from "@/utils/format";
import type { User } from "@/types";

export const Route = createFileRoute("/_admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin Panel" }] }),
  component: UsersPage,
});

function UsersPage() {
  const lp = useListParams({ sortBy: "createdAt", sortDir: "desc" });
  const { data, isLoading, isError, refetch, isFetching } = useUsers(lp.params);

  const suspend = useSuspendUser();
  const activate = useActivateUser();
  const remove = useDeleteUser();

  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<User | null>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [toSuspend, setToSuspend] = useState<User | null>(null);

  const rows = data?.data ?? [];

  const columns: Column<User>[] = [
    {
      key: "name",
      label: "User",
      sortable: true,
      render: (u) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: "0.8rem" }}>
            {initialsOf(u.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {u.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
              {u.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    { key: "planName", label: "Plan", render: (u) => u.planName ?? "—" },
    { key: "status", label: "Status", sortable: true, render: (u) => <StatusChip status={u.status} /> },
    { key: "billsCount", label: "Bills", align: "right", render: (u) => u.billsCount ?? 0 },
    { key: "createdAt", label: "Joined", sortable: true, render: (u) => formatDate(u.createdAt) },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (u) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => setDetail(u)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <PermissionGate permission={PERMISSIONS.USERS_SUSPEND}>
            {u.status === "suspended" ? (
              <Tooltip title="Activate">
                <IconButton size="small" color="success" onClick={() => activate.mutate(u.id)}>
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Suspend">
                <IconButton size="small" color="warning" onClick={() => setToSuspend(u)}>
                  <BlockIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.USERS_DELETE}>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => setToDelete(u)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </PermissionGate>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Manage platform users, subscriptions and access."
        actions={
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={!rows.length}
            onClick={() =>
              downloadCsv(
                rows as unknown as Record<string, unknown>[],
                "users.csv",
                [
                  { key: "name", label: "Name" },
                  { key: "email", label: "Email" },
                  { key: "status", label: "Status" },
                  { key: "planName", label: "Plan" },
                  { key: "createdAt", label: "Joined" },
                ],
              )
            }
          >
            Export CSV
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(u) => u.id}
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
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        emptyTitle="No users found"
        emptyDescription="Try adjusting your search or filters."
        toolbar={
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <SearchInput value={lp.search} onChange={lp.setSearch} placeholder="Search users…" />
            <FilterSelect
              label="Status"
              value={(lp.filters?.status as string) ?? "all"}
              onChange={(v) => lp.setFilter("status", v)}
              options={[
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Suspended", value: "suspended" },
              ]}
            />
            <Box sx={{ flex: 1 }} />
            {selected.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {selected.length} selected
              </Typography>
            )}
          </Box>
        }
      />

      <UserDetailsDrawer
        user={detail}
        open={!!detail}
        onClose={() => setDetail(null)}
        actions={
          detail && (
            <>
              <PermissionGate permission={PERMISSIONS.USERS_SUSPEND}>
                {detail.status === "suspended" ? (
                  <Button size="small" variant="outlined" color="success" onClick={() => activate.mutate(detail.id)}>
                    Activate
                  </Button>
                ) : (
                  <Button size="small" variant="outlined" color="warning" onClick={() => setToSuspend(detail)}>
                    Suspend
                  </Button>
                )}
              </PermissionGate>
              <PermissionGate permission={PERMISSIONS.USERS_DELETE}>
                <Button size="small" variant="outlined" color="error" onClick={() => setToDelete(detail)}>
                  Delete
                </Button>
              </PermissionGate>
            </>
          )
        }
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete user?"
        description={`This will permanently delete ${toDelete?.name}. This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete)
            remove.mutate(toDelete.id, {
              onSuccess: () => {
                setToDelete(null);
                setDetail(null);
              },
            });
        }}
      />

      <ConfirmDialog
        open={!!toSuspend}
        title="Suspend user?"
        description={`Are you sure you want to suspend ${toSuspend?.name}? Suspended users will not be able to log in or use the platform.`}
        confirmLabel="Suspend"
        destructive
        loading={suspend.isPending}
        onClose={() => setToSuspend(null)}
        onConfirm={() => {
          if (toSuspend)
            suspend.mutate(toSuspend.id, {
              onSuccess: () => {
                setToSuspend(null);
                setDetail(null);
              },
            });
        }}
      />
    </Box>
  );
}
