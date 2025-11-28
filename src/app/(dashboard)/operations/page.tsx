import { OperationsPage } from "@/components/OperationsPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("operations", "read");
  return <OperationsPage />;
}
