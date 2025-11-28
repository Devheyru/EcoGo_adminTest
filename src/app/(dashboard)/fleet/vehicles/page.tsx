import { requirePermission } from "@/lib/auth";
import { FleetPage } from "@/components/FleetPage";

export default async function VehiclesPage() {
  await requirePermission("fleet", "view");
  return <FleetPage defaultTab="vehicles" />;
}
