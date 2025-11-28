import CreateUserForm from "@/components/forms/CreateUserForm";
import { requireAdmin } from "@/lib/auth";

export default async function Page() {
  await requireAdmin();
  return <CreateUserForm />;
}
