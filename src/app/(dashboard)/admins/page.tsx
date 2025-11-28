import { AdminsPage } from "@/components/AdminsPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("users", "read");
  return <AdminsPage />;
}
