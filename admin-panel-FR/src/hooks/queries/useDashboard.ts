import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { queryKeys } from "@/hooks/queries/queryKeys";

export const useDashboardStats = () =>
  useQuery({ queryKey: queryKeys.dashboard.stats, queryFn: dashboardService.stats });

export const useDashboardCharts = () =>
  useQuery({ queryKey: queryKeys.dashboard.charts, queryFn: dashboardService.charts });

export const useRecentUsers = (limit = 5) =>
  useQuery({
    queryKey: [...queryKeys.dashboard.recentUsers, limit],
    queryFn: () => dashboardService.recentUsers(limit),
  });

export const useRecentBills = (limit = 5) =>
  useQuery({
    queryKey: [...queryKeys.dashboard.recentBills, limit],
    queryFn: () => dashboardService.recentBills(limit),
  });
