/** Centralized TanStack Query keys to keep cache invalidation consistent. */
import type { ListParams } from "@/types";

export const queryKeys = {
  dashboard: {
    stats: ["dashboard", "stats"] as const,
    charts: ["dashboard", "charts"] as const,
    recentUsers: ["dashboard", "recent-users"] as const,
    recentBills: ["dashboard", "recent-bills"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (p: ListParams) => ["users", "list", p] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  plans: {
    all: ["plans"] as const,
    list: (p: ListParams) => ["plans", "list", p] as const,
  },
  subscriptions: {
    all: ["subscriptions"] as const,
    list: (p: ListParams) => ["subscriptions", "list", p] as const,
  },
  bills: {
    all: ["bills"] as const,
    list: (p: ListParams) => ["bills", "list", p] as const,
  },
  tickets: {
    all: ["tickets"] as const,
    list: (p: ListParams) => ["tickets", "list", p] as const,
    detail: (id: string) => ["tickets", "detail", id] as const,
  },
  admins: {
    all: ["admins"] as const,
    list: (p: ListParams) => ["admins", "list", p] as const,
    detail: (id: string) => ["admins", "detail", id] as const,
  },
  roles: {
    all: ["roles"] as const,
  },
  permissions: {
    all: ["permissions"] as const,
  },
  activityLogs: {
    list: (p: ListParams) => ["activityLogs", "list", p] as const,
  },
  auditLogs: {
    list: (p: ListParams) => ["auditLogs", "list", p] as const,
  },
  settings: {
    all: ["settings"] as const,
  },
} as const;
