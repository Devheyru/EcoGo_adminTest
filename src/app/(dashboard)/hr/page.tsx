import { HRPage } from "@/components/HRPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("hr", "read");
  return <HRPage />;
}
