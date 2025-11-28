import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import * as admin from "firebase-admin";
import { verifyToken } from "@/utils/verifyToken";
import { RoleRepository } from "@/lib/repositories/roleRepository";
import { hasPermission } from "@/lib/roles";

// GET → Fetch all users
export async function GET(req: NextRequest) {
  try {
    // Authenticate the request via bearer token
    const token = await verifyToken(req as Request);
    if (!token) {
      return errorResponse("Unauthorized", 401);
    }

    // Fetch user role and permissions
    const userDoc = await adminDb.collection("users").doc(token.uid).get();
    const userData = userDoc.data();
    const roleId = userData?.role || userData?.roleId || "rider";
    const roleDoc = await RoleRepository.getRole(roleId);
    const permissions = roleDoc?.permissions;

    if (!hasPermission(permissions, "users", "read")) {
      return errorResponse("Forbidden: insufficient permissions", 403);
    }

    const snapshot = await adminDb.collection("users").get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return successResponse({ users });
  } catch (err: any) {
    console.error("Error fetching users:", err);
    return errorResponse(err.message || "Failed to fetch users", 500);
  }
}

// POST → Create new user
export async function POST(req: NextRequest) {
  try {
    // Authenticate
    const token = await verifyToken(req as Request);
    if (!token) {
      return errorResponse("Unauthorized", 401);
    }

    // Permission check
    const callerDoc = await adminDb.collection("users").doc(token.uid).get();
    const callerData = callerDoc.data();
    const callerRoleId = callerData?.role || callerData?.roleId || "rider";
    const callerRoleDoc = await RoleRepository.getRole(callerRoleId);
    const callerPermissions = callerRoleDoc?.permissions;

    if (!hasPermission(callerPermissions, "users", "create")) {
      return errorResponse("Forbidden: insufficient permissions", 403);
    }

    const body = await req.json();

    // Basic validation
    if (!body.name || !body.email || !body.roleId) {
      return errorResponse("name, email, and roleId are required.", 400);
    }

    const newUser = {
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      roleId: body.roleId,
      status: "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("users").add(newUser);

    return successResponse(
      {
        id: docRef.id,
        user: newUser,
      },
      201
    );
  } catch (err: any) {
    console.error("Error creating user:", err);
    return errorResponse(err.message || "Failed to create user", 500);
  }
}
