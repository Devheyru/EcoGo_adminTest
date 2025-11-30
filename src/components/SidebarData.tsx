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
  WalletIcon,
  BadgeCheck,
  Cog,
  BarChart3,
  Wallet2,
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
  isDropdown: true,
  requiredPermission: { resource: "rides", action: "read" },

  children: [
    { id: "bookings/all", label: "All Bookings" },
    { id: "bookings/active", label: "Active Rides" },
    { id: "bookings/scheduled", label: "Scheduled Rides" },
    { id: "bookings/completed", label: "Completed Rides" },
    { id: "bookings/cancelled", label: "Cancelled Rides" },
    { id: "bookings/pending", label: "Pending Assignments" },
    { id: "bookings/unassigned", label: "Unassigned Rides" },
    { id: "bookings/auto-assign", label: "Auto-Assign Queue" },
    { id: "bookings/manual-assign", label: "Manual Assignment" },
    { id: "bookings/live-tracking", label: "Live Ride Tracking" },
    { id: "bookings/rebooking", label: "Re-booking / Retry" },
    { id: "bookings/fare-adjustments", label: "Fare Adjustments" },
    { id: "bookings/issues", label: "Ride Issues / Support" },
    { id: "bookings/audit", label: "Booking Audit Logs" },
  ],
}
,
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

  {
    id: "core-wallet",
    label: "Core Wallet & Finance Modules",
    icon: Wallet2, // choose Wallet, CreditCard, Banknote, etc.
    isDropdown: true,
    requiredPermission: { resource: "finance", action: "read" },

    children: [
      // 1.1 WALLETS DASHBOARD
      {
        id: "core-wallet/dashboard",
        label: "Wallets Dashboard",

        children: [
          { id: "core-wallet/dashboard/ecowallet", label: "EcoWallet" },
          { id: "core-wallet/dashboard/cadwallet", label: "CAD Wallet" },
          { id: "core-wallet/dashboard/balance", label: "Wallet Balance" },
          {
            id: "core-wallet/dashboard/transactions",
            label: "Wallet Transactions",
          },
          {
            id: "core-wallet/dashboard/conversion-rules",
            label: "Conversion Rules",
          },
          { id: "core-wallet/dashboard/conditions", label: "Conditions" },
        ],
      },

      // 1.2 FEES MODULE
      {
        id: "core-wallet/fees",
        label: "Fees Module",

        children: [
          { id: "core-wallet/fees/setup", label: "Fee Setup" },
          { id: "core-wallet/fees/edit", label: "Edit Fees" },
          {
            id: "core-wallet/fees/fee-types",
            label: "Fee Types (Flat, %, Conditional)",
          },
          { id: "core-wallet/fees/effective-dates", label: "Effective Dates" },
          { id: "core-wallet/fees/rules", label: "Fee Rules" },
          { id: "core-wallet/fees/overrides", label: "Fee Overrides" },
          { id: "core-wallet/fees/mapping", label: "Wallet Mapping" },
          { id: "core-wallet/fees/analytics", label: "Fee Analytics" },
        ],
      },
    ],
  },

  {
    id: "basepricing",
    label: "Pricing & Fare Engine",
    icon: DollarSign,
    isDropdown: true,
    requiredPermission: { resource: "pricing", action: "read" },

    children: [
      // 2.1 BASE PRICING
      {
        id: "pricing/base",
        label: "Base Pricing",
        children: [
          { id: "pricing/base/base-fare", label: "Base Fare" },
          { id: "pricing/base/cost-per-km", label: "Cost per KM" },
          { id: "pricing/base/cost-per-minute", label: "Cost per Minute" },
          { id: "pricing/base/min-max-fare", label: "Min/Max Fare" },
        ],
      },

      // 2.2 DYNAMIC PRICING
      {
        id: "pricing/dynamic",
        label: "Dynamic Pricing",
        children: [
          { id: "pricing/dynamic/peak-hour", label: "Peak-hour Pricing" },
          { id: "pricing/dynamic/surge", label: "Surge Pricing" },
          { id: "pricing/dynamic/weather", label: "Weather-based Pricing" },
          { id: "pricing/dynamic/zone", label: "Zone-based Pricing" },
          { id: "pricing/dynamic/school-zone", label: "School-zone Pricing" },
          { id: "pricing/dynamic/event", label: "Event-based Pricing" },
        ],
      },

      // 2.3 SERVICE-TYPE PRICING
      {
        id: "pricing/service-type",
        label: "Service-Type Pricing",
        children: [
          {
            id: "pricing/service-type/student-dropoff",
            label: "Student Drop-off",
          },
          { id: "pricing/service-type/individual", label: "Individual Rides" },
          { id: "pricing/service-type/rideshare", label: "Group / Rideshare" },
          { id: "pricing/service-type/pet-delivery", label: "Pet Delivery" },
          { id: "pricing/service-type/parcel", label: "Parcel / Courier" },
          { id: "pricing/service-type/corporate", label: "Corporate Rides" },
          {
            id: "pricing/service-type/subscription",
            label: "Subscription Pricing",
          },
        ],
      },

      // 2.4 DISCOUNT PRICING
      {
        id: "pricing/discounts",
        label: "Discount Pricing",
        children: [
          { id: "pricing/discounts/promo-codes", label: "Promo Codes" },
          { id: "pricing/discounts/auto-discounts", label: "Auto Discounts" },
          {
            id: "pricing/discounts/multi-stop-rules",
            label: "Multi-stop Rules",
          },
          {
            id: "pricing/discounts/return-trip-rules",
            label: "Return Trip Rules",
          },
          {
            id: "pricing/discounts/family-bundles",
            label: "Family / Household Bundles",
          },
        ],
      },
    ],
  },
  {
    id: "incentives",
    label: "Incentive Management",
    icon: Gift, // choose an icon like lucide-react "Gift" or "Medal"
    isDropdown: true,
    requiredPermission: { resource: "incentives", action: "read" },

    children: [
      // 3.1 RIDER INCENTIVES
      {
        id: "incentives/rider",
        label: "Rider Incentives",
        children: [
          { id: "incentives/rider/signup-bonuses", label: "Signup Bonuses" },
          { id: "incentives/rider/loyalty-points", label: "Loyalty Points" },
          { id: "incentives/rider/free-ride-rules", label: "Free Ride Rules" },
          {
            id: "incentives/rider/cashback",
            label: "Cashback & Referral Rewards",
          },
          { id: "incentives/rider/special-pricing", label: "Special Pricing" },
          {
            id: "incentives/rider/membership-tiers",
            label: "Membership Tiers",
          },
        ],
      },

      // 3.2 DRIVER INCENTIVES
      {
        id: "incentives/driver",
        label: "Driver Incentives",
        children: [
          {
            id: "incentives/driver/target-bonuses",
            label: "Ride Target Bonuses",
          },
          {
            id: "incentives/driver/peak-hour-bonuses",
            label: "Peak-hour Bonuses",
          },
          {
            id: "incentives/driver/zone-coverage",
            label: "Zone Coverage Bonuses",
          },
          {
            id: "incentives/driver/shift-bonuses",
            label: "Early/Late Shift Bonuses",
          },
          {
            id: "incentives/driver/rating-bonuses",
            label: "Rating-based Bonuses",
          },
          { id: "incentives/driver/referrals", label: "Driver Referrals" },
        ],
      },

      // 3.3 PARTNER / OPERATOR INCENTIVES
      {
        id: "incentives/partner",
        label: "Partner & Operator Incentives",
        children: [
          {
            id: "incentives/partner/commission-bonuses",
            label: "Commission Bonuses",
          },
          { id: "incentives/partner/volume-rebates", label: "Volume Rebates" },
          {
            id: "incentives/partner/seasonal-promos",
            label: "Seasonal Promos",
          },
        ],
      },
    ],
  },
  {
    id: "subscription",
    label: "Subscription & Membership",
    icon: BadgeCheck, // pick any icon (e.g., BadgeCheck, Crown, Star)
    isDropdown: true,
    requiredPermission: { resource: "subscription", action: "read" },

    children: [
      { id: "subscription/monthly", label: "Monthly Plans" },
      { id: "subscription/family", label: "Family Plan" },
      { id: "subscription/student", label: "Student Plan" },
      { id: "subscription/premium", label: "Premium Plan" },
      { id: "subscription/benefits", label: "Benefits Management" },
    ],
  },
  {
    id: "user-auth",
    label: "User & Authentication",
    icon: ShieldCheck, // choose any icon you like
    isDropdown: true,
    requiredPermission: { resource: "users", action: "read" },

    children: [
      // 5.1 SIGN UP / SIGN IN
      {
        id: "user-auth/signup",
        label: "Sign Up / Sign In",

        children: [
          { id: "user-auth/signup/registration", label: "Registration" },
          { id: "user-auth/signup/edit", label: "Edit" },
          { id: "user-auth/signup/inactive", label: "Inactive (No Delete)" },
        ],
      },

      // 5.2 KYC
      {
        id: "user-auth/kyc",
        label: "KYC",

        children: [
          { id: "user-auth/kyc/address", label: "Address" },
          { id: "user-auth/kyc/gov-id", label: "Government ID" },
          { id: "user-auth/kyc/selfie", label: "Selfie with ID" },
          { id: "user-auth/kyc/documents", label: "Document Upload" },
        ],
      },

      // 5.3 ROLE MANAGEMENT
      {
        id: "user-auth/roles",
        label: "Role Management",

        children: [
          { id: "user-auth/roles/add", label: "Add Role" },
          { id: "user-auth/roles/edit", label: "Edit Role" },
          { id: "user-auth/roles/inactive", label: "Inactive" },
          { id: "user-auth/roles/permissions", label: "Permissions Per Role" },
        ],
      },
    ],
  },
  {
    id: "dispatch",
    label: "Operator / Dispatch Modules",
    icon: Map, // or Navigation, MapPin, Satellite, etc.
    isDropdown: true,
    requiredPermission: { resource: "dispatch", action: "read" },

    children: [
      { id: "dispatch/gps", label: "GPS" },
      { id: "dispatch/maps", label: "Maps" },
      { id: "dispatch/heat-maps", label: "Heat Maps" },
      { id: "dispatch/tasks", label: "Tasks" },
      { id: "dispatch/driver-assignment", label: "Driver Assignment" },
    ],
  },
  {
    id: "system",
    label: "System Modules",
    icon: Cog, // or ServerCog, Settings2, Activity, etc.
    isDropdown: true,
    requiredPermission: { resource: "system", action: "read" },

    children: [
      { id: "system/apis", label: "APIs" },
      { id: "system/white-label", label: "White Label" },
      { id: "system/notifications", label: "Notifications" },
      { id: "system/alerts", label: "Alerts" },
      { id: "system/sos", label: "SOS" },
      { id: "system/otp", label: "OTP System" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3, // choose any analytics icon
    isDropdown: true,
    requiredPermission: { resource: "analytics", action: "read" },

    children: [
      // 8.1 PRICING ANALYTICS
      {
        id: "analytics/pricing",
        label: "Pricing Analytics",

        children: [
          { id: "analytics/pricing/avg-fare", label: "Avg Fare" },
          { id: "analytics/pricing/revenue-metrics", label: "Revenue Metrics" },
          { id: "analytics/pricing/surge-usage", label: "Surge Usage" },
          { id: "analytics/pricing/promo-usage", label: "Promo Usage" },
          { id: "analytics/pricing/discount-impact", label: "Discount Impact" },
        ],
      },

      // 8.2 INCENTIVE ANALYTICS
      {
        id: "analytics/incentives",
        label: "Incentive Analytics",

        children: [
          {
            id: "analytics/incentives/payout-projection",
            label: "Driver Payout Projection",
          },
          { id: "analytics/incentives/roi", label: "ROI" },
          {
            id: "analytics/incentives/rider-retention",
            label: "Rider Retention",
          },
          {
            id: "analytics/incentives/program-performance",
            label: "Program Performance",
          },
        ],
      },

      // 8.3 CUSTOM ALERTS
      {
        id: "analytics/alerts",
        label: "Custom Alerts",

        children: [
          { id: "analytics/alerts/overspending", label: "Overspending" },
          {
            id: "analytics/alerts/suspicious-promo",
            label: "Suspicious Promo Use",
          },
          {
            id: "analytics/alerts/ineffective-incentives",
            label: "Ineffective Incentives",
          },
        ],
      },
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