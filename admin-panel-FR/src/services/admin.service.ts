import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { toQuery } from "@/services/api/query";
import type { ListParams, Paginated, Admin, RoleModel, PermissionModel } from "@/types";

export interface AdminPayload {
  name: string;
  email: string;
  password?: string;
  role: string;
  permissions: string[];
}

export const adminsService = {
  list: async (params: ListParams): Promise<Paginated<Admin>> => {
    const { data } = await apiClient.get<Paginated<Admin>>(ENDPOINTS.admins.list, {
      params: toQuery(params),
    });
    return data;
  },
  create: async (payload: AdminPayload): Promise<Admin> => {
    const { data } = await apiClient.post<Admin>(ENDPOINTS.admins.list, payload);
    return data;
  },
  update: async (id: string, payload: Partial<AdminPayload>): Promise<Admin> => {
    const { data } = await apiClient.patch<Admin>(ENDPOINTS.admins.detail(id), payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.admins.detail(id));
  },
  listRoles: async (): Promise<RoleModel[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: RoleModel[] }>(ENDPOINTS.roles.list);
    return data.data;
  },
  listPermissions: async (): Promise<PermissionModel[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: PermissionModel[] }>(ENDPOINTS.permissions.list);
    return data.data;
  },
};
