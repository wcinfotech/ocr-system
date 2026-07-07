import type { Permission, Role } from "@/permissions/permissions";

/** Generic paginated envelope returned by list endpoints. */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  avgResponseTime?: number;
}

export interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  filters?: Record<string, string | number | boolean | undefined>;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  /** Explicit permission list from backend; may include "*" wildcard. */
  permissions?: (Permission | "*")[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export type UserStatus = "active" | "inactive" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  planName?: string;
  storageUsedMb?: number;
  storageLimitMb?: number;
  billsCount?: number;
  createdAt: string;
}

export type PlanStatus = "active" | "archived";

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  ocrLimit: number;
  storageMb: number;
  durationDays: number;
  benefits: string[];
  status: PlanStatus;
  createdAt: string;
}

export type SubscriptionStatus = "active" | "expired" | "canceled" | "pending";

export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export type BillStatus = "processing" | "processed" | "failed" | "deleted";

export interface Bill {
  id: string;
  userId: string;
  userName: string;
  fileName: string;
  amount?: number;
  currency?: string;
  status: BillStatus;
  ocrConfidence?: number;
  fileUrl?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalBills: number;
  billsToday: number;
  revenue: number;
  currency: string;
  subscriptions: number;
  expiredPlans: number;
  ocrSuccessRate: number;
  storageUsedMb: number;
}

export interface TimeseriesPoint {
  label: string;
  value: number;
}

export interface DashboardCharts {
  dailyUsers: TimeseriesPoint[];
  monthlyGrowth: TimeseriesPoint[];
  revenue: TimeseriesPoint[];
  billsUpload: TimeseriesPoint[];
  topPlans: TimeseriesPoint[];
}

export type TicketPriority = "low" | "medium" | "high";
export type TicketStatus = "open" | "closed";

export interface Ticket {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  message: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: string[];
  createdAt: string;
}

export interface RoleModel {
  name: string;
  permissions: string[];
}

export interface PermissionModel {
  key: string;
  name: string;
  category: string;
}

export interface ActivityLog {
  id: string;
  adminName: string;
  action: string;
  details: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  method?: string;
  url?: string;
  statusCode?: number;
  requestBody?: any;
  responseBody?: any;
  responseTime?: number;
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  module: string;
  details: string;
  oldValues: any;
  newValues: any;
  ip: string;
  userAgent: string;
  timestamp: string;
}

