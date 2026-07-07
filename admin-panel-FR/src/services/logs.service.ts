import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { toQuery } from "@/services/api/query";
import type { ListParams, Paginated, ActivityLog, AuditLog } from "@/types";

export interface SystemSettings {
  maintenanceMode: boolean;
  maxStorageLimitMb: number;
  allowedUploadTypes: string[];
  emailNotifications: boolean;
  supportEmail: string;
  ocrRetryLimit: number;
  activityLogRetention?: boolean;
  activityLogSavePayload?: boolean;
}

export const logsService = {
  listActivityLogs: async (params: ListParams): Promise<Paginated<ActivityLog>> => {
    const { data } = await apiClient.get<Paginated<ActivityLog>>(ENDPOINTS.activityLogs.list, {
      params: toQuery(params),
    });
    return data;
  },
  listAuditLogs: async (params: ListParams): Promise<Paginated<AuditLog>> => {
    const { data } = await apiClient.get<Paginated<AuditLog>>(ENDPOINTS.auditLogs.list, {
      params: toQuery(params),
    });
    return data;
  },
  getSettings: async (): Promise<SystemSettings> => {
    const { data } = await apiClient.get<SystemSettings>(ENDPOINTS.settings.get);
    return data;
  },
  updateSettings: async (settings: SystemSettings): Promise<SystemSettings> => {
    const { data } = await apiClient.put<SystemSettings>(ENDPOINTS.settings.update, settings);
    return data;
  },
};
