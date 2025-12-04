// app/api/drivers/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";
import { ROLE_PERMISSIONS } from "../../../lib/permissions";
import { getRoleById } from "../../../lib/getRole";

// Type for incoming driver creation payload
type CreateDriverBody = {
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  drivingExperienceYears?: number;
  vehicleId?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  gender?: string;
};
export type Role = keyof typeof ROLE_PERMISSIONS;

function getRole(request: Request): Role {
  const r = request.headers.get("x-user-role") || "driver";
  return (r in ROLE_PERMISSIONS ? r : "driver") as Role;
}

// GET /api/drivers -> list all drivers (permission-controlled)
export async function GET(req: Request) {
  try {
    const role = getRole(req);

    if (!ROLE_PERMISSIONS[role]?.users.read) {
      return NextResponse.json(
        { error: "Permission denied (READ)" },
        { status: 403 }
      );
    }

    const snapshot = await adminDb.collection("drivers").get();
    const drivers = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, drivers });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // const role = getRole(req);

    // if (!ROLE_PERMISSIONS[role]?.users.read) {
    //   return NextResponse.json(
    //     { error: "Permission denied (READ)" },
    //     { status: 403 }
    //   );
    // }
    const body = (await req.json()) as CreateDriverBody;

    const {
      userId,
      name,
      email,
      phone,
      licenseNumber,
      licenseExpiry,
      drivingExperienceYears,
      vehicleId,
      country,
      state,
      city,
      address,
      postalCode,
      gender,
    } = body;

    // =====================================
    // 1️⃣ Basic: Validate license number (Optional now)
    // =====================================
    if (licenseNumber && licenseNumber.trim() !== "") {
      // License must be unique
      const licenseCheck = await adminDb
        .collection("drivers")
        .where("licenseNumber", "==", licenseNumber)
        .limit(1)
        .get();

      if (!licenseCheck.empty) {
        return NextResponse.json(
          { success: false, error: "License number already exists" },
          { status: 409 }
        );
      }
    }

    // =====================================
    // 2️⃣ Optional vehicle validation
    // =====================================
    if (vehicleId) {
      const vehicleDoc = await adminDb
        .collection("vehicles")
        .doc(vehicleId)
        .get();

      if (!vehicleDoc.exists) {
        return NextResponse.json(
          { success: false, error: "Vehicle not found" },
          { status: 404 }
        );
      }
    }

    // =====================================
    // 3️⃣ Handle user (reuse OR create)
    // =====================================
    let finalUserId = userId ?? null;

    if (finalUserId) {
      const userDoc = await adminDb.collection("users").doc(finalUserId).get();

      if (!userDoc.exists) {
        return NextResponse.json(
          { success: false, error: "Provided userId does not exist" },
          { status: 404 }
        );
      }

      // Ensure user is driver
      const userData = userDoc.data();
      if (userData?.role !== "driver") {
        await adminDb.collection("users").doc(finalUserId).update({
          role: "driver",
          updatedAt: new Date(),
        });
      }
    } else {
      // No userId provided -> create new user
      if (!email || !name) {
        return NextResponse.json(
          {
            success: false,
            error: "name and email are required to create a new user",
          },
          { status: 400 }
        );
      }

      // Reuse existing user with same email
      const emailCheck = await adminDb
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!emailCheck.empty) {
        finalUserId = emailCheck.docs[0].id;
        await adminDb.collection("users").doc(finalUserId).update({
          role: "driver",
          updatedAt: new Date(),
        });
      } else {
        // Create new user record
        const newUserRef = adminDb.collection("users").doc();
        finalUserId = newUserRef.id;

        await newUserRef.set({
          id: finalUserId,
          name,
          email,
          phone: phone || "",
          role: "driver",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // =====================================
    // 4️⃣ Create driver
    // =====================================
    const driverRef = adminDb.collection("drivers").doc();
    const driverId = driverRef.id;

    const driverData = {
      id: driverId,
      userId: finalUserId,
      name,
      email,
      phone: phone || "",
      role: "driver",

      licenseNumber: licenseNumber || null,
      licenseExpiry: licenseExpiry || null,
      drivingExperienceYears: drivingExperienceYears || 0,
      vehicleId: vehicleId || null,

      country: country || null,
      state: state || null,
      city: city || null,
      address: address || null,
      postalCode: postalCode || null,
      gender: gender || null,

      status: "active", // Default to active
      rating: 0,
      totalTrips: 0,
      walletBalance: 0,
      isOnline: false,
      isApproved: true, // Default to approved
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await driverRef.set(driverData);

    // =====================================
    // 5️⃣ Assign driver to vehicle if provided
    // =====================================
    if (vehicleId) {
      await adminDb.collection("vehicles").doc(vehicleId).update({
        assignedDriverId: driverId,
        isAssigned: true,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Driver created successfully",
        driverId,
        driver: driverData,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("CREATE DRIVER ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
