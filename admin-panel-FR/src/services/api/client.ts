import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/config/env";

/**
 * Single configured Axios instance for the whole app.
 * - Injects JWT access token from storage.
 * - Normalizes errors into a consistent shape.
 * - Handles 401 by clearing session (refresh hook can be added later).
 * NEVER import axios directly in components — always go through the service layer.
 */

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

const getToken = () =>
  typeof window === "undefined" ? null : window.localStorage.getItem(env.TOKEN_KEY);

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL || "/api",
  timeout: env.API_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) config.headers.set?.("Authorization", `Bearer ${token}`);
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config;
    const status = error.response?.status ?? 0;

    // Check if 401 and request can be retried
    if (status === 401 && originalRequest && !(originalRequest as any)._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.set?.("Authorization", `Bearer ${token}`);
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      (originalRequest as any)._retry = true;
      isRefreshing = true;

      const refreshToken =
        typeof window === "undefined"
          ? null
          : window.localStorage.getItem(env.REFRESH_TOKEN_KEY);

      if (refreshToken) {
        try {
          // Note: we use direct axios here to avoid triggering the interceptor recursively
          const { data } = await axios.post<{ accessToken: string; refreshToken?: string }>(
            `${apiClient.defaults.baseURL}/admin/auth/refresh`,
            { refreshToken }
          );

          const newAccessToken = data.accessToken;
          const newRefreshToken = data.refreshToken;

          if (typeof window !== "undefined") {
            window.localStorage.setItem(env.TOKEN_KEY, newAccessToken);
            if (newRefreshToken) {
              window.localStorage.setItem(env.REFRESH_TOKEN_KEY, newRefreshToken);
            }
          }

          if (originalRequest.headers) {
            originalRequest.headers.set?.("Authorization", `Bearer ${newAccessToken}`);
          }

          processQueue(null, newAccessToken);
          isRefreshing = false;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;

          // If refreshing failed, clear everything and redirect to login
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(env.TOKEN_KEY);
            window.localStorage.removeItem(env.USER_KEY);
            window.localStorage.removeItem(env.REFRESH_TOKEN_KEY);
            window.dispatchEvent(new CustomEvent("admin:unauthorized"));
          }
        }
      } else {
        // No refresh token available, logout
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(env.TOKEN_KEY);
          window.localStorage.removeItem(env.USER_KEY);
          window.dispatchEvent(new CustomEvent("admin:unauthorized"));
        }
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    const apiError: ApiError = { status, message, details: error.response?.data };
    return Promise.reject(apiError);
  },
);

export const isApiError = (e: unknown): e is ApiError =>
  typeof e === "object" && e !== null && "status" in e && "message" in e;
