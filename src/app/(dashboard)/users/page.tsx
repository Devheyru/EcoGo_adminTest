import { UsersPage } from "@/components/UsersPage";
import { requirePermission } from "@/lib/auth";
import { UserRepository } from "@/lib/repositories/userRepository";

export default async function Page() {
  await requirePermission("users", "read");
  const users = await UserRepository.listUsers();
  return <UsersPage initialUsers={users} />;
}
