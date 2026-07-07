import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Box,
  Button,
  Avatar,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import ArrowRightIcon from "@mui/icons-material/ArrowForwardOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { SearchInput } from "@/components/common/Filters";
import { useListParams } from "@/hooks/useListParams";
import { useAuditLogs } from "@/hooks/queries/useLogs";
import { initialsOf, formatDateTime, downloadCsv } from "@/utils/format";
import type { AuditLog } from "@/types";

export const Route = createFileRoute("/_admin/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Logs — Admin Panel" }] }),
  component: AuditLogsPage,
});

function AuditLogsPage() {
  const lp = useListParams({ sortBy: "timestamp", sortDir: "desc" });
  const { data, isLoading, isError, refetch, isFetching } = useAuditLogs(lp.params);

  const [selected, setSelected] = useState<string[]>([]);
  const [detailLog, setDetailLog] = useState<AuditLog | null>(null);

  const rows = data?.data ?? [];

  const columns: Column<AuditLog>[] = [
    {
      key: "timestamp",
      label: "Timestamp",
      sortable: true,
      render: (l) => (
        <Typography variant="body2" color="text.secondary">
          {formatDateTime(l.timestamp)}
        </Typography>
      ),
    },
    {
      key: "adminName",
      label: "Changed By",
      sortable: true,
      render: (l) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main", fontSize: "0.75rem", fontWeight: 600 }}>
            {initialsOf(l.adminName)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {l.adminName}
          </Typography>
        </Box>
      ),
    },
    {
      key: "module",
      label: "Module",
      sortable: true,
      render: (l) => (
        <Chip label={l.module} size="small" variant="outlined" color="primary" sx={{ fontWeight: 550 }} />
      ),
    },
    {
      key: "action",
      label: "Action",
      sortable: true,
      render: (l) => {
        let color = "text.primary";
        if (l.action.startsWith("Delete")) color = "error.main";
        else if (l.action.startsWith("Create") || l.action.startsWith("Assign")) color = "success.main";
        else if (l.action.startsWith("Update") || l.action.startsWith("Modify")) color = "info.main";
        else if (l.action.startsWith("Suspend")) color = "warning.main";

        return (
          <Typography variant="body2" sx={{ fontWeight: 600, color }}>
            {l.action}
          </Typography>
        );
      },
    },
    {
      key: "details",
      label: "Details",
      render: (l) => (
        <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
          {l.details}
        </Typography>
      ),
    },
    {
      key: "changes",
      label: "Changes",
      align: "center",
      render: (l) => (
        <Tooltip title="View value differences">
          <IconButton size="small" color="primary" onClick={() => setDetailLog(l)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const getChangedKeys = (log: AuditLog) => {
    const oldVals = log.oldValues || {};
    const newVals = log.newValues || {};
    const keys = Array.from(new Set([...Object.keys(oldVals), ...Object.keys(newVals)]));
    return keys.filter((key) => {
      // Exclude Mongo specific fields or unchanged fields
      if (key === "_id" || key === "__v" || key === "updatedAt" || key === "createdAt") return false;
      const oldStr = typeof oldVals[key] === "object" ? JSON.stringify(oldVals[key]) : String(oldVals[key] ?? "");
      const newStr = typeof newVals[key] === "object" ? JSON.stringify(newVals[key]) : String(newVals[key] ?? "");
      return oldStr !== newStr;
    });
  };

  const renderValue = (val: any) => {
    if (val === null || val === undefined) return "—";
    if (typeof val === "boolean") return val ? "True" : "False";
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  return (
    <Box>
      <PageHeader
        title="Audit Logs"
        subtitle="Old vs new values, changed by, module and action."
        actions={
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={!rows.length}
            onClick={() =>
              downloadCsv(
                rows as unknown as Record<string, unknown>[],
                "audit-logs.csv",
                [
                  { key: "timestamp", label: "Timestamp" },
                  { key: "adminName", label: "Changed By" },
                  { key: "module", label: "Module" },
                  { key: "action", label: "Action" },
                  { key: "details", label: "Details" },
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
        rowKey={(l) => l.id}
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
        emptyTitle="No audit logs found"
        emptyDescription="Try adjusting your search or filters."
        toolbar={
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <SearchInput value={lp.search} onChange={lp.setSearch} placeholder="Search audit logs..." />
            <Box sx={{ flex: 1 }} />
            {selected.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {selected.length} selected
              </Typography>
            )}
          </Box>
        }
      />

      {/* Difference/Comparison Dialog */}
      <Dialog open={!!detailLog} onClose={() => setDetailLog(null)} maxWidth="md" fullWidth>
        {detailLog && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
                <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                  Audit Details
                </Typography>
                <Chip label={detailLog.module} size="small" color="primary" />
                <Chip label={detailLog.action} size="small" variant="outlined" />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Changed By
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {detailLog.adminName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Timestamp
                  </Typography>
                  <Typography variant="body2">
                    {formatDateTime(detailLog.timestamp)}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: { sm: "span 2" } }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Action Details
                  </Typography>
                  <Typography variant="body2">
                    {detailLog.details}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Value Differences
              </Typography>

              {getChangedKeys(detailLog).length === 0 ? (
                <Paper variant="outlined" sx={{ p: 2, textAlign: "center", bgcolor: "action.hover" }}>
                  <Typography variant="body2" color="text.secondary">
                    No field changes recorded or initial object creation.
                  </Typography>
                </Paper>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "action.hover" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Field</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Old Value</TableCell>
                        <TableCell sx={{ width: 40 }} />
                        <TableCell sx={{ fontWeight: 600 }}>New Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getChangedKeys(detailLog).map((key) => {
                        const oldVal = detailLog.oldValues?.[key];
                        const newVal = detailLog.newValues?.[key];
                        return (
                          <TableRow key={key}>
                            <TableCell sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                              {key}
                            </TableCell>
                            <TableCell sx={{ bgcolor: "error.light", color: "error.contrastText", opacity: 0.85 }}>
                              <Typography variant="body2" sx={{ fontFamily: "monospace", textDecoration: "line-through" }}>
                                {renderValue(oldVal)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <ArrowRightIcon fontSize="small" color="action" />
                            </TableCell>
                            <TableCell sx={{ bgcolor: "success.light", color: "success.contrastText", opacity: 0.85 }}>
                              <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                                {renderValue(newVal)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailLog(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
