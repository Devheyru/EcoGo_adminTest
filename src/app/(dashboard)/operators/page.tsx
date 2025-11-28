import { OperatorsPage } from "@/components/OperatorsPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("operators", "read");
  return <OperatorsPage />;
}
