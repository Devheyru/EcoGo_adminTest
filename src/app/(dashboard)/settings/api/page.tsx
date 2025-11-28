import { SettingsPage } from "@/components/SettingsPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("settings", "read");
  return <SettingsPage defaultTab="security" />;
}
