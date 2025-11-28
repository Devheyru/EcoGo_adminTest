import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { requirePermission } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Enforce Admin Access
    await requirePermission("users", "create");

    // 2️⃣ Parse Request Body
    const body = await req.json();
    const roleId = body.roleId || body.role; // Handle both

    if (!body.name || !body.email || !roleId) {
      return NextResponse.json(
        { success: false, message: "name, email and roleId are required" },
        { status: 400 }
      );
    }

    // 3️⃣ CHECK IF EMAIL ALREADY EXISTS IN FIRESTORE
    const emailQuery = await adminDb
      .collection("users")
      .where("email", "==", body.email)
      .limit(1)
      .get();

    if (!emailQuery.empty) {
      return NextResponse.json(
        { success: false, message: "Email already exists in database" },
        { status: 409 }
      );
    }

    // 4️⃣ Create User in Firebase Auth
    let uid;
    try {
      const userRecord = await adminAuth.createUser({
        email: body.email,
        displayName: body.name,
        phoneNumber: body.phone || undefined,
        // password: "password123", // Optional: Set a default password or let them reset it
      });
      uid = userRecord.uid;

      // Set Custom Claims for Role
      await adminAuth.setCustomUserClaims(uid, { role: roleId });
    } catch (authError: any) {
      // If user already exists in Auth but not DB, we might want to proceed or error
      if (authError.code === "auth/email-already-exists") {
        // Try to find the user to link
        const userRecord = await adminAuth.getUserByEmail(body.email);
        uid = userRecord.uid;
      } else {
        throw authError;
      }
    }

    // 5️⃣ Create Firestore document
    const docRef = adminDb.collection("users").doc(uid);

    const userData = {
      uid,
      id: uid,
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      roleId: roleId,
      role: roleId, // Backward compatibility
      status: body.status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 6️⃣ Save user to DB
    await docRef.set(userData);

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        userId: uid,
        user: userData,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("CREATE USER ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
