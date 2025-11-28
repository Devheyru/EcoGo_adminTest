import { adminDb } from "@/lib/firebase/admin";
import { Ride } from "@/types";

export interface ChartData {
  date: string;
  count?: number;
  revenue?: number;
}

export interface DashboardStats {
  totalTrips: number;
  activeDrivers: number;
  totalRevenue: number;
  activeRiders: number;
  bookingsTrend: ChartData[];
  revenueTrend: ChartData[];
  topRoutes: { id: number; route: string; count: number }[];
  vehicleUtilization: { type: string; percentage: number }[];
}

export class AnalyticsRepository {
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      const sevenDaysAgoIso = sevenDaysAgo.toISOString();

      // Run aggregations in parallel
      const [
        ridesSnapshot,
        driversSnapshot,
        ridersSnapshot,
        recentRidesSnapshot,
        allDriversSnapshot,
      ] = await Promise.all([
        adminDb.collection("rides").count().get(),
        adminDb
          .collection("drivers")
          .where("status", "==", "active")
          .count()
          .get(),
        adminDb.collection("users").where("role", "==", "rider").count().get(),
        adminDb
          .collection("rides")
          .where("createdAt", ">=", sevenDaysAgoIso)
          .get(),
        adminDb.collection("drivers").get(),
      ]);

      // Process recent rides for trends
      const trendsMap = new Map<string, { count: number; revenue: number }>();

      // Initialize last 7 days with 0
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toLocaleDateString("en-US", { weekday: "short" });
        trendsMap.set(dateStr, { count: 0, revenue: 0 });
      }

      recentRidesSnapshot.docs.forEach((doc) => {
        const ride = doc.data() as Ride;
        if (ride.createdAt) {
          const date = new Date(ride.createdAt);
          const dateStr = date.toLocaleDateString("en-US", {
            weekday: "short",
          });

          if (trendsMap.has(dateStr)) {
            const current = trendsMap.get(dateStr)!;
            trendsMap.set(dateStr, {
              count: current.count + 1,
              revenue: current.revenue + (ride.fare?.total || 0),
            });
          }
        }
      });

      const trendsArray = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toLocaleDateString("en-US", { weekday: "short" });
        const data = trendsMap.get(dateStr) || { count: 0, revenue: 0 };
        trendsArray.push({ date: dateStr, ...data });
      }

      // Vehicle Utilization
      const totalDrivers = allDriversSnapshot.size;
      let active = 0;
      let maintenance = 0;
      let idle = 0;

      allDriversSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const status = data.status || (data.active ? "active" : "idle");

        if (status === "active" || status === "on-trip") active++;
        else if (status === "maintenance") maintenance++;
        else idle++;
      });

      const vehicleUtilization = [
        {
          type: "Active",
          percentage: totalDrivers
            ? Math.round((active / totalDrivers) * 100)
            : 0,
        },
        {
          type: "Maintenance",
          percentage: totalDrivers
            ? Math.round((maintenance / totalDrivers) * 100)
            : 0,
        },
        {
          type: "Idle",
          percentage: totalDrivers
            ? Math.round((idle / totalDrivers) * 100)
            : 0,
        },
      ];

      const mockTopRoutes = [
        { id: 1, route: "Downtown -> Airport", count: 145 },
        { id: 2, route: "Union Station -> Yorkdale", count: 98 },
        { id: 3, route: "CN Tower -> Rogers Centre", count: 76 },
        { id: 4, route: "UofT -> Scarborough", count: 54 },
      ];

      // Base revenue + recent revenue
      const totalRevenue =
        12500 + trendsArray.reduce((acc, curr) => acc + curr.revenue, 0);

      return {
        totalTrips: ridesSnapshot.data().count,
        activeDrivers: driversSnapshot.data().count,
        totalRevenue: totalRevenue,
        activeRiders: ridersSnapshot.data().count,
        bookingsTrend: trendsArray.map((t) => ({
          date: t.date,
          count: t.count,
        })),
        revenueTrend: trendsArray.map((t) => ({
          date: t.date,
          revenue: t.revenue,
        })),
        topRoutes: mockTopRoutes,
        vehicleUtilization: vehicleUtilization,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalTrips: 0,
        activeDrivers: 0,
        totalRevenue: 0,
        activeRiders: 0,
        bookingsTrend: [],
        revenueTrend: [],
        topRoutes: [],
        vehicleUtilization: [],
      };
    }
  }
}
