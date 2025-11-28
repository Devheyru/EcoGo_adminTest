import { adminDb } from "@/lib/firebase/admin";
import { User } from "@/types";
import { RoleRepository } from "./roleRepository";

export type { User };

export class UserRepository {
  static async getUser(uid: string, claims?: any): Promise<User | null> {
    try {
      // 1. Fetch User from 'users' collection
      const userDoc = await adminDb.collection("users").doc(uid).get();

      if (!userDoc.exists) {
        // Fallback: Check 'admins' collection for legacy support
        const adminDoc = await adminDb.collection("admins").doc(uid).get();
        if (adminDoc.exists) {
          const data = adminDoc.data();
          // Legacy admins are always admins
          const roleId = "admin";
          const roleDoc = await RoleRepository.getRole(roleId);
          const permissions = roleDoc?.permissions || {};

          return {
            uid,
            id: uid,
            email: data?.email || "",
            roleId: roleId,
            role: roleId,
            permissions: permissions,
            firstName: data?.firstName,
            lastName: data?.lastName,
            name:
              data?.name ||
              `${data?.firstName || ""} ${data?.lastName || ""}`.trim(),
            photoURL: data?.photoURL,
            status: "active",
            createdAt:
              data?.createdAt?.toDate?.().toISOString() ||
              new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          } as User;
        }

        // Fallback: Check custom claims if provided (User in Auth but not in Firestore)
        if (claims?.role) {
          const roleId = claims.role;
          const roleDoc = await RoleRepository.getRole(roleId);
          const permissions = roleDoc?.permissions || {};

          return {
            uid,
            id: uid,
            email: claims.email || "",
            roleId: roleId,
            role: roleId,
            permissions: permissions,
            firstName: "",
            lastName: "",
            name: claims.name || claims.email || "Unknown",
            status: "active",
            createdAt: new Date().toISOString(),
          } as User;
        }

        return null;
      }

      const data = userDoc.data();
      const roleId = data?.roleId || data?.role || "rider"; // Fallback to role field if roleId missing

      // 2. Fetch Role Permissions
      const roleDoc = await RoleRepository.getRole(roleId);
      const permissions = roleDoc?.permissions || {};

      return {
        uid,
        id: uid,
        email: data?.email || "",
        roleId: roleId,
        role: roleId, // For backward compatibility
        permissions: permissions,
        firstName: data?.firstName,
        lastName: data?.lastName,
        name:
          data?.name ||
          `${data?.firstName || ""} ${data?.lastName || ""}`.trim(),
        photoURL: data?.photoURL,
        status: (data?.status as any) || "active",
        createdAt:
          data?.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        lastLogin: data?.lastLogin?.toDate?.().toISOString(),
        kyc: data?.kyc,
        wallet: data?.wallet,
        rating: data?.rating,
        metadata: data?.metadata,
      } as User;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  static async listUsers(): Promise<User[]> {
    try {
      const snapshot = await adminDb.collection("users").get();
      // Note: For listing 1000s of users, fetching roles for each might be slow.
      // In a real app, we might join this data or cache roles heavily.
      // Since we have RoleRepository cache, it should be fast after first hit.

      const users = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const roleId = data.roleId || data.role || "rider";

          // Optional: Don't fetch permissions for list view to save performance
          // unless explicitly needed.
          // const roleDoc = await RoleRepository.getRole(roleId);

          return {
            uid: doc.id,
            id: doc.id,
            email: data.email || "",
            roleId: roleId,
            role: roleId,
            // permissions: roleDoc?.permissions || [],
            firstName: data.firstName,
            lastName: data.lastName,
            name:
              data.name ||
              `${data.firstName || ""} ${data.lastName || ""}`.trim(),
            photoURL: data.photoURL,
            status: (data.status as any) || "active",
            createdAt:
              data.createdAt?.toDate?.().toISOString() ||
              new Date().toISOString(),
            lastLogin: data.lastLogin?.toDate?.().toISOString(),
          } as User;
        })
      );

      return users;
    } catch (error) {
      console.error("Error listing users:", error);
      return [];
    }
  }
}
