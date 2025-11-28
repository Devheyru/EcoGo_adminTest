import { DriversPage } from "@/components/DriversPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("drivers", "read");
  return <DriversPage />;
}
