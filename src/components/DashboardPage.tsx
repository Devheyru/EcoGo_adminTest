"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  Car,
  DollarSign,
  School,
  Package,
  Dog,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Logo from "./Logo";

export interface DashboardMetrics {
  totalTrips: number;
  activeDrivers: number;
  totalRevenue: number;
  activeRiders: number;
  bookingsTrend: any[];
  revenueTrend: any[];
  topRoutes: any[];
  vehicleUtilization: any[];
}

export function DashboardPage({ metrics }: { metrics?: DashboardMetrics }) {
  const stats = [
    {
      label: "Total Trips",
      value: metrics?.totalTrips.toString() || "0",
      change: "+32.5%",
      color: "var(--eco-green)",
      icon: TrendingUp,
    },
    {
      label: "Active Drivers",
      value: metrics?.activeDrivers.toString() || "0",
      change: "+53.2%",
      color: "var(--charcoal-dark)",
      icon: Car,
    },
    {
      label: "Total Revenue",
      value: `$${metrics?.totalRevenue.toLocaleString() || "0"}`,
      change: "+25.2%",
      color: "var(--eco-green)",
      icon: DollarSign,
    },
    {
      label: "Active Riders",
      value: metrics?.activeRiders.toString() || "0",
      change: "+83.3%",
      color: "var(--charcoal-dark)",
      icon: Users,
    },
  ];

  // NEW SECTION — SERVICE CATEGORY METRICS
  const serviceStats = [
    {
      label: "Student Drop-off",
      value: "37",
      color: "var(--eco-green)",
      icon: School,
    },
    {
      label: "Individual Rides",
      value: "58",
      color: "var(--eco-green)",
      icon: Car,
    },
    {
      label: "Group / Rideshare",
      value: "30",
      color: "var(--charcoal-dark)",
      icon: Users,
    },
    {
      label: "Pet Delivery",
      value: "12",
      color: "var(--eco-green)",
      icon: Dog,
    },
    {
      label: "Parcel / Courier",
      value: "40",
      color: "var(--charcoal-dark)",
      icon: Package,
    },
  ];

  const COLORS = [
    "var(--eco-green)",
    "var(--charcoal-dark)",
    " #d3d3d3",
    "var(--charcoal-text)",
  ];

  return (
    <div className="bg-white border-none shadow-md      rounded-lg  p-4">
      <div className="flex lg:hidden justify-center">
        <Logo />
      </div>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1
            // style={{ color: "var(--charcoal-dark)" }}
            className="font-bold text-1xl sm:text-2xl  bg-(--charcoal-dark) text-white p-1 rounded-md"
          >
            Admin Dashboard
          </h1>
          <p style={{ color: "var(--charcoal-dark)" }} className="text-lg pl-2">
            Overview of your EcoGo operations
          </p>
        </div>

        {/* Stats Grid (Total Trips, Drivers, Revenue, Riders) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-white border-none shadow-lg">
                <CardContent className="pt-2">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                    <span
                      className="text-sm px-2 py-1 rounded"
                      style={{
                        backgroundColor: "var(--gray-light)",
                        color: "var(--charcoal-dark)",
                      }}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <p
                      className="text-lg"
                      style={{ color: "var(--charcoal-dark)" }}
                    >
                      {stat.label}
                    </p>
                    <h3 style={{ color: "#2D2D2D" }}>{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* NEW SECTION — SERVICE TYPE BREAKDOWN */}
        <div>
          <h2 className="font-bold text-xl mb-4 bg-(--charcoal-dark) text-white p-1 rounded-md">
            Service Type Breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {serviceStats.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.label}
                  className="bg-white border-none shadow-lg"
                >
                  <CardContent className="py-2">
                    {/* ICON + VALUE ON SAME ROW */}
                    <div className="flex items-center justify-between ">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: item.color }}
                        />
                      </div>

                      <h3 className=" font-normal ">{item.value}</h3>
                    </div>

                    {/* LABEL ON SEPARATE ROW */}
                    <p
                      className="text-sm mt-2 font-medium"
                      style={{ color: "var(--charcoal-dark)" }}
                    >
                      {item.label}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-none shadow-md ">
            <CardHeader className="p-2 flex justify-center">
              <CardTitle className="bg-(--charcoal-dark) text-white p-1 rounded-md w-60">
                Bookings Trend (7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics?.bookingsTrend || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--gray-mid)"
                  />
                  <XAxis dataKey="date" stroke="var(--charcoal-dark)" />
                  <YAxis stroke="var(--charcoal-dark)" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--eco-green)"
                    strokeWidth={2}
                    name="Bookings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-md">
            <CardHeader className=" p-2 flex justify-center">
              <CardTitle className="bg-(--charcoal-dark) text-white p-1 rounded-md text-center mb-1 w-65">
                Revenue Trend (7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics?.revenueTrend || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--gray-mid)"
                  />
                  <XAxis dataKey="date" stroke="var(--charcoal-dark)" />
                  <YAxis stroke="var(--charcoal-dark)" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    fill="#343B41"
                    name="Revenue ($)"
                    barSize={55}
                    activeBar={{ fill: "var(--eco-green)" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className=" bg-white border-none shadow-md">
            <CardHeader>
              <CardTitle>Top Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(metrics?.topRoutes || []).map((route, index) => {
                  const maxCount = (metrics?.topRoutes || [])[0]?.count || 1;
                  const percentage = (route.count / maxCount) * 100;
                  return (
                    <div key={route.route}>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-sm"
                          style={{ color: "var(--charcoal-dark)" }}
                        >
                          {route.route}
                        </span>
                        <span
                          className={`${
                            route.id === 1 ? "text-(--eco-green)" : ""
                          }`}
                        >
                          {route.count}
                        </span>
                      </div>
                      <div
                        className="w-full h-2 rounded-full"
                        style={{ backgroundColor: "white" }}
                      >
                        <div
                          className={`h-full rounded-full transition-all`}
                          style={{
                            backgroundColor: "var(--charcoal-dark)",
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="  border-none shadow-md">
            <CardHeader>
              <CardTitle>Vehicle Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics?.vehicleUtilization || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {(metrics?.vehicleUtilization || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
