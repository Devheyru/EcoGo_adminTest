import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  FileText,
  Truck,
  MapPin,
  Activity,
  Layers,
  DollarSign,
  CreditCard,
  Percent,
  MessageSquare,
  Megaphone,
  Gift,
  Bell,
  BarChart,
  PieChart,
  Briefcase,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  isDropdown: boolean;
  requiredPermission?: { resource: string; action: string };
  children?: {
    id: string;
    label: string;
    requiredPermission?: { resource: string; action: string };
    children?: {
      id: string;
      label: string;
      requiredPermission?: { resource: string; action: string };
    }[];
  }[];
}

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Admin",
    icon: LayoutDashboard,
    isDropdown: false,
    requiredPermission: { resource: "dashboard", action: "view" },
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    isDropdown: true,
    // requiredPermission: { resource: "users", action: "read" }, // Removed to allow access to children (Drivers, Riders) for roles without full user access
    children: [
      {
        id: "drivers",
        label: "Drivers",
        requiredPermission: { resource: "drivers", action: "read" },
      },
      {
        id: "riders",
        label: "Riders",
        requiredPermission: { resource: "riders", action: "read" },
      },
      {
        id: "admins",
        label: "Admins",
        requiredPermission: { resource: "users", action: "read" },
      },
      {
        id: "operators",
        label: "Operators",
        requiredPermission: { resource: "operators", action: "read" },
      },
      {
        id: "driver-applications",
        label: "Driver Applications",
        requiredPermission: { resource: "drivers", action: "read" },
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    icon: Activity,
    isDropdown: true,
    requiredPermission: { resource: "operations", action: "read" },
    children: [
      { id: "operations/live-tracking", label: "Live Tracking" },
      { id: "operations/pending-rides", label: "Pending Rides" },
      { id: "operations/scheduled-rides", label: "Scheduled Rides" },
      { id: "operations/completed-history", label: "Completed History" },
      { id: "operations/cancelled-rides", label: "Cancelled Rides" },
      { id: "operations/driver-performance", label: "Driver Performance" },
      { id: "operations/heatmap", label: "Heatmap / Demand Zones" },
    ],
  },
  {
    id: "fleet",
    label: "Fleet Management",
    icon: Truck,
    isDropdown: true,
    requiredPermission: { resource: "fleet", action: "read" },
    children: [
      { id: "fleet/vehicles", label: "Vehicles" },
      { id: "fleet/vehicle-types", label: "Vehicle Types" },
      { id: "fleet/vehicle-documents", label: "Vehicle Documents" },
      { id: "fleet/maintenance", label: "Maintenance Logs" },
      { id: "fleet/inventory", label: "Inventory & Parts" },
    ],
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: Calendar,
    isDropdown: false,
    requiredPermission: { resource: "rides", action: "read" },
  },
  {
    id: "finance",
    label: "Finance & Payments",
    icon: DollarSign,
    isDropdown: true,
    requiredPermission: { resource: "finance", action: "read" },
    children: [
      { id: "finance/driver-payouts", label: "Driver Payouts" },
      { id: "finance/rider-payments", label: "Rider Payments" },
      { id: "finance/withdrawals", label: "Withdrawal Requests" },
      { id: "finance/commissions", label: "Commissions & Earnings" },
      { id: "promo-codes", label: "Promo Codes" },
      { id: "transactions", label: "Transactions" },
    ],
  },
  {
    id: "hr",
    label: "HR & Workforce",
    icon: Briefcase,
    isDropdown: true,
    requiredPermission: { resource: "hr", action: "read" },
    children: [
      { id: "hr/employees", label: "Employees" },
      { id: "hr/shifts", label: "Shifts & Scheduling" },
      { id: "hr/attendance", label: "Time & Attendance" },

      { id: "hr/training", label: "Training & Certs" },
      { id: "hr/performance", label: "Performance" },
    ],
  },
  {
    id: "support",
    label: "Complaints & Support",
    icon: MessageSquare,
    isDropdown: true,
    requiredPermission: { resource: "support", action: "read" },
    children: [
      { id: "support/ride-complaints", label: "Ride Complaints" },
      { id: "support/driver-complaints", label: "Driver Complaints" },
      { id: "support/rider-complaints", label: "Rider Complaints" },
      { id: "support/tickets", label: "Support Tickets" },
    ],
  },
  {
    id: "it_support",
    label: "IT & Systems",
    icon: Wrench,
    isDropdown: true,
    requiredPermission: { resource: "it", action: "read" },
    children: [
      { id: "it/devices", label: "Device Management" },
      { id: "it/system-health", label: "System Health" },
      { id: "it/integrations", label: "Integrations" },
      { id: "it/logs", label: "System Logs" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing Tools",
    icon: Megaphone,
    isDropdown: true,
    requiredPermission: { resource: "marketing", action: "read" },
    children: [
      { id: "marketing/referral", label: "Referral Program" },
      { id: "marketing/rewards", label: "Reward Points" },
      { id: "marketing/campaigns", label: "Promotional Campaigns" },
      { id: "marketing/broadcast", label: "Broadcast Notifications" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart,
    isDropdown: true,
    requiredPermission: { resource: "reports", action: "view" },
    children: [
      { id: "reports/ride-reports", label: "Ride Reports" },
      { id: "reports/driver-reports", label: "Driver Reports" },
      { id: "reports/revenue-reports", label: "Revenue Reports" },
      { id: "reports/payout-reports", label: "Payout Reports" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    isDropdown: true,
    requiredPermission: { resource: "settings", action: "read" },
    children: [
      {
        id: "settings/general",
        label: "General",
        children: [
          { id: "settings/general/system", label: "System" },
          { id: "settings/general/profile", label: "Profile" },
        ],
      },
      { id: "settings/config", label: "Configuration" },
      {
        id: "settings/pricing",
        label: "Pricing Rules",
        requiredPermission: { resource: "pricing", action: "read" },
      },
      { id: "settings/notifications", label: "Notification Settings" },
      { id: "settings/api", label: "API Keys" },
      { id: "settings/audit", label: "Audit Logs" },
    ],
  },
];