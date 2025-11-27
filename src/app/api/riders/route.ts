import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { ROLE_PERMISSIONS } from "@/lib/permissions";

// Request body type
type CreateRiderBody = {
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
};
export type Role = keyof typeof ROLE_PERMISSIONS;

function getRole(request: Request): Role {
  const r = request.headers.get("x-user-role") || "driver";
  return (r in ROLE_PERMISSIONS ? r : "driver") as Role;
}

export async function POST(
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
    const body = (await req.json()) as CreateRiderBody;
    const { userId, name, email, phone } = body;

    // Validate required fields
    if (!userId && (!name || !email || !phone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "name, email, phone are required when userId is not provided.",
        },
        { status: 400 }
      );
    }

    let finalUserId = userId ?? null;

    // -----------------------------------
    // 1️⃣ If userId is provided (existing user)
    // -----------------------------------
    if (finalUserId) {
      const existingUser = await adminDb
        .collection("users")
        .doc(finalUserId)
        .get();

      if (!existingUser.exists) {
        return NextResponse.json(
          { success: false, message: "Provided userId not found" },
          { status: 404 }
        );
      }

      // Always ensure user role = rider
      await adminDb.collection("users").doc(finalUserId).update({
        role: "rider",
        updatedAt: new Date(),
      });
    } else {
      // -----------------------------------
      // 2️⃣ Create new user if userId missing
      // -----------------------------------

      // check duplicate email
      const emailQuery = await adminDb
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!emailQuery.empty) {
        return NextResponse.json(
          { success: false, message: "Email already exists" },
          { status: 409 }
        );
      }

      // check duplicate phone
      const phoneQuery = await adminDb
        .collection("users")
        .where("phone", "==", phone)
        .limit(1)
        .get();

      if (!phoneQuery.empty) {
        return NextResponse.json(
          { success: false, message: "Phone number already exists" },
          { status: 409 }
        );
      }

      // create user
      const userRef = adminDb.collection("users").doc();
      finalUserId = userRef.id;

      await userRef.set({
        id: finalUserId,
        name,
        email,
        phone,
        role: "rider",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // -----------------------------------
    // 3️⃣ Create Rider Document
    // -----------------------------------
    const riderRef = adminDb.collection("riders").doc();
    const riderId = riderRef.id;

    const riderData = {
      id: riderId,
      userId: finalUserId,
      name,
      email,
      phone,
      totalTrips: 0,
      rating: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await riderRef.set(riderData);

    return NextResponse.json(
      {
        success: true,
        message: "Rider created successfully",
        riderId,
        rider: riderData,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("CREATE RIDER ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const role = getRole(req);

    if (!ROLE_PERMISSIONS[role]?.users.read) {
      return NextResponse.json(
        { error: "Permission denied (READ)" },
        { status: 403 }
      );
    }
    const snapshot = await adminDb.collection("riders").get();

    const riders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      total: riders.length,
      riders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
