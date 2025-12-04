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
    requiredPermission: { resource: "users", action: "read" },

    children: [
      // ---------------------------------------
      // DRIVERS
      // ---------------------------------------
      {
        id: "users/drivers",
        label: "Drivers",

        requiredPermission: { resource: "drivers", action: "read" },
        children: [
          { id: "drivers", label: "All Drivers" },
          // { id: "drivers/active", label: "Active Drivers" },
          // { id: "drivers/inactive", label: "Inactive Drivers" },
          // { id: "drivers/new", label: "Add New Driver" },
          { id: "drivers/applications", label: "Driver Applications" },
          { id: "drivers/documents", label: "Document Verification" },
          { id: "drivers/ratings", label: "Driver Ratings" },
          { id: "drivers/violations", label: "Violations & Reports" },
        ],
      },

      // ---------------------------------------
      // RIDERS
      // ---------------------------------------
      {
        id: "users/riders",
        label: "Riders",

        requiredPermission: { resource: "riders", action: "read" },
        children: [
          { id: "riders", label: "All Riders" },
          // { id: "riders/active", label: "Active Riders" },
          // { id: "riders/inactive", label: "Inactive Riders" },
          // { id: "riders/blocked", label: "Blocked Riders" },
          { id: "riders/ratings", label: "Rider Ratings" },
          { id: "riders/referrals", label: "Referral Tracking" },
        ],
      },

      // ---------------------------------------
      // ADMINS
      // ---------------------------------------
      {
        id: "users/admins",
        label: "Admins",

        requiredPermission: { resource: "admins", action: "read" },
        children: [
          { id: "admins", label: "All Admins" },
          { id: "admins/new", label: "Add New Admin" },
          { id: "admins/roles", label: "Role Assignment" },
          { id: "admins/permissions", label: "Permissions Control" },
          { id: "admins/activity", label: "Admin Activity Logs" },
        ],
      },

      // ---------------------------------------
      // OPERATORS (CALL CENTER / DISPATCHERS)
      // ---------------------------------------
      {
        id: "users/operators",
        label: "Operators",

        requiredPermission: { resource: "operators", action: "read" },
        children: [
          { id: "operators", label: "All Operators" },
          { id: "operators/active", label: "Active Operators" },
          { id: "operators/new", label: "Add New Operator" },
          { id: "operators/roles", label: "Operator Roles" },
          { id: "operators/logs", label: "Operator Dispatch Logs" },
        ],
      },
      {
        id: "dispatch",
        label: "Dispatch",
        // or Navigation, MapPin, Satellite, etc.

        requiredPermission: { resource: "dispatch", action: "read" },

        children: [
          { id: "dispatch/gps", label: "GPS" },
          { id: "dispatch/maps", label: "Maps" },
          { id: "dispatch/heat-maps", label: "Heat Maps" },
          { id: "dispatch/tasks", label: "Tasks" },
          { id: "dispatch/driver-assignment", label: "Driver Assignment" },
        ],
      },
    ],
  },
  {
    id: "rides",
    label: "Rides",
    icon: Activity,
    isDropdown: true,
    requiredPermission: { resource: "operations", action: "read" },
    children: [
      // {
      //   id: "operating-parameters",
      //   label: "Operating Parameters",
      //   // or Cog, Sliders, Wrench — choose any icon you prefer

      //   children: [
      //     {
      //       id: "operating-parameters/service-zones",
      //       label: "Service Zones / Regions",
      //     },
      //     {
      //       id: "operating-parameters/operating-hours",
      //       label: "Operating Hours (Auto-Inactive Drivers)",
      //     },
      //     {
      //       id: "operating-parameters/fare-structure",
      //       label: "Fare Structure (Fixed / Distance / Time)",
      //     },
      //     {
      //       id: "operating-parameters/whitelabel-tiers",
      //       label: "White-Label Fee Tiers (B2B)",
      //     },
      //     {
      //       id: "operating-parameters/commission-rates",
      //       label: "Commission Rates",
      //     },
      //     {
      //       id: "operating-parameters/minimum-pricing",
      //       label: "Ride Minimum Pricing Protections",
      //     },
      //     {
      //       id: "operating-parameters/safety-policies",
      //       label: "Safety Policies for Drivers & Riders",
      //     },
      //     {
      //       id: "operating-parameters/incident-reporting",
      //       label: "Incident Reporting Process",
      //     },
      //   ],
      // },
      { id: "ride/ride-requests", label: "Ride Requests" },
      { id: "ride/customer-rides", label: "Customer Rides" },
      { id: "ride/ride-complaints", label: "Ride Complaints" },
      { id: "operations/pending-rides", label: "Pending Rides" },
      { id: "operations/scheduled-rides", label: "Scheduled Rides" },
      { id: "operations/completed-history", label: "Completed History" },
      { id: "operations/cancelled-rides", label: "Cancelled Rides" },
      { id: "operations/driver-performance", label: "Driver Performance" },
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

      { id: "bookings/issues", label: "Ride Issues / Support" },
      { id: "bookings/audit", label: "Booking Audit Logs" },
    ],
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
      {
        id: "financial-tax-information",
        label: "Financial & Tax Information",
        // or Wallet, Banknote — choose your preferred icon

        requiredPermission: { resource: "finance", action: "read" },

        children: [
          {
            id: "financial-tax/bank-info",
            label: "Bank Account / ACH Information",
          },
          {
            id: "financial-tax/payout-settings",
            label: "Payout Frequency & Methods",
          },
          {
            id: "financial-tax/driver-payouts",
            label: "Driver Payout Calculations",
          },
          {
            id: "financial-tax/commission-breakdown",
            label: "Commission Breakdown",
          },
          {
            id: "financial-tax/tax-rates",
            label: "GST / HST / QST (or Local Tax Rates)",
          },
          {
            id: "financial-tax/annual-reports",
            label: "Annual T4A / 1099 Reporting",
          },
        ],
      },
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
      {
        id: "technology-integration",
        label: "Technology & Integration Info",
        // or Server, Workflow, Activity — pick your preferred icon

        requiredPermission: { resource: "system", action: "read" },

        children: [
          {
            id: "tech/gps-telematics",
            label: "GPS & Telematics Requirements",
          },
          {
            id: "tech/payment-compliance",
            label: "Payment Gateway Compliance (PCI)",
          },
          {
            id: "tech/ride-history-logs",
            label: "Ride History Logs",
          },
          {
            id: "tech/driver-telematics",
            label: "Driver Telematics (Speeding, Braking, Idle)",
          },
          {
            id: "tech/app-version-tracking",
            label: "App Version Tracking (Driver & Rider)",
          },
          {
            id: "tech/support-tickets",
            label: "Customer Support Ticketing Workflow",
          },
          {
            id: "tech/operational-kpis",
            label: "Operational Dashboard KPI Metrics",
          },
        ],
      },
      {
        id: "role-management",
        label: "Role Management",
        requiredPermission: { resource: "roles", action: "read" },
        // or UsersCog, LockKeyhole — pick your preferred icon

        requiredPermission: { resource: "roles", action: "read" },

        children: [
          {
            id: "roles/add",
            label: "Add Role",
            requiredPermission: { resource: "roles", action: "create" },
          },
          {
            id: "roles/edit",
            label: "Edit Role",
            requiredPermission: { resource: "roles", action: "update" },
          },
          {
            id: "roles/inactive",
            label: "Inactive Roles",
            requiredPermission: { resource: "roles", action: "update" },
          },
          {
            id: "roles/permissions",
            label: "Permissions per Role",
            requiredPermission: { resource: "roles", action: "read" },
          },
        ],
      },

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
    id: "core-wallet",
    label: "Core Wallet & Finance",
    icon: Wallet2, // choose Wallet, CreditCard, Banknote, etc.
    isDropdown: true,
    requiredPermission: { resource: "finance", action: "read" },

    children: [
      // 1.1 WALLETS DASHBOARD
      {
        id: "core-wallet/dashboard",
        label: "Wallets",

        children: [
          { id: "core-wallet/ecowallet", label: "EcoWallet" },
          { id: "core-wallet/cadwallet", label: "CAD Wallet" },
          { id: "core-wallet/balance", label: "Wallet Balance" },

          {
            id: "core-wallet/transactions",
            label: "Wallet Transactions",
          },
          {
            id: "core-wallet/conversion-rules",
            label: "Conversion Rules",
          },
          { id: "core-wallet/conditions", label: "Conditions" },
          { id: "core-wallet/add", label: "Add" },
          { id: "core-wallet/edit", label: "Edit" },
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
            label: "Fee Types",
          },
          { id: "core-wallet/fees/effective-dates", label: "Effective Dates" },
          { id: "core-wallet/fees/rules", label: "Fee Rules" },
          { id: "core-wallet/fees/overrides", label: "Fee Overrides" },
          { id: "core-wallet/fees/mapping", label: "Wallet Mapping" },
          { id: "core-wallet/fees/analytics", label: "Fee Analytics" },
          { id: "core-wallet/fees/add", label: "Add" },
          { id: "core-wallet/fees/edit", label: "Edit" },
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
          { id: "pricing/base/cost-per-km", label: "Cost per Km" },
          { id: "pricing/base/cost-per-minute", label: "Cost per Minute" },
          { id: "pricing/base/min-max-fare", label: "Min/Max Fare" },
          { id: "pricing/base/add", label: "Add" },
          { id: "pricing/base/base/edit", label: "Edit" },
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

          { id: "pricing/dynamic/add", label: "Add" },
          { id: "pricing/dynamic/edit", label: "Edit" },
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

          { id: "pricing/service-type/add", label: "Add" },
          { id: "pricing/service-type/edit", label: "Edit" },
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

          { id: "pricing/discounts/add", label: "Add" },
          { id: "pricing/discounts/edit", label: "Edit" },
        ],
      },
      {
        id: "pricing/multi-city-pricing",
        label: "Multi-city Pricing",
        children: [
          { id: "pricing/multi-city-pricing/multi-zone", label: "Multi-zone" },
          {
            id: "pricing/multi-city-pricing/multi-region",
            label: "Multi-region",
          },
          {
            id: "pricing/multi-city-pricing/clone-pricing",
            label: "Clone Pricing",
          },
          {
            id: "pricing/multi-city-pricing/add",
            label: "Add",
          },
          {
            id: "pricing/multi-city-pricing/edit",
            label: "Edit",
          },
        ],
      },
      {
        id: "pricing/rule-engine",
        label: "Rule Engine",
        children: [
          { id: "pricing/rule-engine/conditions", label: "Conditions" },
          { id: "pricing/rule-engine/triggers", label: "Triggers" },
          {
            id: "pricing/rule-engine/expiry",
            label: "Expiry rules",
          },
          {
            id: "pricing/rule-engine/limits",
            label: "Usage limits",
          },
          {
            id: "pricing/rule-engine/add",
            label: "Add",
          },
          {
            id: "pricing/rule-engine/edit",
            label: "Edit",
          },
        ],
      },
    ],
  },
  {
    id: "incentives",
    label: "Incentive",
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
            label: "Cashback",
          },
          {
            id: "incentives/rider/referral",
            label: "Referral Rewards",
          },
          { id: "incentives/rider/special-pricing", label: "Special Pricing" },
          {
            id: "incentives/rider/membership-tiers",
            label: "Membership Tiers",
          },
          {
            id: "incentives/rider/founding-rider",
            label: "Founding Rider",
          },

          // { id: "incentives/rider/add", label: "Add" },
          // { id: "incentives/rider/edit", label: "Edit" },
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
          { id: "incentives/driver/founding-driver", label: "Founding Driver" },

          // { id: "incentives/driver/add", label: "Add" },
          // { id: "incentives/driver/edit", label: "Edit" },
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
          {
            id: "incentives/partner/ambassador",
            label: "Community Ambassador",
          },

          { id: "incentives/partner/add", label: "Add" },
          { id: "incentives/partner/edit", label: "Edit" },
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

      { id: "subscription/add", label: "Add" },
      { id: "subscription/edit", label: "Edit" },
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
          { id: "user-auth/signup/age", label: "Age" },
          { id: "user-auth/signup/edit", label: "Edit" },
          { id: "user-auth/signup/inactive", label: "Inactive" },
        ],
      },

      // 5.2 KYC
      {
        id: "user-auth/kyc",
        label: "KYC",

        children: [
          { id: "user-auth/kyc/address", label: "Address" },
          { id: "user-auth/kyc/email", label: "Email address" },
          { id: "user-auth/kyc/phone", label: "mobile number" },
          { id: "user-auth/kyc/gov-id", label: "Government ID" },
          { id: "user-auth/kyc/selfie", label: "Selfie with ID" },
          { id: "user-auth/kyc/documents", label: "Document Upload" },
        ],
      },

      // 5.3 MANAGEMENT
      {
        id: "user-auth/vehicle",
        label: "Vehicle and Insurance info",
      },
      {
        id: "user-auth/local-license",
        label: "EcoGo Local License",
      },
      {
        id: "user-auth/company-info",
        label: "Company Information",
      },
      {
        id: "user-auth/driver-info",
        label: "Driver Information",
      },
    ],
  },

  {
    id: "system",
    label: "Systems",
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
      { id: "system/pricing", label: "Pricing" },
      { id: "system/product", label: "Product" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Reports",
    icon: BarChart3, // choose any analytics icon
    isDropdown: true,
    requiredPermission: { resource: "analytics", action: "read" },

    children: [
      // 8.1 PRICING ANALYTICS
      {
        id: "reports",
        label: "Reports",

       
        children: [
          { id: "reports/ride-reports", label: "Ride Reports" },
          { id: "reports/driver-reports", label: "Driver Reports" },
          { id: "reports/revenue-reports", label: "Revenue Reports" },
          { id: "reports/payout-reports", label: "Payout Reports" },
        ],
      },
      // {
      //   id: "analytics/pricing",
      //   label: "Pricing Analytics",

      //   children: [
      //     { id: "analytics/pricing/avg-fare", label: "Avg Fare" },
      //     { id: "analytics/pricing/revenue-metrics", label: "Revenue Metrics" },
      //     { id: "analytics/pricing/surge-usage", label: "Surge Usage" },
      //     { id: "analytics/pricing/promo-usage", label: "Promo Usage" },
      //     { id: "analytics/pricing/discount-impact", label: "Discount Impact" },

      //   ],
      // },

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
      {
        id: "analytics/reports",
        label: "Reporting Requirements",

        children: [
          { id: "analytics/reports/trip-level", label: "Trip Level details" },
          {
            id: "analytics/reports/times",
            label: "Wait Time",
          },
          {
            id: "analytics/reports/cancel",
            label: "Cancellation Logs",
          },
          {
            id: "analytics/reports/driver-online-time",
            label: "fare summaries",
          },
          {
            id: "analytics/reports/safety",
            label: "Safety incidents",
          },
          {
            id: "analytics/reports/municipality-specific",
            label: "Municipality Specific",
          },
        ],
      },
    ],
  },
  {
    id: "safety",
    label: "Safety & Compliance",
    icon: ShieldCheck, // <-- use any icon you prefer
    isDropdown: true,
    requiredPermission: { resource: "safety", action: "read" },

    children: [
      { id: "safety/inspection-logs", label: "Safety Inspection Logs" },
      {
        id: "safety/incident-reporting",
        label: "Incident / Accident Reporting",
      },
      { id: "safety/lost-and-found", label: "Lost & Found Processes" },
      {
        id: "safety/emergency-protocols",
        label: "Emergency Response Protocols",
      },
      {
        id: "safety/complaint-escalation",
        label: "Complaint Escalation Workflows",
      },
      {
        id: "safety/behavior-policies",
        label: "Rider & Driver Behavior Policies",
      },
      { id: "safety/training-docs", label: "Safety Training Documentation" },
    ],
  },
  {
    id: "governance",
    label: "Platform Governance",
    icon: FileText, // choose any icon you like (FileText, Scale, Shield, BookOpen, etc.)
    isDropdown: true,
    requiredPermission: { resource: "governance", action: "read" },

    children: [
      {
        id: "governance/terms-of-service",
        label: "Terms of Service (Drivers + Riders)",
      },
      { id: "governance/privacy-policy", label: "Privacy Policy" },
      { id: "governance/data-retention", label: "Data Retention Policies" },
      {
        id: "governance/e-sign-consent",
        label: "Consent for Electronic Signature",
      },
      { id: "governance/acceptable-use", label: "Acceptable Use Policies" },
      {
        id: "governance/dispute-arbitration",
        label: "Dispute & Arbitration Policies",
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
