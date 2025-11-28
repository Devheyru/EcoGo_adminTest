import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // 1. Check if user exists in Auth or DB
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
      phoneNumber: phone || undefined,
    });

    // 3. Set Custom Claims
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: "rider" });

    // 4. Create Firestore Document in 'users' collection
    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ");

    const userData = {
      uid: userRecord.uid,
      id: userRecord.uid,
      email,
      roleId: "rider",
      role: "rider",
      firstName,
      lastName,
      name,
      phone: phone || "",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      wallet: {
        balance: 0,
        currency: "USD", // Default currency
      },
      rating: {
        avg: 5.0,
        count: 0,
      },
    };

    await adminDb.collection("users").doc(userRecord.uid).set(userData);

    return NextResponse.json(
      {
        success: true,
        message: "Rider registered successfully",
        userId: userRecord.uid,
        user: userData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("RIDER REGISTRATION ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
