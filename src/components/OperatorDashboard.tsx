"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Car,
  Users,
  AlertTriangle,
  Wrench,
  MapPin,
  DollarSign,
  Activity,
  Battery,
  Fuel,
  Search,
  Filter,
} from "lucide-react";
import { User } from "@/types/user";
import { OperatorDashboardData } from "@/lib/repositories/dashboardRepository";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OperatorDashboardProps {
  user: User;
  data: OperatorDashboardData;
}

export function OperatorDashboard({ user, data }: OperatorDashboardProps) {
  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-bold text-3xl text-(--charcoal-dark)">
            Fleet Command Center
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user.name} • {data.totalFleet} Vehicles in Fleet
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Wrench className="w-4 h-4" /> Maintenance
          </Button>
          <Button className="bg-(--eco-green) hover:bg-(--eco-green)/90 text-white gap-2">
            <Car className="w-4 h-4" /> Add Vehicle
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue (Week)"
          value={`$${data.revenue.week.toLocaleString()}`}
          icon={DollarSign}
          trend="+12.5%"
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <MetricCard
          title="Active Fleet"
          value={`${data.activeFleet} / ${data.totalFleet}`}
          icon={Activity}
          trend={`${Math.round(
            (data.activeFleet / data.totalFleet) * 100
          )}% utilization`}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <MetricCard
          title="Fleet Health"
          value={`${data.fleetHealth.good} Good`}
          subValue={`${data.fleetHealth.critical} Critical`}
          icon={Car}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <MetricCard
          title="Active Alerts"
          value={data.alerts.toString()}
          icon={AlertTriangle}
          color="text-red-600"
          bgColor="bg-red-50"
          alert={data.alerts > 0}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fleet">Fleet Status</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Placeholder */}
            <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Live Fleet Map</span>
                  <Badge variant="outline" className="font-normal">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    Live Updates
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 relative h-[400px] bg-gray-100">
                {/* Mock Map UI */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-79.3832,43.6532,12,0/800x400?access_token=pk.mock')] bg-cover bg-center">
                  <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-[1px] flex flex-col items-center justify-center">
                    <MapPin className="w-12 h-12 text-gray-400 mb-2" />
                    <p>Interactive Map Integration</p>
                    <p className="text-sm text-gray-500">
                      Showing {data.activeFleet} active vehicles
                    </p>
                  </div>
                  {/* Mock Pins */}
                  {data.vehicleStatus.slice(0, 5).map((v, i) => (
                    <div
                      key={v.id}
                      className="absolute w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        top: `${50 + (Math.random() - 0.5) * 40}%`,
                        left: `${50 + (Math.random() - 0.5) * 40}%`,
                      }}
                    >
                      <Car
                        className={`w-4 h-4 ${
                          v.status === "active"
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts & Activity */}
            <div className="space-y-6">
              <Card className="border-none shadow-md h-full">
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.recentAlerts.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No active alerts
                      </p>
                    ) : (
                      data.recentAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="flex gap-3 items-start p-3 rounded-lg bg-gray-50 border border-gray-100"
                        >
                          <div
                            className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                              alert.severity === "high"
                                ? "bg-red-500"
                                : alert.severity === "medium"
                                ? "bg-orange-500"
                                : "bg-blue-500"
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(alert.timestamp).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* FLEET TAB */}
        <TabsContent value="fleet">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vehicle Management</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search plate, model..."
                    className="pl-8"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Driver</th>
                      <th className="p-4">Fuel/Charge</th>
                      <th className="p-4">Last Update</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.vehicleStatus.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <div className="font-medium">{vehicle.name}</div>
                          <div className="text-xs text-gray-500">
                            {vehicle.plate}
                          </div>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={vehicle.status} />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={vehicle.driverImage} />
                              <AvatarFallback>
                                {vehicle.driverName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>{vehicle.driverName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {vehicle.fuelLevel && vehicle.fuelLevel < 30 ? (
                              <Fuel className="w-4 h-4 text-orange-500" />
                            ) : (
                              <Battery className="w-4 h-4 text-green-500" />
                            )}
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  (vehicle.fuelLevel || 0) < 30
                                    ? "bg-orange-500"
                                    : "bg-green-500"
                                }`}
                                style={{ width: `${vehicle.fuelLevel}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {vehicle.fuelLevel}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-500">
                          {vehicle.lastUpdate
                            ? new Date(vehicle.lastUpdate).toLocaleTimeString()
                            : "-"}
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DRIVERS TAB (Placeholder) */}
        <TabsContent value="drivers">
          <Card className="border-none shadow-md p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Users className="w-12 h-12 text-gray-300" />
              <h3 className="text-lg font-medium">Driver Management</h3>
              <p className="text-gray-500 max-w-md">
                Manage your drivers, view performance reports, and handle
                payouts from this dedicated section.
              </p>
              <Button>View All Drivers</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components

function MetricCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  color,
  bgColor,
  alert,
}: any) {
  return (
    <Card
      className={`border-none shadow-sm ${alert ? "ring-2 ring-red-100" : ""}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
            {subValue && (
              <p className="text-sm text-gray-500 mt-1">{subValue}</p>
            )}
            {trend && (
              <p className="text-xs font-medium text-green-600 mt-2 flex items-center">
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700 border-green-200",
    idle: "bg-blue-100 text-blue-700 border-blue-200",
    maintenance: "bg-orange-100 text-orange-700 border-orange-200",
    offline: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || styles.offline
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
