import { DriverApplicationsPage } from "@/components/DriverApplicationsPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("driver_applications", "read");
  return <DriverApplicationsPage />;
}
