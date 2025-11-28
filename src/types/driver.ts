import { User } from "./user";
import { Vehicle } from "./vehicle";

export interface CarInfo {
  make?: string;
  model?: string;
  year?: number;
  plate?: string;
  color?: string;
}

export interface InsuranceInfo {
  company?: string;
  policyNumber?: string;
  start?: string; // ISO
  end?: string; // ISO
}

export interface LicenseInfo {
  tncLicenseNumber?: string;
  issuedAt?: string;
}

export interface Driver {
  driverId: string; // same as users/{uid}
  car?: CarInfo;
  insurance?: InsuranceInfo;
  license?: LicenseInfo;
  trainingCompleted?: boolean;
  active?: boolean;
  commissionRate?: number; // e.g. 0.2
  documents?: string[]; // storage paths
  backgroundCheckStatus?: "pending" | "clear" | "failed";
  createdAt?: string; // ISO
}

export interface DriverDocument {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  isOnline: boolean;
  licenseNumber: string;
  licenseExpiry: string;
  rating: number;
  totalTrips: number;
  userId: string;
  vehicleId: string;
  updatedAt: any;
  [key: string]: any;
}

export interface MergedDriver {
  id: string;
  driver: DriverDocument;
  user: User | null;
  vehicle: Vehicle | null;
  permissions: any;
}
