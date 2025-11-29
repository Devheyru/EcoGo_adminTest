import { NextResponse, NextRequest } from "next/server";
import * as admin from "firebase-admin";
import { ROLE_PERMISSIONS } from "@/lib/permissions";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN_KEY!)
    ),
  });
}

const db = admin.firestore();

export type Role = keyof typeof ROLE_PERMISSIONS;

function getRole(request: NextRequest): Role {
  const r = request.headers.get("x-user-role") || "driver";
  return (r in ROLE_PERMISSIONS ? r : "driver") as Role;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const role = getRole(request);
  if (!ROLE_PERMISSIONS[role]?.users.read) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  return NextResponse.json({ id });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const role = getRole(request);
  if (!ROLE_PERMISSIONS[role]?.users.update) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const body = await request.json();

  const docRef = db.collection("users").doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await docRef.update({
    ...body,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ message: "User updated" });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const role = getRole(request);
  if (!ROLE_PERMISSIONS[role]?.users.delete) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const docRef = db.collection("users").doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await docRef.delete();

  return NextResponse.json({ message: "User deleted", id });
}
