import { createFileRoute } from "@tanstack/react-router";
import { Box, Card, Typography, Avatar, Chip } from "@mui/material";
import PeopleIcon from "@mui/icons-material/PeopleAltOutlined";
import ActiveIcon from "@mui/icons-material/HowToRegOutlined";
import InactiveIcon from "@mui/icons-material/PersonOffOutlined";
import BillsIcon from "@mui/icons-material/ReceiptLongOutlined";
import TodayIcon from "@mui/icons-material/TodayOutlined";
import RevenueIcon from "@mui/icons-material/PaymentsOutlined";
import SubsIcon from "@mui/icons-material/AutorenewOutlined";
import ExpiredIcon from "@mui/icons-material/EventBusyOutlined";
import OcrIcon from "@mui/icons-material/DocumentScannerOutlined";
import StorageIcon from "@mui/icons-material/CloudOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { ChartCard, AreaTrend, BarSeries, LineSeries, DonutSeries } from "@/components/common/Charts";
import { EmptyState, ErrorState, Loader } from "@/components/common/States";
import { StatusChip } from "@/components/common/Filters";
import {
  useDashboardStats,
  useDashboardCharts,
  useRecentUsers,
  useRecentBills,
} from "@/hooks/queries/useDashboard";
import { colors } from "@/theme/theme";
import { formatCurrency, formatNumber, formatPercent, formatBytesMb, formatDate, initialsOf } from "@/utils/format";

export const Route = createFileRoute("/_admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Admin Panel" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const stats = useDashboardStats();
  const charts = useDashboardCharts();
  const recentUsers = useRecentUsers();
  const recentBills = useRecentBills();

  const s = stats.data;
  const cards = [
    { label: "Total Users", value: s ? formatNumber(s.totalUsers) : "—", icon: PeopleIcon, color: colors.primary },
    { label: "Active Users", value: s ? formatNumber(s.activeUsers) : "—", icon: ActiveIcon, color: colors.success },
    { label: "Inactive Users", value: s ? formatNumber(s.inactiveUsers) : "—", icon: InactiveIcon, color: colors.textSecondary },
    { label: "Total Bills", value: s ? formatNumber(s.totalBills) : "—", icon: BillsIcon, color: colors.info },
    { label: "Bills Today", value: s ? formatNumber(s.billsToday) : "—", icon: TodayIcon, color: colors.warning },
    { label: "Revenue", value: s ? formatCurrency(s.revenue, s.currency) : "—", icon: RevenueIcon, color: colors.primary },
    { label: "Subscriptions", value: s ? formatNumber(s.subscriptions) : "—", icon: SubsIcon, color: colors.success },
    { label: "Expired Plans", value: s ? formatNumber(s.expiredPlans) : "—", icon: ExpiredIcon, color: colors.danger },
    { label: "OCR Success Rate", value: s ? formatPercent(s.ocrSuccessRate) : "—", icon: OcrIcon, color: colors.info },
    { label: "Storage Used", value: s ? formatBytesMb(s.storageUsedMb) : "—", icon: StorageIcon, color: colors.warning },
  ];

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Overview of platform performance and activity." />

      {stats.isError ? (
        <ErrorState message="Could not load dashboard metrics." onRetry={() => stats.refetch()} />
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" },
            mb: 3,
          }}
        >
          {cards.map((c, i) => (
            <StatCard key={c.label} {...c} loading={stats.isLoading} index={i} />
          ))}
        </Box>
      )}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, mb: 3 }}>
        <ChartCard title="Revenue" subtitle="Revenue over time">
          {charts.data ? <AreaTrend data={charts.data.revenue} /> : <EmptyChart loading={charts.isLoading} />}
        </ChartCard>
        <ChartCard title="Top Plans" subtitle="Distribution by plan">
          {charts.data ? <DonutSeries data={charts.data.topPlans} /> : <EmptyChart loading={charts.isLoading} />}
        </ChartCard>
      </Box>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, mb: 3 }}>
        <ChartCard title="Daily Users" height={220}>
          {charts.data ? <LineSeries data={charts.data.dailyUsers} /> : <EmptyChart loading={charts.isLoading} />}
        </ChartCard>
        <ChartCard title="Monthly Growth" height={220}>
          {charts.data ? <AreaTrend data={charts.data.monthlyGrowth} color={colors.success} /> : <EmptyChart loading={charts.isLoading} />}
        </ChartCard>
        <ChartCard title="Bills Upload" height={220}>
          {charts.data ? <BarSeries data={charts.data.billsUpload} /> : <EmptyChart loading={charts.isLoading} />}
        </ChartCard>
      </Box>

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <RecentList
          title="Latest Users"
          loading={recentUsers.isLoading}
          error={recentUsers.isError}
          empty={!recentUsers.data?.length}
          rows={(recentUsers.data ?? []).map((u) => (
            <Box key={u.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.25 }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: "0.8rem" }}>
                {initialsOf(u.name)}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                  {u.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                  {u.email}
                </Typography>
              </Box>
              <StatusChip status={u.status} />
            </Box>
          ))}
        />
        <RecentList
          title="Latest Bills"
          loading={recentBills.isLoading}
          error={recentBills.isError}
          empty={!recentBills.data?.length}
          rows={(recentBills.data ?? []).map((b) => (
            <Box key={b.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.25 }}>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                  {b.fileName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                  {b.userName} · {formatDate(b.createdAt)}
                </Typography>
              </Box>
              <Chip size="small" variant="outlined" label={b.amount ? formatCurrency(b.amount, b.currency) : "—"} />
              <StatusChip status={b.status} />
            </Box>
          ))}
        />
      </Box>
    </Box>
  );
}

function EmptyChart({ loading }: { loading?: boolean }) {
  return loading ? <Loader minHeight={200} /> : <EmptyState title="No data" description="Metrics will appear once available." />;
}

function RecentList({
  title,
  rows,
  loading,
  error,
  empty,
}: {
  title: string;
  rows: React.ReactNode[];
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
}) {
  return (
    <Card sx={{ p: 2.5 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {loading ? (
        <Loader minHeight={200} />
      ) : error ? (
        <ErrorState />
      ) : empty ? (
        <EmptyState title="Nothing yet" description="No recent records." />
      ) : (
        <Box sx={{ divide: 1 }}>{rows}</Box>
      )}
    </Card>
  );
}
