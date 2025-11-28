import { ReportsPage } from "@/components/ReportsPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  const user = await requirePermission("reports", "view");
  return <ReportsPage userPermissions={user.permissions || {}} />;
}
