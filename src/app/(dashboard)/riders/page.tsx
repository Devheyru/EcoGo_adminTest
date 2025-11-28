import { RidersPage } from "@/components/RidersPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("riders", "read");
  return <RidersPage />;
}
