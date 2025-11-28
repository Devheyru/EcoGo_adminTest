import { BookingsPage } from "@/components/BookingsPage";
import { requirePermission } from "@/lib/auth";

export default async function Page() {
  await requirePermission("rides", "read");
  return <BookingsPage />;
}
