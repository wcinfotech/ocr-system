import type { ComponentType } from "react";
import DashboardIcon from "@mui/icons-material/SpaceDashboardOutlined";
import PeopleIcon from "@mui/icons-material/PeopleAltOutlined";
import SubscriptionsIcon from "@mui/icons-material/AutorenewOutlined";
import PlansIcon from "@mui/icons-material/LayersOutlined";
import BillsIcon from "@mui/icons-material/ReceiptLongOutlined";
import AnalyticsIcon from "@mui/icons-material/InsightsOutlined";
import PaymentsIcon from "@mui/icons-material/CreditCardOutlined";
import SupportIcon from "@mui/icons-material/SupportAgentOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneOutlined";
import RolesIcon from "@mui/icons-material/BadgeOutlined";
import PermissionsIcon from "@mui/icons-material/KeyOutlined";
import AdminsIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ActivityIcon from "@mui/icons-material/HistoryOutlined";
import AuditIcon from "@mui/icons-material/FactCheckOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import ProfileIcon from "@mui/icons-material/PersonOutlineOutlined";
import ArticleIcon from "@mui/icons-material/ArticleOutlined";
import { PERMISSIONS, type Permission } from "@/permissions/permissions";

export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<{ fontSize?: "small" | "medium" | "large" }>;
  /** Required permission to see the item. Undefined = always visible. */
  permission?: Permission;
  section?: string;
}

/** Sidebar navigation. Visibility is permission-driven — never hardcoded. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: DashboardIcon, permission: PERMISSIONS.DASHBOARD_VIEW, section: "Overview" },
  { label: "Users", to: "/users", icon: PeopleIcon, permission: PERMISSIONS.USERS_VIEW, section: "Management" },
  { label: "Subscriptions", to: "/subscriptions", icon: SubscriptionsIcon, permission: PERMISSIONS.SUBSCRIPTIONS_VIEW, section: "Management" },
  { label: "Plans", to: "/plans", icon: PlansIcon, permission: PERMISSIONS.PLANS_VIEW, section: "Management" },
  { label: "Bills", to: "/bills", icon: BillsIcon, permission: PERMISSIONS.BILLS_VIEW, section: "Management" },
  { label: "Payments", to: "/payments", icon: PaymentsIcon, permission: PERMISSIONS.PAYMENTS_VIEW, section: "Finance" },
  { label: "Analytics", to: "/analytics", icon: AnalyticsIcon, permission: PERMISSIONS.ANALYTICS_VIEW, section: "Finance" },
  { label: "Support Tickets", to: "/support", icon: SupportIcon, permission: PERMISSIONS.SUPPORT_VIEW, section: "Operations" },
  { label: "Blogs", to: "/blogs", icon: ArticleIcon, section: "Operations" },
  { label: "Notifications", to: "/notifications", icon: NotificationsIcon, permission: PERMISSIONS.NOTIFICATIONS_VIEW, section: "Operations" },
  { label: "Roles", to: "/roles", icon: RolesIcon, permission: PERMISSIONS.ROLES_VIEW, section: "Access Control" },
  { label: "Permissions", to: "/permissions", icon: PermissionsIcon, permission: PERMISSIONS.PERMISSIONS_VIEW, section: "Access Control" },
  { label: "Admins", to: "/admins", icon: AdminsIcon, permission: PERMISSIONS.ADMINS_VIEW, section: "Access Control" },
  { label: "Activity Logs", to: "/activity-logs", icon: ActivityIcon, permission: PERMISSIONS.ACTIVITY_LOGS_VIEW, section: "System" },
  { label: "Audit Logs", to: "/audit-logs", icon: AuditIcon, permission: PERMISSIONS.AUDIT_LOGS_VIEW, section: "System" },
  { label: "System Settings", to: "/settings", icon: SettingsIcon, permission: PERMISSIONS.SETTINGS_VIEW, section: "System" },
  { label: "Profile", to: "/profile", icon: ProfileIcon, section: "Account" },
];
