import { TransactionsPage } from "@/components/TransactionsPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("transactions", "read");
  return <TransactionsPage />;
}
