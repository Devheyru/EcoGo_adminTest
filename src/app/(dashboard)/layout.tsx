import { Sidebar } from "@/components/Sidebar";
import { requireUser } from "@/lib/auth";
import TopActionsBar from "@/components/TopActionsBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        userPermissions={user.permissions || {}}
        userName={user.firstName || user.email}
      />
      <main className="flex-1 overflow-y-auto relative">
        <TopActionsBar />
        {children}
      </main>
    </div>
  );
}
