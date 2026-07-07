import { Card, Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { colors } from "@/theme/theme";
import type { TimeseriesPoint } from "@/types";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  height?: number;
  action?: ReactNode;
  children: ReactNode;
}

export function ChartCard({ title, subtitle, height = 280, action, children }: ChartCardProps) {
  return (
    <Card sx={{ p: 2.5, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box>
          <Typography variant="h4">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      <Box sx={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}

const axisProps = {
  stroke: colors.textSecondary,
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

export function AreaTrend({ data, color = colors.primary }: { data: TimeseriesPoint[]; color?: string }) {
  return (
    <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
      <XAxis dataKey="label" {...axisProps} />
      <YAxis {...axisProps} />
      <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${colors.border}` }} />
      <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#grad-${color})`} />
    </AreaChart>
  );
}

export function BarSeries({ data, color = colors.info }: { data: TimeseriesPoint[]; color?: string }) {
  return (
    <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
      <XAxis dataKey="label" {...axisProps} />
      <YAxis {...axisProps} />
      <Tooltip cursor={{ fill: colors.primaryLight }} contentStyle={{ borderRadius: 12, border: `1px solid ${colors.border}` }} />
      <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={40} />
    </BarChart>
  );
}

export function LineSeries({ data, color = colors.success }: { data: TimeseriesPoint[]; color?: string }) {
  return (
    <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
      <XAxis dataKey="label" {...axisProps} />
      <YAxis {...axisProps} />
      <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${colors.border}` }} />
      <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} />
    </LineChart>
  );
}

const PIE_COLORS = [colors.primary, colors.info, colors.success, colors.warning, colors.danger];

export function DonutSeries({ data }: { data: TimeseriesPoint[] }) {
  return (
    <PieChart>
      <Pie data={data} dataKey="value" nameKey="label" innerRadius={60} outerRadius={90} paddingAngle={3}>
        {data.map((_, i) => (
          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${colors.border}` }} />
    </PieChart>
  );
}
