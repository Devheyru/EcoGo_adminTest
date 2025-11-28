import { PromoCodesPage } from "@/components/PromoCodesPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("promo_codes", "read");
  return <PromoCodesPage />;
}
