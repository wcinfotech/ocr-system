import { t as axios } from "../_libs/axios+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-DaqzDLTU.js
/**
* Centralized runtime configuration.
* All values are sourced from Vite env vars — NO hardcoded values.
*
* Configure these in your environment (e.g. .env):
*   VITE_API_BASE_URL   -> base URL of your external backend API
*   VITE_ENABLE_DEV_AUTH -> "true" to allow local UI navigation without a live backend
*/
var bool = (v, fallback = false) => v === void 0 ? fallback : v === "true" || v === "1";
var env = {
	/** Base URL for the external backend. Example: https://api.yourcompany.com */
	API_BASE_URL: "http://localhost:5091/api/v1",
	/** Request timeout in ms. */
	API_TIMEOUT: 3e4,
	/**
	* DEV-ONLY: allow signing in without a reachable backend so the UI can be
	* navigated during development. Remove / disable once the backend is wired.
	* TODO(backend): set VITE_ENABLE_DEV_AUTH=false in production.
	*/
	ENABLE_DEV_AUTH: bool("false", true),
	APP_NAME: "Admin Panel",
	/** localStorage keys */
	TOKEN_KEY: "admin_access_token",
	REFRESH_TOKEN_KEY: "admin_refresh_token",
	USER_KEY: "admin_user"
};
var getToken = () => typeof window === "undefined" ? null : window.localStorage.getItem(env.TOKEN_KEY);
var apiClient = axios.create({
	baseURL: env.API_BASE_URL || "/api",
	timeout: env.API_TIMEOUT,
	headers: { "Content-Type": "application/json" }
});
apiClient.interceptors.request.use((config) => {
	const token = getToken();
	if (token) config.headers.set?.("Authorization", `Bearer ${token}`);
	return config;
});
var isRefreshing = false;
var failedQueue = [];
var processQueue = (error, token = null) => {
	failedQueue.forEach((prom) => {
		if (error) prom.reject(error);
		else prom.resolve(token);
	});
	failedQueue = [];
};
apiClient.interceptors.response.use((response) => response, async (error) => {
	const originalRequest = error.config;
	const status = error.response?.status ?? 0;
	if (status === 401 && originalRequest && !originalRequest._retry) {
		if (isRefreshing) return new Promise((resolve, reject) => {
			failedQueue.push({
				resolve,
				reject
			});
		}).then((token) => {
			if (originalRequest.headers) originalRequest.headers.set?.("Authorization", `Bearer ${token}`);
			return apiClient(originalRequest);
		}).catch((err) => Promise.reject(err));
		originalRequest._retry = true;
		isRefreshing = true;
		const refreshToken = typeof window === "undefined" ? null : window.localStorage.getItem(env.REFRESH_TOKEN_KEY);
		if (refreshToken) try {
			const { data } = await axios.post(`${apiClient.defaults.baseURL}/admin/auth/refresh`, { refreshToken });
			const newAccessToken = data.accessToken;
			const newRefreshToken = data.refreshToken;
			if (typeof window !== "undefined") {
				window.localStorage.setItem(env.TOKEN_KEY, newAccessToken);
				if (newRefreshToken) window.localStorage.setItem(env.REFRESH_TOKEN_KEY, newRefreshToken);
			}
			if (originalRequest.headers) originalRequest.headers.set?.("Authorization", `Bearer ${newAccessToken}`);
			processQueue(null, newAccessToken);
			isRefreshing = false;
			return apiClient(originalRequest);
		} catch (refreshError) {
			processQueue(refreshError, null);
			isRefreshing = false;
			if (typeof window !== "undefined") {
				window.localStorage.removeItem(env.TOKEN_KEY);
				window.localStorage.removeItem(env.USER_KEY);
				window.localStorage.removeItem(env.REFRESH_TOKEN_KEY);
				window.dispatchEvent(new CustomEvent("admin:unauthorized"));
			}
		}
		else if (typeof window !== "undefined") {
			window.localStorage.removeItem(env.TOKEN_KEY);
			window.localStorage.removeItem(env.USER_KEY);
			window.dispatchEvent(new CustomEvent("admin:unauthorized"));
		}
	}
	const apiError = {
		status,
		message: error.response?.data?.message || error.message || "Something went wrong. Please try again.",
		details: error.response?.data
	};
	return Promise.reject(apiError);
});
var isApiError = (e) => typeof e === "object" && e !== null && "status" in e && "message" in e;
//#endregion
export { env as n, isApiError as r, apiClient as t };
