import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Tooltip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import CodeIcon from "@mui/icons-material/CodeOutlined";
import { DataTable, type Column } from "@/components/common/DataTable";
import { useListParams } from "@/hooks/useListParams";
import { useActivityLogs, useSettings, useUpdateSettings } from "@/hooks/queries/useLogs";
import { formatDateTime } from "@/utils/format";
import type { ActivityLog } from "@/types";

export const Route = createFileRoute("/_admin/activity-logs")({
  head: () => ({ meta: [{ title: "API Logs — Admin Panel" }] }),
  component: ActivityLogsPage,
});

function ActivityLogsPage() {
  const lp = useListParams({ sortBy: "timestamp", sortDir: "desc", pageSize: 20 });

  // Local filter states matching the UI controls
  const [searchText, setSearchText] = useState(lp.search || "");
  const [methodFilter, setMethodFilter] = useState((lp.filters?.method as string) || "All methods");
  const [statusFilter, setStatusFilter] = useState((lp.filters?.statusCode as string) || "Status code");
  const [dateFilter, setDateFilter] = useState((lp.filters?.date as string) || "");

  const { data, isLoading, isError, refetch, isFetching } = useActivityLogs(lp.params);
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [selectedPayloadLog, setSelectedPayloadLog] = useState<ActivityLog | null>(null);

  const rows = data?.data ?? [];
  const totalLogs = data?.total ?? 0;
  const totalPages = Math.ceil(totalLogs / lp.pageSize) || 1;
  const currentPageStr = `${lp.page + 1} / ${totalPages}`;
  const pageSizeStr = `${lp.pageSize}`;
  const avgResponseStr = `${data?.avgResponseTime ?? 0} ms`;

  const capturedRowsOnPage = rows.filter((l) => l.requestBody || l.responseBody).length;

  const handleRetentionToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    updateSettings.mutate({
      ...settings,
      activityLogRetention: e.target.checked,
    });
  };

  const handlePayloadToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    updateSettings.mutate({
      ...settings,
      activityLogSavePayload: e.target.checked,
    });
  };

  const handleApplyFilters = () => {
    lp.setSearch(searchText);
    lp.setFilter("method", methodFilter !== "All methods" ? methodFilter : "");
    lp.setFilter("statusCode", statusFilter !== "Status code" ? statusFilter : "");
    lp.setFilter("date", dateFilter);
  };

  const handleResetFilters = () => {
    setSearchText("");
    setMethodFilter("All methods");
    setStatusFilter("Status code");
    setDateFilter("");

    lp.setSearch("");
    lp.setFilter("method", "");
    lp.setFilter("statusCode", "");
    lp.setFilter("date", "");
  };

  const columns: Column<ActivityLog>[] = [
    {
      key: "timestamp",
      label: "TIME",
      sortable: true,
      render: (l) => (
        <Typography variant="body2" color="text.secondary">
          {formatDateTime(l.timestamp)}
        </Typography>
      ),
    },
    {
      key: "method",
      label: "METHOD",
      render: (l) => (
        <Box
          sx={{
            bgcolor: "grey.100",
            color: "text.primary",
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            display: "inline-block",
            fontFamily: "monospace",
            fontWeight: 700,
            fontSize: "0.75rem",
          }}
        >
          {l.method || "GET"}
        </Box>
      ),
    },
    {
      key: "url",
      label: "ENDPOINT",
      render: (l) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            color: "text.primary",
            fontWeight: 500,
            wordBreak: "break-all",
          }}
        >
          {l.url || l.action || "—"}
        </Typography>
      ),
    },
    {
      key: "statusCode",
      label: "STATUS",
      render: (l) => {
        const code = l.statusCode || 200;
        let bgColor = "#5c6bc0"; // purple/indigo
        if (code >= 400) bgColor = "#ef5350"; // red
        else if (code >= 300) bgColor = "#ff9800"; // orange
        else if (code >= 201 && code < 300) bgColor = "#4caf50"; // green

        return (
          <Box
            sx={{
              bgcolor: bgColor,
              color: "#fff",
              px: 1.5,
              py: 0.5,
              borderRadius: 3,
              display: "inline-block",
              fontWeight: 700,
              fontSize: "0.75rem",
              textAlign: "center",
              minWidth: 40,
            }}
          >
            {code}
          </Box>
        );
      },
    },
    {
      key: "adminName",
      label: "ACTOR",
      render: (l) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {l.adminName || "Guest"}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
            {l.ip || "127.0.0.1"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "responseTime",
      label: "RESPONSE TIME",
      render: (l) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: "text.secondary" }}>
          {l.responseTime !== undefined ? `${l.responseTime} ms` : "—"}
        </Typography>
      ),
    },
    {
      key: "payload",
      label: "",
      align: "center",
      render: (l) => {
        const hasPayload = !!l.requestBody || !!l.responseBody;
        if (!hasPayload) return <Typography variant="caption" color="text.disabled">—</Typography>;

        return (
          <Tooltip title="View Request/Response Payloads">
            <IconButton size="small" color="primary" onClick={() => setSelectedPayloadLog(l)}>
              <CodeIcon fontSize="small" sx={{ color: "#7c4dff" }} />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 1 }}>
      {/* Title Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 4, height: 28, bgcolor: "#8b5cf6", borderRadius: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 750, color: "text.primary", fontSize: "1.5rem" }}>
              API Logs
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: "0.85rem" }}>
            All API request logs from backend, with filters, response capture toggle, and request/response inspector
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          sx={{
            color: "text.primary",
            borderColor: "grey.300",
            textTransform: "none",
            fontWeight: 500,
            px: 2,
            "&:hover": { borderColor: "grey.400", bgcolor: "grey.50" },
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards Section */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2.5, mb: 4 }}>
        {[
          { label: "Total Logs", value: totalLogs.toLocaleString() },
          { label: "Current Page", value: currentPageStr },
          { label: "Page Size", value: pageSizeStr },
          { label: "Avg Response", value: avgResponseStr },
        ].map((card, idx) => (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.100",
              bgcolor: "#fafafa",
              "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.02)" },
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 550 }}>
              {card.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: "text.primary", fontSize: "1.8rem" }}>
              {card.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Filter and Switch Configuration Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.100",
          bgcolor: "background.paper",
          mb: 3,
        }}
      >
        {/* Filters Row */}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search path, method, IP, user-agent"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 260 }}
          />

          <Select
            size="small"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="All methods">All methods</MenuItem>
            <MenuItem value="GET">GET</MenuItem>
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="PUT">PUT</MenuItem>
            <MenuItem value="DELETE">DELETE</MenuItem>
            <MenuItem value="PATCH">PATCH</MenuItem>
          </Select>

          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="Status code">Status code</MenuItem>
            <MenuItem value="200">200</MenuItem>
            <MenuItem value="201">201</MenuItem>
            <MenuItem value="204">204</MenuItem>
            <MenuItem value="400">400</MenuItem>
            <MenuItem value="401">401</MenuItem>
            <MenuItem value="403">403</MenuItem>
            <MenuItem value="404">404</MenuItem>
            <MenuItem value="500">500</MenuItem>
          </Select>

          <TextField
            size="small"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          />

          <Button
            variant="contained"
            onClick={handleApplyFilters}
            startIcon={<SearchIcon />}
            sx={{
              bgcolor: "#7c4dff",
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "#651fff" },
            }}
          >
            Apply Filters
          </Button>

          <Button
            variant="outlined"
            onClick={handleResetFilters}
            startIcon={<RotateLeftIcon />}
            sx={{
              color: "text.primary",
              borderColor: "grey.300",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": { borderColor: "grey.400", bgcolor: "grey.50" },
            }}
          >
            Reset
          </Button>

          <Select
            size="small"
            value={lp.pageSize}
            onChange={(e) => lp.setPageSize(Number(e.target.value))}
            sx={{ minWidth: 110, ml: "auto" }}
          >
            <MenuItem value={10}>10 / page</MenuItem>
            <MenuItem value={20}>20 / page</MenuItem>
            <MenuItem value={50}>50 / page</MenuItem>
            <MenuItem value={100}>100 / page</MenuItem>
          </Select>
        </Box>

        {/* Capture responses sub-row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 2,
            borderTop: "1px dashed",
            borderColor: "grey.200",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
            {/* Capture responses Switch */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <Switch
                checked={settings?.activityLogSavePayload ?? false}
                onChange={handlePayloadToggle}
                disabled={settingsLoading || updateSettings.isPending}
                size="small"
                color="primary"
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                  Capture responses
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Only request metadata/body is saved. View icon appears only for rows with stored response.
                </Typography>
              </Box>
            </Box>

            {/* 7-Day Retention Switch */}
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <Switch
                checked={settings?.activityLogRetention ?? false}
                onChange={handleRetentionToggle}
                disabled={settingsLoading || updateSettings.isPending}
                size="small"
                color="primary"
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                  7-Day Retention
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Automatically delete logs older than 7 days from the system.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
              Captured rows on page: {capturedRowsOnPage}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main logs list table */}
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(l) => l.id}
        total={totalLogs}
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
        emptyTitle="No activity logs found"
        emptyDescription="Try adjusting your search or filters."
      />

      {/* Payload Viewer Dialog */}
      <Dialog open={!!selectedPayloadLog} onClose={() => setSelectedPayloadLog(null)} maxWidth="md" fullWidth>
        {selectedPayloadLog && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                API Payload Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {selectedPayloadLog.method} {selectedPayloadLog.url} ({selectedPayloadLog.statusCode ?? 200})
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}>
                    Request Body
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      maxHeight: 400,
                      overflowY: "auto",
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {selectedPayloadLog.requestBody
                      ? JSON.stringify(selectedPayloadLog.requestBody, null, 2)
                      : "No request body payload"}
                  </Paper>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}>
                    Response Body
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      maxHeight: 400,
                      overflowY: "auto",
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {selectedPayloadLog.responseBody
                      ? JSON.stringify(selectedPayloadLog.responseBody, null, 2)
                      : "No response body payload"}
                  </Paper>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedPayloadLog(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
