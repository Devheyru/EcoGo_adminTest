import { ITSupportPage } from "@/components/ITSupportPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("it", "read");
  return <ITSupportPage />;
}
