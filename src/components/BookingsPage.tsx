"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  XCircle,
  CheckCircle,
  Filter,
  Navigation,
  User,
  Car,
  Calendar,
} from "lucide-react";
import { Ride, RideStatus } from "@/types/ride";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import Logo from "./Logo";

export function BookingsPage() {
  const [bookings, setBookings] = useState<Ride[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to 'rides' collection
    const q = query(collection(db, "rides"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ridesData = snapshot.docs.map((doc) => ({
          rideId: doc.id,
          ...doc.data(),
        })) as Ride[];
        setBookings(ridesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.rideId.toLowerCase().includes(searchLower) ||
      booking.pickup.address?.toLowerCase().includes(searchLower) ||
      booking.dropoff.address?.toLowerCase().includes(searchLower) ||
      booking.riderId.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: RideStatus) => {
    const colors: Record<string, string> = {
      requested: "bg-yellow-100 text-yellow-800 border-yellow-200",
      accepted: "bg-blue-100 text-blue-800 border-blue-200",
      on_trip: "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      no_show: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || colors.no_show;
  };

  const handleStatusUpdate = async (rideId: string, newStatus: RideStatus) => {
    try {
      await updateDoc(doc(db, "rides", rideId), {
        status: newStatus,
        ...(newStatus === "cancelled"
          ? {
              cancellation: {
                by: "system",
                reason: "Admin cancelled",
                at: new Date().toISOString(),
              },
            }
          : {}),
      });
      toast.success(`Booking updated to ${newStatus}`);
      setSelectedBooking(null);
    } catch (error) {
      toast.error("Failed to update booking status");
      console.error(error);
    }
  };

  const stats = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: Calendar,
      color: "text-gray-900",
      bg: "bg-gray-100",
    },
    {
      label: "Active / On Trip",
      value: bookings.filter(
        (b) => b.status === "on_trip" || b.status === "accepted"
      ).length,
      icon: Navigation,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Completed",
      value: bookings.filter((b) => b.status === "completed").length,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Cancelled",
      value: bookings.filter((b) => b.status === "cancelled").length,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  return (
    <div className="bg-white min-h-screen border-none shadow-md rounded-lg p-4">
      <div className="flex lg:hidden justify-center">
        <Logo />
      </div>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-1xl sm:text-3xl bg-(--charcoal-dark) text-white p-1 rounded-md inline-block">
              Dispatch & Bookings
            </h1>
            <p className="text-gray-500 mt-1 pl-1">
              Real-time monitoring of all rides and dispatch operations
            </p>
          </div>
          <Button className="bg-(--eco-green) hover:bg-(--eco-green)/90 text-white">
            <Navigation className="w-4 h-4 mr-2" />
            New Dispatch
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by ID, location, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Rides</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              {["all", "active", "completed", "cancelled"].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-0">
                  <div className="space-y-4">
                    {filteredBookings
                      .filter((b) => {
                        if (tab === "all") return true;
                        if (tab === "active")
                          return ["requested", "accepted", "on_trip"].includes(
                            b.status
                          );
                        return b.status === tab;
                      })
                      .map((booking) => (
                        <div
                          key={booking.rideId}
                          className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors gap-4"
                        >
                          {/* Ride Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono text-xs text-gray-500">
                                #{booking.rideId.slice(0, 8)}
                              </span>
                              <Badge
                                variant="outline"
                                className={getStatusColor(booking.status)}
                              >
                                {booking.status.replace("_", " ").toUpperCase()}
                              </Badge>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(booking.createdAt).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-start gap-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                  <span className="truncate max-w-[200px]">
                                    {booking.pickup.address || "Unknown Pickup"}
                                  </span>
                                </div>
                                <div className="w-0.5 h-3 bg-gray-200 ml-1" />
                                <div className="flex items-center gap-2 text-sm">
                                  <div className="w-2 h-2 rounded-full bg-red-500" />
                                  <span className="truncate max-w-[200px]">
                                    {booking.dropoff.address ||
                                      "Unknown Dropoff"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* User/Driver Info */}
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>
                                Rider: {booking.riderId.slice(0, 5)}...
                              </span>
                            </div>
                            {booking.driverId && (
                              <div className="flex items-center gap-2">
                                <Car className="w-4 h-4" />
                                <span>
                                  Driver: {booking.driverId.slice(0, 5)}...
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Price & Actions */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-lg">
                                ${booking.fare?.total?.toFixed(2) || "0.00"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {booking.type}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      ))}

                    {filteredBookings.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        No bookings found matching your criteria.
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Ride ID: {selectedBooking?.rideId}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Route Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="flex gap-3">
                      <div className="mt-1">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pickup</p>
                        <p className="font-medium text-sm">
                          {selectedBooking.pickup.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-1">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Dropoff</p>
                        <p className="font-medium text-sm">
                          {selectedBooking.dropoff.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Fare Breakdown
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${selectedBooking.fare?.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${selectedBooking.fare?.tax?.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>${selectedBooking.fare?.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Status & Actions
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current Status</span>
                      <Badge className={getStatusColor(selectedBooking.status)}>
                        {selectedBooking.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      {selectedBooking.status === "requested" && (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            handleStatusUpdate(
                              selectedBooking.rideId,
                              "accepted"
                            )
                          }
                        >
                          Force Assign Driver
                        </Button>
                      )}
                      {["requested", "accepted"].includes(
                        selectedBooking.status
                      ) && (
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() =>
                            handleStatusUpdate(
                              selectedBooking.rideId,
                              "cancelled"
                            )
                          }
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Participants
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rider ID</p>
                        <p className="text-sm font-mono">
                          {selectedBooking.riderId}
                        </p>
                      </div>
                    </div>
                    {selectedBooking.driverId && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Driver ID</p>
                          <p className="text-sm font-mono">
                            {selectedBooking.driverId}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
