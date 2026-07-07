import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Box, Button, Avatar, Typography, IconButton, Tooltip, Stack, Chip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import DoneIcon from "@mui/icons-material/DoneOutlined";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { SearchInput, FilterSelect, StatusChip } from "@/components/common/Filters";
import { PermissionGate } from "@/permissions/PermissionGate";
import { PERMISSIONS } from "@/permissions/permissions";
import { TicketDetailsDrawer } from "@/components/support/TicketDetailsDrawer";
import { useListParams } from "@/hooks/useListParams";
import { useTickets, useReplyTicket } from "@/hooks/queries/useTickets";
import { initialsOf, formatDate, downloadCsv } from "@/utils/format";
import type { Ticket } from "@/types";

export const Route = createFileRoute("/_admin/support")({
  head: () => ({ meta: [{ title: "Support Tickets — Admin Panel" }] }),
  component: SupportPage,
});

function SupportPage() {
  const lp = useListParams({ sortBy: "createdAt", sortDir: "desc" });
  const { data, isLoading, isError, refetch, isFetching } = useTickets(lp.params);
  const replyMutation = useReplyTicket();

  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Ticket | null>(null);

  const rows = data?.data ?? [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      default:
        return "info";
    }
  };

  const handleCloseTicket = (id: string) => {
    replyMutation.mutate({
      id,
      payload: {
        reply: "Ticket closed by administrator.",
        close: true,
      },
    });
  };

  const columns: Column<Ticket>[] = [
    {
      key: "ticketId",
      label: "Ticket ID",
      sortable: true,
      render: (t) => (
        <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700 }}>
          {t.ticketId}
        </Typography>
      ),
    },
    {
      key: "userName",
      label: "User",
      render: (t) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: "info.main", fontSize: "0.8rem" }}>
            {initialsOf(t.userName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {t.userName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
              {t.userEmail}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      render: (t) => (
        <Box sx={{ maxWidth: 300, minWidth: 150 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {t.subject}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
            {t.message}
          </Typography>
        </Box>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (t) => t.category || "General",
    },
    {
      key: "priority",
      label: "Priority",
      render: (t) => (
        <Chip
          size="small"
          label={t.priority.toUpperCase()}
          color={getPriorityColor(t.priority)}
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: "0.65rem", height: 20 }}
        />
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (t) => (
        <StatusChip status={t.status} />
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (t) => formatDate(t.createdAt),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (t) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
          <Tooltip title="View Details / Reply">
            <IconButton size="small" onClick={() => setDetail(t)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {t.status === "open" && (
            <PermissionGate permission={PERMISSIONS.SUPPORT_MANAGE}>
              <Tooltip title="Mark as Resolved">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => handleCloseTicket(t.id)}
                  disabled={replyMutation.isPending}
                >
                  <DoneIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGate>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Support Tickets"
        subtitle="Manage customer queries, technical requests, and system feedback."
        actions={
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={!rows.length}
            onClick={() =>
              downloadCsv(
                rows as unknown as Record<string, unknown>[],
                "tickets.csv",
                [
                  { key: "ticketId", label: "Ticket ID" },
                  { key: "userName", label: "User Name" },
                  { key: "userEmail", label: "User Email" },
                  { key: "subject", label: "Subject" },
                  { key: "category", label: "Category" },
                  { key: "priority", label: "Priority" },
                  { key: "status", label: "Status" },
                  { key: "createdAt", label: "Created" },
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
        rowKey={(t) => t.id}
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
        emptyTitle="No tickets found"
        emptyDescription="All issues resolved! Or try adjusting search filters."
        toolbar={
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <SearchInput value={lp.search} onChange={lp.setSearch} placeholder="Search tickets…" />
            <FilterSelect
              label="Status"
              value={(lp.filters?.status as string) ?? "all"}
              onChange={(v) => lp.setFilter("status", v)}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Open", value: "open" },
                { label: "Closed", value: "closed" },
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

      <TicketDetailsDrawer
        ticket={detail}
        open={!!detail}
        onClose={() => setDetail(null)}
      />
    </Box>
  );
}

