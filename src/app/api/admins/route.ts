import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { fullName, email, phone, department, address } = await req.json();

    // ---- Get role from roles collection ----
    const roleSnap = await adminDb
      .collection("roles")
      .where("role", "==", "admin")
      .limit(1)
      .get();

    if (roleSnap.empty) {
      return NextResponse.json(
        { success: false, error: "Admin role is missing in roles collection" },
        { status: 400 }
      );
    }

    const roleData = roleSnap.docs[0].data();
    const roleId = roleSnap.docs[0].id;

    // ---- Create user object ----
    const userRef = adminDb.collection("users").doc();
    const adminId = userRef.id;

    const userData = {
      fullName,
      email,
      phone,
      roleId,
      role: "admin",
      permissions: roleData.permissions ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // ---- Create admin specific object ----
    const adminData = {
      id: adminId,
      fullName,
      email,
      phone,
      department: department ?? null,
      address: address ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // ---- save documents ----
    await userRef.set(userData);
    await adminDb.collection("admins").doc(adminId).set(adminData);

    return NextResponse.json({
      success: true,
      admin: { ...adminData },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const snap = await adminDb.collection("admins").get();

    const admins = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ success: true, admins });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
