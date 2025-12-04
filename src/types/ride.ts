export type RideStatus =
  | "requested"
  | "accepted"
  | "on_trip"
  | "completed"
  | "cancelled"
  | "no_show";
export type RideType = "single" | "pooling" | "delivery";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Fare {
  subtotal: number;
  tax: number;
  discount?: number;
  surgeMultiplier?: number;
  total: number;
  currency: string;
}

export interface Ride {
  rideId: string;
  riderId: string;
  driverId?: string | null;
  status: RideStatus;
  type: RideType;
  pickup: Location;
  dropoff: Location;
  fare: Fare;
  cost: number;
  createdAt: string; // ISO
  startedAt?: string | null; // ISO
  completedAt?: string | null; // ISO
  eta?: number; // seconds
  distanceMeters?: number;
  routePolyline?: string;
  sharedWith?: string[]; // other rideIds
  cancellation?: {
    by?: "rider" | "driver" | "system";
    reason?: string;
    at?: string; // ISO
  } | null;
}
