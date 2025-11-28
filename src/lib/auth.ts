import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { UserRepository, User } from "@/lib/repositories/userRepository";
import { redirect } from "next/navigation";
import { ROLES, UserRole } from "@/lib/roles";
import { env } from "@/lib/env";

const SESSION_COOKIE_NAME = "session";

export async function createSessionCookie(idToken: string) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function revokeSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (session) {
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(session);
      await adminAuth.revokeRefreshTokens(decodedClaims.sub);
    } catch (error) {
      // Ignore error if session is invalid
    }
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!session) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    return await UserRepository.getUser(decodedClaims.uid, decodedClaims);
  } catch (error) {
    return null;
  }
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/api/auth/signout");
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<User> {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) {
    // Redirect to a 403 page or dashboard if they have some access
    redirect("/access-denied");
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  return requireRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]);
}

import { hasPermission } from "@/lib/roles";

export async function requirePermission(
  resource: string,
  action: string = "read"
): Promise<User> {
  const user = await requireUser();
  const allowed = hasPermission(user.permissions, resource, action);

  if (!allowed) {
    console.log(
      `Access denied for user ${user.email} (${user.role}) to ${resource}.${action}`
    );
    console.log("User permissions:", JSON.stringify(user.permissions, null, 2));
    // Redirect to dashboard or unauthorized page
    redirect("/access-denied");
  }
  return user;
}
