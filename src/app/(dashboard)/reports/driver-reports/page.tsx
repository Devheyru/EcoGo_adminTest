import { DriverReportsPage } from "@/components/DriverReportsPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("reports", "read");
  return <DriverReportsPage />;
}
