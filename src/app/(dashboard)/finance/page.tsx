import { FinancePage } from "@/components/FinancePage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("finance", "read");
  return <FinancePage />;
}
