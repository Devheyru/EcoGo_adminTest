import { FleetPage } from "@/components/FleetPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("fleet", "read");
  return <FleetPage />;
}
