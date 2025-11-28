import { RolePermissions } from "@/types/role";

export type UserRole =
  | "super_admin"
  | "admin"
  | "operator"
  | "support" // Keeping for legacy/alias, but mapping to IT Support if needed or just general support
  | "driver"
  | "rider"
  | "finance"
  | "hr"
  | "it_support";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  OPERATOR: "operator",
  SUPPORT: "support",
  DRIVER: "driver",
  RIDER: "rider",
  FINANCE: "finance",
  HR: "hr",
  IT_SUPPORT: "it_support",
} as const;

export const MODULES = {
  DASHBOARD: "dashboard",
  FLEET: "fleet",
  RIDERS: "riders",
  DRIVERS: "drivers",
  BOOKINGS: "bookings",
  FINANCE: "finance",
  HR: "hr",
  SETTINGS: "settings",
  PRICING: "pricing", // New module for pricing
  IT: "it", // New module for IT devices/systems
  REPORTS: "reports",
  SUPPORT: "support",
  MARKETING: "marketing",
  OPERATIONS: "operations",
  USERS: "users", // Explicitly adding users
} as const;

export const PERMISSIONS: Record<string, RolePermissions> = {
  [ROLES.SUPER_ADMIN]: {
    "*": { manage: true },
    users: { create: true, read: true, update: true, delete: true },
    operators: { create: true, read: true, update: true, delete: true },
    drivers: { create: true, read: true, update: true, delete: true },
    riders: { create: true, read: true, update: true, delete: true },
    rides: { create: true, read: true, update: true, delete: true },
    payments: { read: true, refund: true },
    settings: { read: true, update: true },
    pricing: { read: true, update: true },
    it: { read: true, manage: true },
    dashboard: { view: true },
    reports: { view: true },
    finance: { read: true, manage: true },
    hr: { read: true, manage: true },
    support: { read: true, manage: true },
    marketing: { read: true, manage: true },
    fleet: { read: true, manage: true },
    operations: { read: true, manage: true },
  },
  [ROLES.ADMIN]: {
    // Same as Super Admin for now based on "Super User (Admin / Platform Owner)"
    users: { create: true, read: true, update: true, delete: true },
    operators: { create: true, read: true, update: true, delete: true },
    drivers: { create: true, read: true, update: true, delete: true },
    riders: { create: true, read: true, update: true, delete: true },
    rides: { create: true, read: true, update: true, delete: true },
    payments: { read: true, refund: true },
    settings: { read: true, update: true },
    pricing: { read: true, update: true },
    it: { read: true, manage: true },
    dashboard: { view: true },
    reports: { view: true },
    finance: { read: true, manage: true },
    hr: { read: true, manage: true },
    support: { read: true, manage: true },
    marketing: { read: true, manage: true },
    fleet: { read: true, manage: true },
    operations: { read: true, manage: true },
  },
  [ROLES.OPERATOR]: {
    dashboard: { view: true },
    fleet: { read: true, manage: true }, // Vehicle Info, Maintenance, Inventory
    operations: { read: true, manage: true }, // Tasks, Dispatch, Geofencing
    drivers: { read: true, update: true }, // Assignment
    riders: { read: true }, // Read-only rider info if needed for ops
    rides: { create: true, read: true, update: true }, // Dispatch
    support: { read: true, manage: true }, // Incident Management
    reports: { view: true }, // Analytics
    // No Finance, HR, Pricing
  },
  [ROLES.FINANCE]: {
    dashboard: { view: true },
    finance: { read: true, manage: true }, // Payments, Wallet, Billing, Invoicing
    reports: { view: true }, // Financial Reports
    payments: { read: true, refund: true }, // Explicit payments access
    // No Fleet, HR, Dispatch
  },
  [ROLES.HR]: {
    dashboard: { view: true },
    hr: { read: true, manage: true }, // Employees, Shifts, Training, Performance
    drivers: { read: true }, // Read profiles
    operators: { read: true }, // Read profiles
    support: { read: true }, // Safety records
    // No Billing, Fleet Control
  },
  [ROLES.IT_SUPPORT]: {
    dashboard: { view: true },
    users: { read: true, update: true }, // Access & Auth
    it: { read: true, manage: true }, // Devices, System Health
    support: { read: true, manage: true }, // Tickets
    settings: { read: true, update: true }, // Integrations, Logs
    // No Pricing, Wallet, Refunds
  },
  [ROLES.DRIVER]: {
    fleet: { read: true }, // Vehicle Info
    operations: { read: true }, // Tasks, Route
    support: { create: true }, // Incident Reporting
    hr: { read: true }, // Time & Attendance (Self)
    driver_app: { view: true },
  },
  [ROLES.RIDER]: {
    rider_app: { view: true },
    // Backend permissions if needed:
    rides: { create: true, read: true },
    finance: { read: true }, // Wallet
    support: { create: true },
  },
  [ROLES.SUPPORT]: {
    // General Support (if different from IT Support)
    dashboard: { view: true },
    users: { read: true },
    rides: { read: true },
    support: { read: true, manage: true },
  },
};

export function hasPermission(
  permissions: RolePermissions | undefined,
  resource: string,
  action: string = "read"
): boolean {
  if (!permissions) return false;
  // Check for wildcard resource (super admin) - though not explicitly in new schema, good safety
  if (permissions["*"]) return true;

  const resourcePermissions = permissions[resource];
  if (!resourcePermissions) return false;

  return !!resourcePermissions[action];
}
