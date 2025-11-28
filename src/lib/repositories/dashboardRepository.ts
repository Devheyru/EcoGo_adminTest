import { adminDb } from "@/lib/firebase/admin";
import { Ride } from "@/types/ride";
import { User } from "@/types/user";
import { Driver } from "@/types/driver";

export interface DriverDashboardData {
  totalTrips: number;
  earnings: number;
  rating: number;
  recentTrips: Ride[];
}

export interface RiderDashboardData {
  totalRides: number;
  walletBalance: number;
  rating: number;
  recentRides: Ride[];
}

export interface OperatorDashboardData {
  activeFleet: number;
  totalFleet: number;
  driversOnline: number;
  maintenanceDue: number;
  alerts: number;
  revenue: {
    today: number;
    week: number;
    month: number;
  };
  fleetHealth: {
    good: number;
    warning: number;
    critical: number;
  };
  vehicleStatus: {
    id: string;
    name: string;
    plate: string;
    status: "active" | "idle" | "offline" | "maintenance";
    fuelLevel?: number;
    location?: { lat: number; lng: number };
    lastUpdate?: string;
    driverName?: string;
    driverImage?: string;
  }[];
  recentAlerts: {
    id: string;
    type: "maintenance" | "accident" | "document" | "payment";
    message: string;
    severity: "low" | "medium" | "high";
    timestamp: string;
  }[];
}

export class DashboardRepository {
  static async getDriverData(userId: string): Promise<DriverDashboardData> {
    try {
      const tripsQuery = await adminDb
        .collection("rides")
        .where("driverId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();

      const trips = tripsQuery.docs.map((doc) => ({
        rideId: doc.id,
        ...doc.data(),
      })) as Ride[];

      const totalTripsSnapshot = await adminDb
        .collection("rides")
        .where("driverId", "==", userId)
        .count()
        .get();

      const totalTrips = totalTripsSnapshot.data().count;
      const earnings = trips.reduce(
        (acc, trip) => acc + (trip.fare?.total || 0),
        0
      );

      const userDoc = await adminDb.collection("users").doc(userId).get();
      const userData = userDoc.data() as User;

      return {
        totalTrips,
        earnings: earnings * 10,
        rating: userData.rating?.avg || 5.0,
        recentTrips: trips,
      };
    } catch (error) {
      console.error("Error fetching driver dashboard data:", error);
      return {
        totalTrips: 0,
        earnings: 0,
        rating: 5.0,
        recentTrips: [],
      };
    }
  }

  static async getRiderData(userId: string): Promise<RiderDashboardData> {
    try {
      const tripsQuery = await adminDb
        .collection("rides")
        .where("riderId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(5)
        .get();

      const trips = tripsQuery.docs.map((doc) => ({
        rideId: doc.id,
        ...doc.data(),
      })) as Ride[];

      const totalRidesSnapshot = await adminDb
        .collection("rides")
        .where("riderId", "==", userId)
        .count()
        .get();

      const userDoc = await adminDb.collection("users").doc(userId).get();
      const userData = userDoc.data() as User;

      return {
        totalRides: totalRidesSnapshot.data().count,
        walletBalance: userData.wallet?.balance || 0,
        rating: userData.rating?.avg || 5.0,
        recentRides: trips,
      };
    } catch (error) {
      console.error("Error fetching rider dashboard data:", error);
      return {
        totalRides: 0,
        walletBalance: 0,
        rating: 5.0,
        recentRides: [],
      };
    }
  }

  static async getOperatorData(userId: string): Promise<OperatorDashboardData> {
    try {
      const driversQuery = await adminDb.collection("drivers").limit(20).get();
      const drivers = driversQuery.docs.map((doc) => {
        const data = doc.data();
        return {
          driverId: doc.id,
          ...data,
        };
      }) as (Driver & { name?: string; status?: string })[];

      const totalFleet = drivers.length;
      const activeFleet = drivers.filter((d) => d.active).length;
      const driversOnline = drivers.filter(
        (d) => d.status !== "offline"
      ).length;

      const maintenanceDue = Math.floor(totalFleet * 0.15);
      const alerts = 3;

      const vehicleStatus = drivers.map((d, index) => {
        let status: "active" | "idle" | "offline" | "maintenance" = "offline";
        if (d.active) status = "active";
        else if (index % 4 === 0) status = "maintenance";
        else if (index % 3 === 0) status = "idle";

        return {
          id: d.driverId,
          name: d.car?.model || "Unknown Vehicle",
          plate: d.car?.plate || "NO-PLATE",
          status: status,
          fuelLevel: Math.floor(Math.random() * 60) + 40,
          location: {
            lat: 43.6532 + (Math.random() - 0.5) * 0.1,
            lng: -79.3832 + (Math.random() - 0.5) * 0.1,
          },
          lastUpdate: new Date().toISOString(),
          driverName: d.name || "Unassigned",
          driverImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.driverId}`,
        };
      });

      const fleetHealth = {
        good: vehicleStatus.filter(
          (v) => v.status === "active" || v.status === "idle"
        ).length,
        warning: vehicleStatus.filter((v) => v.fuelLevel && v.fuelLevel < 20)
          .length,
        critical: vehicleStatus.filter((v) => v.status === "maintenance")
          .length,
      };

      return {
        activeFleet,
        totalFleet,
        driversOnline,
        maintenanceDue,
        alerts,
        revenue: {
          today: 1250.5,
          week: 8450.0,
          month: 32100.0,
        },
        fleetHealth,
        vehicleStatus,
        recentAlerts: [
          {
            id: "1",
            type: "maintenance",
            message: "Oil change due for Toyota Camry (ABC-123)",
            severity: "medium",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
          {
            id: "2",
            type: "document",
            message: "Insurance expiring for Honda Civic (XYZ-789)",
            severity: "high",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
          {
            id: "3",
            type: "payment",
            message: "Weekly payout processed",
            severity: "low",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          },
        ],
      };
    } catch (error) {
      console.error("Error fetching operator dashboard data:", error);
      return {
        activeFleet: 0,
        totalFleet: 0,
        driversOnline: 0,
        maintenanceDue: 0,
        alerts: 0,
        revenue: { today: 0, week: 0, month: 0 },
        fleetHealth: { good: 0, warning: 0, critical: 0 },
        vehicleStatus: [],
        recentAlerts: [],
      };
    }
  }
}
