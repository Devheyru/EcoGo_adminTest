import { MarketingPage } from "@/components/MarketingPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("marketing", "read");
  return <MarketingPage />;
}
