import { requirePermission } from "@/lib/auth";
import { FleetPage } from "@/components/FleetPage";

export default async function VehicleTypesPage() {
  await requirePermission("fleet", "view");
  return <FleetPage defaultTab="vehicle-types" />;
}
