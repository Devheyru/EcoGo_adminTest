import { adminAuth } from "@/lib/firebase/admin";
import { DecodedIdToken } from "firebase-admin/auth";

export async function verifyToken(
  req: Request
): Promise<DecodedIdToken | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}
