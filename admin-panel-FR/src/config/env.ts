/**
 * Centralized runtime configuration.
 * All values are sourced from Vite env vars — NO hardcoded values.
 *
 * Configure these in your environment (e.g. .env):
 *   VITE_API_BASE_URL   -> base URL of your external backend API
 *   VITE_ENABLE_DEV_AUTH -> "true" to allow local UI navigation without a live backend
 */

const bool = (v: string | undefined, fallback = false) =>
  v === undefined ? fallback : v === "true" || v === "1";

let apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
if (apiBaseUrl && !apiBaseUrl.startsWith("http://") && !apiBaseUrl.startsWith("https://")) {
  apiBaseUrl = `https://${apiBaseUrl}`;
}

export const env = {
  /** Base URL for the external backend. Example: https://api.yourcompany.com */
  API_BASE_URL: apiBaseUrl,
  /** Request timeout in ms. */
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT ?? 30000),
  /**
   * DEV-ONLY: allow signing in without a reachable backend so the UI can be
   * navigated during development. Remove / disable once the backend is wired.
   * TODO(backend): set VITE_ENABLE_DEV_AUTH=false in production.
   */
  ENABLE_DEV_AUTH: bool(import.meta.env.VITE_ENABLE_DEV_AUTH, true),
  APP_NAME: import.meta.env.VITE_APP_NAME ?? "Admin Panel",
  /** localStorage keys */
  TOKEN_KEY: "admin_access_token",
  REFRESH_TOKEN_KEY: "admin_refresh_token",
  USER_KEY: "admin_user",
} as const;
