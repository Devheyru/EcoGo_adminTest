import { requirePermission } from "@/lib/auth";
import { MarketingPage } from "@/components/MarketingPage";

export default async function BroadcastPage() {
  await requirePermission("marketing", "view");
  return <MarketingPage defaultTab="broadcast" />;
}
