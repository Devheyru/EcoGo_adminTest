import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, car } = body;

    // Basic validation
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, password, and phone are required",
        },
        { status: 400 }
      );
    }

    // 1. Check if user exists
    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 409 }
      );
    } catch (error: any) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // 2. Create User in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone,
    });

    // 3. Set Custom Claims
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: "driver" });

    // 4. Create Firestore Document in 'users' collection
    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ");

    const userData = {
      uid: userRecord.uid,
      id: userRecord.uid,
      email,
      roleId: "driver",
      role: "driver",
      firstName,
      lastName,
      name,
      phone,
      status: "pending", // Drivers usually need approval/verification
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await adminDb.collection("users").doc(userRecord.uid).set(userData);

    // 5. Create Firestore Document in 'drivers' collection
    const driverData = {
      driverId: userRecord.uid,
      uid: userRecord.uid, // Redundant but useful
      car: car || {}, // { make, model, year, plate, color }
      active: false,
      status: "offline",
      backgroundCheckStatus: "pending",
      trainingCompleted: false,
      rating: {
        avg: 5.0,
        count: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await adminDb.collection("drivers").doc(userRecord.uid).set(driverData);

    return NextResponse.json(
      {
        success: true,
        message: "Driver registered successfully. Pending approval.",
        userId: userRecord.uid,
        user: userData,
        driver: driverData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("DRIVER REGISTRATION ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
