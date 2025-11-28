import { adminDb } from "@/lib/firebase/admin";
import { RoleDocument } from "@/types/role";
import { PERMISSIONS, UserRole, ROLES } from "@/lib/roles";

// Simple in-memory cache for roles to avoid redundant DB reads
// In a serverless environment (like Next.js API routes), this might reset often,
// but it helps within a single request lifecycle or warm container.
const roleCache: Record<string, RoleDocument> = {};

export class RoleRepository {
  static async getRole(roleId: string): Promise<RoleDocument | null> {
    if (roleCache[roleId]) {
      return roleCache[roleId];
    }

    try {
      // Try fetching exact match
      let doc = await adminDb.collection("roles").doc(roleId).get();

      // If not found, try capitalized version (e.g. "admin" -> "Admin")
      // This handles cases where DB IDs were manually created with different casing
      if (!doc.exists) {
        const capitalized = roleId.charAt(0).toUpperCase() + roleId.slice(1);
        if (capitalized !== roleId) {
          const docCap = await adminDb
            .collection("roles")
            .doc(capitalized)
            .get();
          if (docCap.exists) {
            doc = docCap;
          }
        }
      }

      if (doc.exists) {
        const data = doc.data() as RoleDocument;

        // Check if permissions are legacy array or missing, and fallback to defaults if so
        const lowerRoleId = roleId.toLowerCase().trim();
        let permissions = data.permissions;

        // Determine default permissions based on role ID
        let defaultPerms: any = undefined;
        if (lowerRoleId in PERMISSIONS) {
          defaultPerms = PERMISSIONS[lowerRoleId as UserRole];
        } else if (lowerRoleId === "super admin") {
          defaultPerms = PERMISSIONS[ROLES.SUPER_ADMIN];
        }

        if (Array.isArray(permissions) || !permissions) {
          if (defaultPerms) {
            permissions = defaultPerms;
          } else {
            permissions = {};
          }
        } else {
          // If permissions exist and are an object, merge with defaults to ensure new modules are visible
          if (defaultPerms) {
            // Deep merge to preserve actions within resources
            const merged = { ...defaultPerms };
            for (const key in permissions) {
              if (
                permissions[key] &&
                typeof permissions[key] === "object" &&
                merged[key] &&
                typeof merged[key] === "object"
              ) {
                merged[key] = { ...merged[key], ...permissions[key] };
              } else {
                merged[key] = permissions[key];
              }
            }
            permissions = merged;
          }
        }

        // Ensure ID is set
        const roleData = { ...data, id: doc.id, permissions };
        roleCache[roleId] = roleData;
        return roleData;
      }

      // Fallback to hardcoded permissions if not found in DB
      // Normalize to lowercase to match PERMISSIONS keys
      const lowerRoleId = roleId.toLowerCase();
      if (lowerRoleId in PERMISSIONS) {
        const fallbackRole: RoleDocument = {
          id: roleId,
          name: roleId.charAt(0).toUpperCase() + roleId.slice(1),
          permissions: PERMISSIONS[lowerRoleId as UserRole],
          createdAt: new Date().toISOString(),
          status: "active",
        };
        roleCache[roleId] = fallbackRole;
        return fallbackRole;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching role ${roleId}:`, error);
      // Try fallback on error too
      const lowerRoleId = roleId.toLowerCase();
      if (lowerRoleId in PERMISSIONS) {
        return {
          id: roleId,
          name: roleId.charAt(0).toUpperCase() + roleId.slice(1),
          permissions: PERMISSIONS[lowerRoleId as UserRole],
          createdAt: new Date().toISOString(),
          status: "active",
        };
      }
      return null;
    }
  }

  static async getAllRoles(): Promise<RoleDocument[]> {
    try {
      const snapshot = await adminDb.collection("roles").get();
      const roles = snapshot.docs.map((doc) => ({
        ...(doc.data() as RoleDocument),
        id: doc.id,
      }));

      // Update cache
      roles.forEach((role) => {
        roleCache[role.id] = role;
      });

      return roles;
    } catch (error) {
      console.error("Error fetching all roles:", error);
      return [];
    }
  }
}
