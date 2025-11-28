"use client";
import { useRouter } from "next/navigation";

import { auth, db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// Using API GET + polling for drivers
import {
  Search,
  UserPlus,
  Star,
  Car,
  MapPin,
  MessageSquare,
  Eye,
  TrendingUp,
  Calendar,
  DollarSign,
  WifiOff,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import Logo from "./Logo";

interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalTrips: number;
  totalSpent: number;
  memberSince: string;
  lastTrip: string;
  status: "active" | "inactive" | "suspended";
}
interface RideData {
  id: string;
  pickup: string;
  destination: string;
  name: string;
  fare: number;
  status: string;
  riderId: string;
  driverId: string;
}
interface AdminData {
  id: string;
  mobile: string;
  phone?: string;
  canOverride: boolean;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}
interface Drivers {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleColor: string;
  licensePlate: string;
  rating: number;
  totalTrips: number;
  status: "active" | "inactive" | "suspended";
  location: string;
  isOnline: boolean;
}

// Using API routes for driver creation/fetching. Server Actions removed.

export function DriversPage() {
  const [drivers, setDrivers] = useState<Drivers[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Drivers | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [newDriverVehicleType, setNewDriverVehicleType] = useState("car");
  const [riders, setRiders] = useState<Rider[]>([]);
  const [adminData, setAdminData] = useState<AdminData | null>(null);

  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  // const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // const [riders, setRiders] = useState<UserData[]>([]);
  const [rides, setRides] = useState<RideData[]>([]);

  useEffect(() => {
    // 🔵 Real-time: Drivers - REPLACED with Server Action for Join
    const unsubscribeDrivers = onSnapshot(
      collection(db, "drivers"),
      (snapshot) => {
        setDrivers(
          snapshot.docs.map((doc) => {
            const data = doc.data() as any;

            // Normalize status to the UI's expected values
            let status: Drivers["status"] = "inactive";
            if (data.status) {
              const raw = String(data.status).toLowerCase();
              if (raw === "active") status = "active";
              else if (raw === "suspended") status = "suspended";
              else if (raw === "offline" || raw === "inactive")
                status = "inactive";
              else if (raw === "on-trip") status = "active"; // treat on-trip as active
            } else if (data.isOnline) {
              status = "active";
            }

            return {
              id: doc.id,
              name: data.name ?? "",
              email: data.email ?? "",
              phone: data.phone ?? "",
              vehicleType: data.vehicleType ?? "",
              vehicleModel: data.vehicleModel ?? "",
              vehicleColor: data.vehicleColor ?? "",
              licensePlate: data.licensePlate ?? "",
              rating: data.rating ?? 0,
              totalTrips: data.totalTrips ?? 0,
              status,
              location: data.location ?? "",
              isOnline: !!data.isOnline,
            } as Drivers;
          })
        );
      }
    );

    return () => {
      unsubscribeDrivers();
    };
  }, []);

  /*
  const loadAllData = () => {
    // 🔵 Real-time: Drivers - REPLACED with Server Action for Join
    getDriversAction().then((mergedDrivers: MergedDriver[]) => {
      const mappedDrivers: Drivers[] = mergedDrivers.map((md) => ({
        id: md.id,
        name: md.driver.name || md.user?.name || "Unknown",
        email: md.user?.email || md.driver.email || "",
        phone: md.driver.phone || "",
        vehicleType: md.vehicle?.type || md.driver.vehicleType || "Unknown",
        licensePlate: md.vehicle?.plateNumber || md.driver.licensePlate || "NO-PLATE",
        rating: md.driver.rating || 0,
        totalTrips: md.driver.totalTrips || 0,
        status: md.driver.status || "inactive",
        location: md.driver.location || "Unknown",
        isOnline: md.driver.isOnline || false,
      }));
      setDrivers(mappedDrivers);
    });
    */

  // 🟢 Real-time: Riders
  const unsubscribeDrivers = () => {}; // No-op since we use server action now

  /* 
    const unsubscribeDrivers = onSnapshot(
      collection(db, "drivers"),
      (snapshot) => {
        setDrivers(
          snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
              id: doc.id,
              name: data.name ?? "",

              email: data.email ?? "",
              phone: data.phone ?? "",
              vehicleType: data.vehicleType ?? "",
              licensePlate: data.licensePlate ?? "",
              rating: data.rating ?? 0,
              totalTrips: data.totalTrips ?? 0,
              status:
                (data.status as "active" | "offline" | "on-trip") ?? "offline",
              location: data.location ?? "",
              active: data.active ?? false,
            } satisfies Drivers;
          })
        );
      }
    );
    */

  //  // 🟠 Real-time: Rides

  // Return all unsubs so you can close listeners when admin logs out or leaves page
  /*
    return () => {
      unsubscribeDrivers();
    };
  };
  */

  const filteredDrivers = drivers.filter(
    (driver) =>
      // driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Drivers["status"]) => {
    const colors = {
      active: { bg: "#D0F5DC", text: "#1B6635" },
      inactive: { bg: "#E6E6E6", text: "#2D2D2D" },
      suspended: { bg: "#FEE2E2", text: "#DC2626" },
    };
    return colors[status] || colors.inactive;
  };

  const stats = [
    {
      label: "Total Drivers",
      value: drivers.length,
      icon: UserPlus,
      color: "text-black",
    },
    {
      label: "Active Accounts",
      value: drivers.filter((d) => d.status === "active").length,
      icon: TrendingUp,
      color: "text-black",
    },
    {
      label: "Suspended",
      value: drivers.filter((d) => d.status === "suspended").length,
      icon: Calendar,
      color: "text-red-500",
    },

    {
      label: "Online Now",
      value: drivers.filter((d) => d.isOnline).length,
      icon: Wifi,
      color: "text-green-500",
    },
    {
      label: "Offline",
      value: drivers.filter((d) => !d.isOnline).length,
      icon: WifiOff,
      color: "text-yellow-500",
    },
  ];
  const totalRevenue = drivers.reduce((sum, driver) => sum + driver.rating, 0);
  const totalTrips = drivers.reduce(
    (sum, driver) => sum + driver.totalTrips,
    0
  );

  const handleAddDriver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("vehicleType", newDriverVehicleType);

    // Convert FormData to JSON for API
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      vehicleType: formData.get("vehicleType"),
      vehicleModel: formData.get("vehicleModel"),
      vehicleColor: formData.get("vehicleColor"),
      licensePlate: formData.get("licensePlate"),
      location: formData.get("location"),
    };

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/drivers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsAddDialogOpen(false);
        toast.success(`Driver ${data.name} added successfully!`);
      } else {
        toast.error(result.error || "Failed to add driver");
      }
    } catch (error) {
      console.error("Error adding driver:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }
    toast.success(`Message sent to ${selectedDriver?.name}`);
    setIsMessageDialogOpen(false);
    setMessageText("");
  };

  return (
    <div className="bg-white min-h-screen border-none shadow-md rounded-lg p-4">
      <div className="flex lg:hidden justify-center">
        <Logo />
      </div>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full">
            <h1 className="font-bold text-1xl sm:text-3xl bg-(--charcoal-dark) text-white p-1 rounded-md w-full">
              Drivers Dashboard
            </h1>
            <p
              style={{ color: "var(--charcoal-dark)" }}
              className="text-lg pl-3"
            >
              Manage and monitor all drivers
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#2DB85B", color: "white" }}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-md p-6 rounded-lg shadow-xl
        text-[#1E1E1E] bg-white
        border border-[#ffffff]"
              style={{
                backgroundColor: "#ffffff",
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
              }}
            >
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
                <DialogDescription>
                  Add a new driver to the EcoGo fleet
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddDriver} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required
                    className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@ecogo.ca"
                    required
                    className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+1 416-555-0000"
                    required
                    className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select
                    value={newDriverVehicleType}
                    onValueChange={setNewDriverVehicleType}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]">
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="bajaj">Bajaj</SelectItem>
                      <SelectItem value="bike">Bike</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Vehicle Model</Label>
                  <Input
                    id="vehicleModel"
                    name="vehicleModel"
                    placeholder="e.g. Toyota Camry"
                    required
                    className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleColor">Vehicle Color</Label>
                  <Input
                    id="vehicleColor"
                    name="vehicleColor"
                    placeholder="e.g. White"
                    required
                    className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input
                    id="licensePlate"
                    name="licensePlate"
                    placeholder="ABC 123"
                    required
                    className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Base Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Downtown Toronto"
                    required
                    className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    style={{ backgroundColor: "#2DB85B", color: "white" }}
                  >
                    Add Driver
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-white border-none shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <h3 style={{ color: "#2D2D2D" }}>{stat.value}</h3>
                  </div>
                  <p style={{ color: "#2D2D2D" }}>{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-white border-none shadow-md rounded-lg h-10">
          <div className="relative bg-white border-none rounded-lg">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: "#2D2D2D" }}
            />
            <Input
              placeholder="Search drivers by name, email, or license plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-none rounded-lg focus:outline-none focus:ring-0 shadow-none"
              style={{
                boxShadow: "none", // removes internal shadow
                outline: "none", // removes browser outline
              }}
            />
          </div>
        </Card>
        <CardTitle className="bg-(--charcoal-dark) text-white p-1 rounded-md w-full">
          All Drivers
        </CardTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDrivers.map((driver) => {
            const statusColor = getStatusColor(driver.status);
            return (
              <Card
                key={driver.id}
                className="  bg-white border-none shadow-md  "
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {driver.name}
                        <Badge
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                          }}
                        >
                          {driver.status}
                        </Badge>
                        {driver.isOnline ? (
                          <Badge className="bg-green-500 text-white">
                            Online
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-400 text-white">
                            Offline
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm mt-1" style={{ color: "#2D2D2D" }}>
                        {driver.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{driver.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm" style={{ color: "#2D2D2D" }}>
                        Phone
                      </p>
                      <p className="text-sm">{driver.phone}</p>
                    </div>
                    <div className="font-bold text-lg flex items-center gap-3">
                      <p className="font-bold" style={{ color: "#2D2D2D" }}>
                        Total Trips:
                      </p>
                      <p className="font-bold">{driver.totalTrips}</p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 p-3 rounded-lg"
                    style={{ backgroundColor: "#d3d3d3" }}
                  >
                    <Car className="w-4 h-4" style={{ color: "#2DB85B" }} />
                    <div className="flex gap-6">
                      <p className="text-sm">{driver.vehicleType}</p>
                      <p className="text-sm" style={{ color: "#2D2D2D" }}>
                        {driver.licensePlate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-10">
                    <MapPin className="w-4 h-4" style={{ color: "#2DB85B" }} />
                    <div className="flex gap-2 pt-2 justify-end ">
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedDriver(driver);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                      </Button>
                      <Button
                        size="sm"
                        style={{ backgroundColor: "#2DB85B", color: "white" }}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedDriver(driver);
                          setIsMessageDialogOpen(true);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent
            className="max-w-md p-6 rounded-lg shadow-xl text-[#1E1E1E] bg-white
        border border-[#ffffff]"
          >
            <DialogHeader>
              <DialogTitle>Driver Profile</DialogTitle>
              <DialogDescription>
                View complete driver information
              </DialogDescription>
            </DialogHeader>
            {selectedDriver && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3>{selectedDriver.name}</h3>
                    <p className="text-sm mt-1" style={{ color: "#2D2D2D" }}>
                      {selectedDriver.email}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge>{selectedDriver.status}</Badge>
                    {selectedDriver.isOnline ? (
                      <Badge className="bg-green-500 text-white">Online</Badge>
                    ) : (
                      <Badge className="bg-gray-400 text-white">Offline</Badge>
                    )}
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 p-3 rounded-lg"
                  style={{ backgroundColor: "#D0F5DC" }}
                >
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <div>
                    <p>{selectedDriver.rating} Rating</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm" style={{ color: "#2D2D2D" }}>
                      Phone Number
                    </p>
                    <p>{selectedDriver.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: "#2D2D2D" }}>
                      Vehicle Information
                    </p>
                    <p>
                      {selectedDriver.vehicleColor}{" "}
                      {selectedDriver.vehicleModel}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedDriver.vehicleType} •{" "}
                      {selectedDriver.licensePlate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: "#2D2D2D" }}>
                      Base Location
                    </p>
                    <p>{selectedDriver.location}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={isMessageDialogOpen}
          onOpenChange={setIsMessageDialogOpen}
        >
          <DialogContent
            className="max-w-md  text-[#1E1E1E] bg-white
        border border-[#ffffff]"
          >
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
              <DialogDescription>
                Send a message to{" "}
                <span className="font-bold">{selectedDriver?.name}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsMessageDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  style={{ backgroundColor: "#2DB85B", color: "white" }}
                  onClick={handleSendMessage}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default DriversPage;
