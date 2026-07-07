import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { toQuery } from "@/services/api/query";
import type {
  DashboardCharts,
  DashboardStats,
  ListParams,
  Paginated,
  User,
  Bill,
} from "@/types";

export const dashboardService = {
  stats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>(ENDPOINTS.dashboard.stats);
    return data;
  },
  charts: async (): Promise<DashboardCharts> => {
    const { data } = await apiClient.get<DashboardCharts>(ENDPOINTS.dashboard.charts);
    return data;
  },
  recentUsers: async (limit = 5): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>(ENDPOINTS.dashboard.recentUsers, {
      params: { limit },
    });
    return data;
  },
  recentBills: async (limit = 5): Promise<Bill[]> => {
    const { data } = await apiClient.get<Bill[]>(ENDPOINTS.dashboard.recentBills, {
      params: { limit },
    });
    return data;
  },
};

export const usersService = {
  list: async (params: ListParams): Promise<Paginated<User>> => {
    const { data } = await apiClient.get<Paginated<User>>(ENDPOINTS.users.list, {
      params: toQuery(params),
    });
    return data;
  },
  detail: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<User>(ENDPOINTS.users.detail(id));
    return data;
  },
  update: async (id: string, payload: Partial<User>): Promise<User> => {
    const { data } = await apiClient.patch<User>(ENDPOINTS.users.detail(id), payload);
    return data;
  },
  suspend: async (id: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.users.suspend(id));
  },
  activate: async (id: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.users.activate(id));
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.users.detail(id));
  },
};
