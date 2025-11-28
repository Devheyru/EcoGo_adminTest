"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Wallet, Star, Clock } from "lucide-react";
import { User } from "@/types/user";
import { RiderDashboardData } from "@/lib/repositories/dashboardRepository";

interface RiderDashboardProps {
  user: User;
  data: RiderDashboardData;
}

export function RiderDashboard({ user, data }: RiderDashboardProps) {
  const stats = [
    {
      label: "Total Rides",
      value: data.totalRides.toString(),
      icon: MapPin,
      color: "var(--eco-green)",
    },
    {
      label: "Wallet Balance",
      value: `$${data.walletBalance.toFixed(2)}`,
      icon: Wallet,
      color: "var(--eco-green)",
    },
    {
      label: "My Rating",
      value: data.rating.toFixed(1),
      icon: Star,
      color: "#FFD700",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-bold text-2xl text-(--charcoal-dark)">
          Rider Dashboard
        </h1>
        <p className="text-gray-600">Hello, {user.name}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Recent Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentRides.length === 0 ? (
                <p className="text-gray-500">No recent rides found.</p>
              ) : (
                data.recentRides.map((ride) => (
                  <div
                    key={ride.rideId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">
                          Ride to {ride.dropoff.address || "Destination"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {ride.createdAt
                            ? new Date(ride.createdAt).toLocaleString()
                            : "Unknown Date"}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-(--charcoal-dark)">
                      ${ride.fare?.total?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-(--charcoal-dark) text-white">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <button className="w-full py-3 bg-(--eco-green) rounded-lg font-bold mb-3 hover:opacity-90 transition-opacity">
              Book a Ride
            </button>
            <button className="w-full py-3 bg-white/10 rounded-lg font-bold hover:bg-white/20 transition-colors">
              Add Funds
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
