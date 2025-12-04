import { RiderReportsPage } from "@/components/RiderReportsPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  const user = await requirePermission("reports", "read");
  return <RiderReportsPage />;
}
