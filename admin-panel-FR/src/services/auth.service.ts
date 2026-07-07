import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { AuthUser, LoginResponse } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(ENDPOINTS.auth.login, payload);
    return data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post(ENDPOINTS.auth.logout);
  },
  me: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get<AuthUser>(ENDPOINTS.auth.me);
    return data;
  },
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.auth.forgotPassword, { email });
  },
};
