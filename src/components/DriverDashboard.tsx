"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, DollarSign, Star, MapPin } from "lucide-react";
import { User } from "@/types/user";
import { DriverDashboardData } from "@/lib/repositories/dashboardRepository";

interface DriverDashboardProps {
  user: User;
  data: DriverDashboardData;
}

export function DriverDashboard({ user, data }: DriverDashboardProps) {
  const stats = [
    {
      label: "Total Trips",
      value: data.totalTrips.toString(),
      icon: Car,
      color: "var(--eco-green)",
    },
    {
      label: "Earnings",
      value: `$${data.earnings.toFixed(2)}`,
      icon: DollarSign,
      color: "var(--eco-green)",
    },
    {
      label: "Rating",
      value: data.rating.toFixed(1),
      icon: Star,
      color: "#FFD700",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-bold text-2xl text-(--charcoal-dark)">
          Driver Dashboard
        </h1>
        <p className="text-gray-600">Welcome back, {user.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-white border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-(--charcoal-dark)">
                    {stat.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentTrips.length === 0 ? (
              <p className="text-gray-500">No recent trips found.</p>
            ) : (
              data.recentTrips.map((trip) => (
                <div
                  key={trip.rideId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        Trip to {trip.dropoff.address || "Destination"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {trip.createdAt
                          ? new Date(trip.createdAt).toLocaleString()
                          : "Unknown Date"}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-(--eco-green)">
                    +${trip.fare?.total?.toFixed(2) || "0.00"}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
