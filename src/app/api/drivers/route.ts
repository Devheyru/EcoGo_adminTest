import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { DriverRepository } from "@/lib/repositories/driverRepository";
import { z } from "zod";
import { verifyToken } from "@/utils/verifyToken";
import { RoleRepository } from "@/lib/repositories/roleRepository";
import { hasPermission } from "@/lib/roles";

const DEFAULT_DRIVER_PASSWORD = "123456";

const createDriverSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  vehicleType: z.enum(["car", "bajaj", "bike"]),
  vehicleModel: z.string().min(2),
  vehicleColor: z.string().min(2),
  licensePlate: z.string().min(2),
  location: z.string().min(2),
});

// GET: List all drivers
export async function GET(req: Request) {
  try {
    // 1. Verify Authentication
    const token = await verifyToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check Permissions
    // We need to fetch the user's role to check permissions
    const userDoc = await adminDb.collection("users").doc(token.uid).get();
    const userData = userDoc.data();
    const tokenRole =
      (token as any)?.role || (token as any)?.roleId || (token as any)?.roles;
    const roleId = userData?.role || userData?.roleId || tokenRole || "rider";

    const roleDoc = await RoleRepository.getRole(roleId);
    const permissions = roleDoc?.permissions;
    if (!hasPermission(permissions, "drivers", "read")) {
      const debug = {
        uid: token.uid,
        userExists: !!userDoc.exists,
        userRoleField: userData
          ? { role: (userData as any).role, roleId: (userData as any).roleId }
          : null,
        tokenRole: tokenRole || null,
        resolvedRoleId: roleId,
        permissionSource: "RoleRepository",
        permissionSnapshot: permissions || null,
      };
      console.warn("Permission denied for GET /api/drivers", debug);
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions", debug },
        { status: 403 }
      );
    }

    // 3. Fetch Drivers
    const drivers = await DriverRepository.getDrivers();
    return NextResponse.json(drivers);
  } catch (error: any) {
    console.error("Error fetching drivers:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Create a new driver
export async function POST(req: Request) {
  try {
    // 1. Verify Authentication
    const token = await verifyToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check Permissions
    const userDoc = await adminDb.collection("users").doc(token.uid).get();
    const userData = userDoc.data();
    const tokenRole =
      (token as any)?.role || (token as any)?.roleId || (token as any)?.roles;
    const roleId = userData?.role || userData?.roleId || tokenRole || "rider";

    const roleDoc = await RoleRepository.getRole(roleId);
    const permissions = roleDoc?.permissions;

    if (!hasPermission(permissions, "drivers", "create")) {
      const debug = {
        uid: token.uid,
        userExists: !!userDoc.exists,
        userRoleField: userData
          ? { role: (userData as any).role, roleId: (userData as any).roleId }
          : null,
        tokenRole: tokenRole || null,
        resolvedRoleId: roleId,
        permissionSource: "RoleRepository",
        permissionSnapshot: permissions || null,
      };
      console.warn("Permission denied for POST /api/drivers", debug);
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions", debug },
        { status: 403 }
      );
    }

    // 3. Parse and Validate Body
    const body = await req.json();
    const validatedFields = createDriverSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid fields",
          errors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      vehicleType,
      vehicleModel,
      vehicleColor,
      licensePlate,
      location,
    } = validatedFields.data;

    // 4. Check Uniqueness
    const phoneCheck = await adminDb
      .collection("drivers")
      .where("phone", "==", phone)
      .get();
    if (!phoneCheck.empty) {
      return NextResponse.json(
        { success: false, error: "Phone number already in use" },
        { status: 409 }
      );
    }

    const plateCheck = await adminDb
      .collection("vehicles")
      .where("plateNumber", "==", licensePlate)
      .get();
    if (!plateCheck.empty) {
      return NextResponse.json(
        { success: false, error: "License plate already registered" },
        { status: 409 }
      );
    }

    // 5. Create User in Auth
    const userRecord = await adminAuth.createUser({
      email,
      displayName: name,
      phoneNumber: phone.startsWith("+") ? phone : undefined,
      emailVerified: true,
      password: DEFAULT_DRIVER_PASSWORD,
    });

    // 6. Set Custom Claims
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: "driver" });

    // 7. Create User Document
    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ");

    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      role: "driver",
      roleId: "driver",
      firstName,
      lastName,
      name,
      phone,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 8. Create Vehicle Document
    const vehicleRef = adminDb.collection("vehicles").doc();
    await vehicleRef.set({
      id: vehicleRef.id,
      driverId: userRecord.uid,
      type: vehicleType,
      model: vehicleModel,
      color: vehicleColor,
      plateNumber: licensePlate,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 9. Create Driver Document
    await adminDb.collection("drivers").doc(userRecord.uid).set({
      id: userRecord.uid,
      uid: userRecord.uid,
      name,
      email,
      phone,
      vehicleId: vehicleRef.id,
      vehicleType,
      vehicleModel,
      vehicleColor,
      licensePlate,
      location,
      rating: 5.0,
      totalTrips: 0,
      status: "active",
      isOnline: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, message: "Driver created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating driver:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create driver" },
      { status: 500 }
    );
  }
}
