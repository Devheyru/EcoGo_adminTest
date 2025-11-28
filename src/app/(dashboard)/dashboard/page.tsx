import { DashboardPage } from "@/components/DashboardPage";
import { DriverDashboard } from "@/components/DriverDashboard";
import { RiderDashboard } from "@/components/RiderDashboard";
import { OperatorDashboard } from "@/components/OperatorDashboard";
import { AnalyticsRepository } from "@/lib/repositories/analyticsRepository";
import { DashboardRepository } from "@/lib/repositories/dashboardRepository";
import { requireUser } from "@/lib/auth";

export default async function Page() {
  const user = await requireUser();

  // Render dashboard based on role
  if (user.role === "driver") {
    const data = await DashboardRepository.getDriverData(user.uid);
    return <DriverDashboard user={user} data={data} />;
  }

  if (user.role === "rider") {
    const data = await DashboardRepository.getRiderData(user.uid);
    return <RiderDashboard user={user} data={data} />;
  }

  if (user.role === "operator") {
    const data = await DashboardRepository.getOperatorData(user.uid);
    return <OperatorDashboard user={user} data={data} />;
  }

  // Default to Admin Dashboard for admins and support staff
  const metrics = await AnalyticsRepository.getDashboardStats();
  return <DashboardPage metrics={metrics} />;
}
