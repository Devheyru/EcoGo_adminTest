import { requirePermission } from "@/lib/auth";
import { MarketingPage } from "@/components/MarketingPage";

export default async function ReferralPage() {
  await requirePermission("marketing", "view");
  return <MarketingPage defaultTab="referral" />;
}
