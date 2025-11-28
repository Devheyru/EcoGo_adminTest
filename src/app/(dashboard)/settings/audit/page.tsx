import { ReportsPage } from "@/components/ReportsPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  const user = await requirePermission("settings", "read");
  return <ReportsPage userPermissions={user.permissions || {}} />;
}
