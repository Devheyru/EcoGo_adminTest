import { RolePermissions } from "./role";

export type Role = "admin" | "driver" | "rider" | "support" | "operator";

export type UserStatus = "active" | "suspended" | "pending" | "inactive";

export interface KycInfo {
  completed: boolean;
  documents?: string[]; // storage paths
  verifiedAt?: string; // ISO
  verifiedBy?: string; // admin uid
}

export interface Wallet {
  balance: number;
  currency: string; // e.g. 'CAD'
}

export interface Rating {
  avg: number;
  count: number;
}

export interface User {
  uid: string;
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId: string; // Points to roles collection
  role?: string; // Legacy/Display role name
  permissions?: RolePermissions; // Hydrated from role
  status: UserStatus;
  createdAt: string; // ISO string
  lastLogin?: string; // ISO string
  kyc?: KycInfo;
  wallet?: Wallet;
  rating?: Rating;
  metadata?: Record<string, any>;
}
