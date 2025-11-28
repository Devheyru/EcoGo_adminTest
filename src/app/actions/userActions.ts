"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { UserRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum([
    "super_admin",
    "admin",
    "operator",
    "driver",
    "rider",
    "finance",
    "hr",
    "it_support",
  ]),
});

export async function createUser(prevState: any, formData: FormData) {
  const validatedFields = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid fields",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, role } = validatedFields.data;

  try {
    // 1. Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      displayName: name,
      emailVerified: true, // Assume verified since admin created it
      password: "tempPassword123!", // In a real app, send an invite email
    });

    // Set custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    // 2. Create user document in Firestore
    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ");

    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      role,
      roleId: role, // Explicitly save roleId for RBAC
      firstName,
      lastName,
      name,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // If it's an admin, also add to 'admins' collection for double safety/legacy support
    if (role === "admin") {
      await adminDb.collection("admins").doc(userRecord.uid).set({
        uid: userRecord.uid,
        email,
        role,
        firstName,
        lastName,
        createdAt: new Date(),
      });
    }

    revalidatePath("/users");
    return { success: true, message: "User created successfully" };
  } catch (error: any) {
    console.error("Error creating user:", error);
    return { success: false, error: error.message || "Failed to create user" };
  }
}
