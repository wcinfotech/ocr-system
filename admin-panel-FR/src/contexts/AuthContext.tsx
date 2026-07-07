import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { env } from "@/config/env";
import { authService, type LoginPayload } from "@/services/auth.service";
import { isApiError } from "@/services/api/client";
import { ROLES } from "@/permissions/permissions";
import type { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(env.USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

/**
 * DEV-ONLY fallback user, used when VITE_ENABLE_DEV_AUTH is true and the backend
 * login endpoint is unreachable, so the UI can be navigated during development.
 * TODO(backend): remove once the external API is connected.
 */
const devUser: AuthUser = {
  id: "dev-super-admin",
  name: "Dev Super Admin",
  email: "admin@local.dev",
  role: ROLES.SUPER_ADMIN,
  permissions: ["*"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setIsInitializing(false);
    const onUnauthorized = () => setUser(null);
    window.addEventListener("admin:unauthorized", onUnauthorized);
    return () => window.removeEventListener("admin:unauthorized", onUnauthorized);
  }, []);

  const persist = useCallback((token: string, u: AuthUser, refresh?: string) => {
    window.localStorage.setItem(env.TOKEN_KEY, token);
    window.localStorage.setItem(env.USER_KEY, JSON.stringify(u));
    if (refresh) window.localStorage.setItem(env.REFRESH_TOKEN_KEY, refresh);
    setUser(u);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      try {
        const res = await authService.login(payload);
        persist(res.accessToken, res.user, res.refreshToken);
      } catch (error) {
        // If the backend is not reachable/implemented yet, allow dev sign-in.
        const notReachable = isApiError(error) && (error.status === 0 || error.status === 404);
        if (env.ENABLE_DEV_AUTH && notReachable) {
          persist("dev-token", devUser);
          return;
        }
        throw error;
      }
    },
    [persist],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* ignore network errors on logout */
    } finally {
      window.localStorage.removeItem(env.TOKEN_KEY);
      window.localStorage.removeItem(env.USER_KEY);
      window.localStorage.removeItem(env.REFRESH_TOKEN_KEY);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, isInitializing, login, logout }),
    [user, isInitializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
