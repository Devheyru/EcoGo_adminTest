import { redirect } from "next/navigation";
import { revokeSession } from "@/lib/auth";

export async function GET() {
  await revokeSession();
  redirect("/login");
}
