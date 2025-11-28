import { adminDb } from "@/lib/firebase/admin";
import { User } from "@/types/user";
import { Vehicle } from "@/types/vehicle";
import { DriverDocument, MergedDriver } from "@/types/driver";
import { RoleRepository } from "./roleRepository";
import { UserRepository } from "./userRepository";

// Helper to serialize Firestore Timestamps to ISO strings
const serializeFirestoreData = (data: any): any => {
  if (data === null || data === undefined) return data;

  // Handle Firestore Timestamp objects (with toDate method)
  if (typeof data.toDate === "function") {
    return data.toDate().toISOString();
  }

  // Handle raw Firestore Timestamp objects (with _seconds)
  if (
    typeof data === "object" &&
    "_seconds" in data &&
    "_nanoseconds" in data
  ) {
    return new Date(data._seconds * 1000).toISOString();
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map(serializeFirestoreData);
  }

  // Handle Objects
  if (typeof data === "object") {
    const serialized: any = {};
    for (const key in data) {
      serialized[key] = serializeFirestoreData(data[key]);
    }
    return serialized;
  }

  return data;
};

export class DriverRepository {
  static async getDrivers(): Promise<MergedDriver[]> {
    try {
      // 1. Fetch all drivers
      const driversSnapshot = await adminDb.collection("drivers").get();

      if (driversSnapshot.empty) {
        console.log("No drivers found in DB, using mock data.");
        return this.getMockDrivers();
      }

      const drivers = driversSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...serializeFirestoreData(data),
        };
      }) as DriverDocument[];

      // 2. Fetch related data in parallel
      const mergedDrivers = await Promise.all(
        drivers.map(async (driver) => {
          // Fetch User
          let user: User | null = null;
          if (driver.userId) {
            user = await UserRepository.getUser(driver.userId);
          }

          // Fetch Vehicle
          let vehicle: Vehicle | null = null;
          if (driver.vehicleId) {
            const vehicleDoc = await adminDb
              .collection("vehicles")
              .doc(driver.vehicleId)
              .get();
            if (vehicleDoc.exists) {
              const vehicleData = vehicleDoc.data();
              vehicle = {
                id: vehicleDoc.id,
                ...serializeFirestoreData(vehicleData),
              } as Vehicle;
            }
          }

          // Fetch Permissions (via User Role)
          let permissions = {};
          if (user && user.role) {
            const roleDoc = await RoleRepository.getRole(user.role);
            if (roleDoc) {
              permissions = roleDoc.permissions || {};
            }
          }

          return {
            id: driver.id,
            driver,
            user,
            vehicle,
            permissions,
          };
        })
      );

      return mergedDrivers;
    } catch (error) {
      console.error("Error fetching drivers:", error);
      return this.getMockDrivers();
    }
  }

  static getMockDrivers(): MergedDriver[] {
    return [
      {
        id: "D001",
        driver: {
          id: "D001",
          name: "Mock Driver 1",
          phone: "123-456-7890",
          role: "driver",
          status: "active",
          isOnline: true,
          licenseNumber: "LIC-123",
          licenseExpiry: "2025-12-31",
          rating: 4.8,
          totalTrips: 150,
          userId: "U001",
          vehicleId: "V001",
          updatedAt: new Date().toISOString(),
        },
        user: {
          id: "U001",
          uid: "U001",
          name: "Mock Driver 1",
          email: "driver1@example.com",
          role: "driver",
          status: "active",
          createdAt: new Date().toISOString(),
        } as User,
        vehicle: {
          id: "V001",
          model: "Toyota Camry",
          plateNumber: "ABC-123",
          color: "White",
          type: "car",
          status: "active",
          createdAt: new Date().toISOString(),
        },
        permissions: {
          drivers: { read: true, update: true, delete: false },
          vehicles: { read: true },
          rides: { read: true },
        },
      },
      {
        id: "D002",
        driver: {
          id: "D002",
          name: "Mock Driver 2",
          phone: "987-654-3210",
          role: "driver",
          status: "inactive",
          isOnline: false,
          licenseNumber: "LIC-456",
          licenseExpiry: "2024-06-30",
          rating: 0,
          totalTrips: 0,
          userId: "U002",
          vehicleId: "V002",
          updatedAt: new Date().toISOString(),
        },
        user: {
          id: "U002",
          uid: "U002",
          name: "Mock Driver 2",
          email: "driver2@example.com",
          role: "driver",
          status: "active",
          createdAt: new Date().toISOString(),
        } as User,
        vehicle: {
          id: "V002",
          model: "Honda Civic",
          plateNumber: "XYZ-789",
          color: "Black",
          type: "car",
          status: "active",
          createdAt: new Date().toISOString(),
        },
        permissions: {
          drivers: { read: true, update: true, delete: false },
          vehicles: { read: true },
          rides: { read: true },
        },
      },
    ];
  }
}
