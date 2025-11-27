import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
// import { getRole } from "@/lib/auth";
import { ROLE_PERMISSIONS } from "@/lib/permissions";



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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Rider ID is required" },
        { status: 400 }
      );
    }

    const doc = await adminDb.collection("riders").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, message: "Rider not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      rider: { id: doc.id, ...doc.data() },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { id } = await context.params;

    const updates = await req.json();

    const riderRef = adminDb.collection("riders").doc(id);
    const doc = await riderRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, message: "Rider not found" },
        { status: 404 }
      );
    }

    const riderData = doc.data() as any;

    await riderRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    // ALSO update the user's record
    if (riderData.userId) {
      await adminDb
        .collection("users")
        .doc(riderData.userId)
        .update({
          ...updates,
          updatedAt: new Date(),
        })
        .catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Rider updated successfully",
      updates,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { id } = await context.params;

    const riderRef = adminDb.collection("riders").doc(id);
    const doc = await riderRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, message: "Rider not found" },
        { status: 404 }
      );
    }

    const riderData = doc.data() as any;

    // Delete rider from riders collection
    await riderRef.delete();

    // Delete corresponding user
    if (riderData.userId) {
      await adminDb
        .collection("users")
        .doc(riderData.userId)
        .delete()
        .catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Rider and linked user deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
