import { requirePermission } from "@/lib/auth";
import { MarketingPage } from "@/components/MarketingPage";

export default async function RewardsPage() {
  await requirePermission("marketing", "view");
  return <MarketingPage defaultTab="rewards" />;
}
