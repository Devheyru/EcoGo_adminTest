export * from "./user";
export * from "./driver";
export * from "./ride";
export * from "./chat";
export * from "./payment";
export * from "./settings";

export type UserRole = "admin" | "operator";

export interface Users {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive";
  createdAt: string;
  lastLogin?: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  vehicleType: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  fare: number;
  distance: number;
  createdAt: string;
  completedAt?: string;
}

export interface Analytics {
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  activeVehicles: number;
  bookingsTrend: { date: string; count: number }[];
  revenueTrend: { date: string; revenue: number }[];
  topRoutes: { id: number; route: string; count: number }[];
  vehicleUtilization: { type: string; percentage: number }[];
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
  severity: "info" | "warning" | "critical";
}

export interface Settings {
  companyName: string;
  supportEmail: string;
  maxBookingDistance: number;
  cancellationWindow: number;
  baseRate: number;
  perKmRate: number;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
}
