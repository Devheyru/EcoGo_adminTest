// app/api/drivers/[id]/route.ts

import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";
import { ROLE_PERMISSIONS } from "../../../../lib/permissions";
import { getRoleById } from "../../../../lib/getRole";
import * as admin from "firebase-admin";

type UpdateDriverBody = {
  licenseNumber?: string;
  name?: string;
  email?: string;
  phone?: string;
  licenseExpiry?: string;
  drivingExperienceYears?: number;
  vehicleId?: string | null;
  status?: "pending" | "approved" | "rejected" | "active" | "suspended";
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  gender?: string;
  // other driver-specific fields
};

// GET single driver
export type Role = keyof typeof ROLE_PERMISSIONS;

function getRole(request: Request): Role {
  const r = request.headers.get("x-user-role") || "driver";
  return (r in ROLE_PERMISSIONS ? r : "driver") as Role;
}
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const role = getRole(req);

    if (!ROLE_PERMISSIONS[role]?.users.read) {
      return NextResponse.json(
        { error: "Permission denied (READ)" },
        { status: 403 }
      );
    }
    const { id } = await context.params; // ✅ FIXED

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Driver ID is required" },
        { status: 400 }
      );
    }

    const doc = await adminDb.collection("drivers").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, message: "Driver not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      driver: { id: doc.id, ...doc.data() },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH update driver
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = getRole(req);

    if (!ROLE_PERMISSIONS[role]?.users.read) {
      return NextResponse.json(
        { error: "Permission denied (READ)" },
        { status: 403 }
      );
    }
    const { id } = await params;

    const updates = (await req.json()) as UpdateDriverBody;

    const docRef = adminDb.collection("drivers").doc(id);
    const doc = await docRef.get();

    if (!doc.exists)
      return NextResponse.json(
        { success: false, message: "Driver not found" },
        { status: 404 }
      );

    const driverData = doc.data() as any;

    // =============== CHECK LICENSE UNIQUE ===============
    if (
      updates.licenseNumber &&
      updates.licenseNumber !== driverData.licenseNumber
    ) {
      const q = await adminDb
        .collection("drivers")
        .where("licenseNumber", "==", updates.licenseNumber)
        .limit(1)
        .get();

      if (!q.empty)
        return NextResponse.json(
          { success: false, message: "License number already in use" },
          { status: 409 }
        );
    }

    // =============== UPDATE DRIVER COLLECTION ===============
    await docRef.update({ ...updates, updatedAt: new Date() });

    // =============== SYNC CHANGES TO USER COLLECTION ===============
    if (driverData.userId) {
      const userUpdates: any = {};

      if (updates.name) userUpdates.name = updates.name;
      if (updates.phone) userUpdates.phone = updates.phone;
      if (updates.email) userUpdates.email = updates.email;

      // When driver is approved
      if (updates.status === "approved") {
        userUpdates.approvedDriver = true;
      }

      userUpdates.updatedAt = new Date();

      // Only update if there are actual changes
      if (Object.keys(userUpdates).length > 0) {
        await adminDb
          .collection("users")
          .doc(driverData.userId)
          .update(userUpdates);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Driver updated and user synced",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const role = getRole(req);

    if (!ROLE_PERMISSIONS[role]?.users.read) {
      return NextResponse.json(
        { error: "Permission denied (READ)" },
        { status: 403 }
      );
    }
    const { id } = await params;

    const driverRef = adminDb.collection("drivers").doc(id);
    const driverSnap = await driverRef.get();

    if (!driverSnap.exists) {
      return NextResponse.json(
        { success: false, message: "Driver not found" },
        { status: 404 }
      );
    }

    const driverData = driverSnap.data() as any;

    // 1️⃣ Delete the driver document
    await driverRef.delete();

    // 2️⃣ DELETE THE USER COMPLETELY
    if (driverData?.userId) {
      await adminDb.collection("users").doc(driverData.userId).delete();
    }

    return NextResponse.json({
      success: true,
      message: "Driver and linked user deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
