import { SupportPage } from "@/components/SupportPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("support", "read");
  return <SupportPage defaultTab="complaints" />;
}
