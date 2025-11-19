"use client";
import { useRouter } from "next/navigation";

import { auth, db } from "../firebase/config";
import { useEffect } from "react";

import { onAuthStateChanged } from "firebase/auth";
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
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  getDocs,
} from "firebase/firestore";
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
} from "lucide-react";
import { toast } from "sonner";

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
  licensePlate: string;
  rating: number;
  totalTrips: number;
  status: "active" | "offline" | "on-trip";
  location: string;
  active: boolean;
}

export function DriversPage() {
  const [drivers, setDrivers] = useState<Drivers[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Drivers | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [newDriverVehicleType, setNewDriverVehicleType] = useState("");
  const [riders, setRiders] = useState<Rider[]>([]);
  const [adminData, setAdminData] = useState<AdminData | null>(null);

  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  // const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // const [riders, setRiders] = useState<UserData[]>([]);
  const [rides, setRides] = useState<RideData[]>([]);

 useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, async (user) => {
     if (!user) {
       router.push("/login");
       return;
     }

     const adminRef = doc(db, "admins", user.uid);
     const adminSnap = await getDoc(adminRef);

    if (adminSnap.exists()) {
      const data = adminSnap.data();

      setAdminData({
        id: user.uid,
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        email: data.email ?? "",
        role: data.role ?? "",
        mobile: data.mobile ?? "",
        canOverride: data.canOverride ?? false,
      });

      loadAllData();
    } else {
      router.push("/login");
    }


     setLoading(false);
   });

   return () => unsubscribe();
 }, []);

  const loadAllData = () => {
    // 🔵 Real-time: Drivers

    // 🟢 Real-time: Riders
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


    //  // 🟠 Real-time: Rides

    // Return all unsubs so you can close listeners when admin logs out or leaves page
    return () => {
      unsubscribeDrivers();
    };
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      // driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Drivers["status"]) => {
    const colors = {
      active: { bg: "#D0F5DC", text: "#1B6635" },
      offline: { bg: "#E6E6E6", text: "#2D2D2D" },
      "on-trip": { bg: "#2DB85B", text: "white" },
    };
    return colors[status];
  };

  const stats = [
    { label: "Total Drivers", value: drivers.length },
    {
      label: "Active Now",
      value: drivers.filter((d) => d.status === "active").length,
    },
    {
      label: "On Trip",
      value: drivers.filter((d) => d.status === "on-trip").length,
    },
    {
      label: "Offline",
      value: drivers.filter((d) => d.status === "offline").length,
    },
    { label: "Online", value: drivers.filter((d) => d.active).length },
  ];
  const totalRevenue = drivers.reduce((sum, driver) => sum + driver.rating, 0);
  const totalTrips = drivers.reduce(
    (sum, driver) => sum + driver.totalTrips,
    0
  );

  const handleAddDriver = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDriver: Drivers = {
      id: `D${String(drivers.length + 1).padStart(3, "0")}`,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      vehicleType: newDriverVehicleType,
      licensePlate: formData.get("licensePlate") as string,
      rating: 5.0,
      totalTrips: 0,
      status: "offline",
      active: false,
      location: formData.get("location") as string,
    };
    setDrivers([...drivers, newDriver]);
    setIsAddDialogOpen(false);
    toast.success(`Driver ${newDriver.name} added successfully!`);
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
    <div className="bg-white h-full border-none shadow-md rounded-lg p-6">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              style={{ color: "var(--charcoal-dark)" }}
              className="font-bold text-4xl"
            >
              Drivers Dashboard
            </h1>
            <p style={{ color: "var(--charcoal-dark)" }} className="text-lg">
              Manage and monitor all drivers
            </p>
          </div>
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
        !bg-[white]
        border border-[#ffffff]"
              style={{
                backgroundColor: "#1E1E1E",
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
                      <SelectItem value="EV Sedan">EV Sedan</SelectItem>
                      <SelectItem value="EV SUV">EV SUV</SelectItem>
                      <SelectItem value="EV Compact">EV Compact</SelectItem>
                      <SelectItem value="EV Van">EV Van</SelectItem>
                    </SelectContent>
                  </Select>
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

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-white border-none shadow-md">
              <CardContent className="pt-6">
                <h3 style={{ color: "#2DB85B" }}>{stat.value}</h3>
                <p style={{ color: "#2D2D2D" }}>{stat.label}</p>
              </CardContent>
            </Card>
          ))}
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
                        <Badge>{driver.status}</Badge>
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
                    <div>
                      <p className="text-sm" style={{ color: "#2D2D2D" }}>
                        Total Trips
                      </p>
                      <p className="text-sm">{driver.totalTrips}</p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 p-3 rounded-lg"
                    style={{ backgroundColor: "#D0F5DC" }}
                  >
                    <Car className="w-4 h-4" style={{ color: "#2DB85B" }} />
                    <div className="flex-1">
                      <p className="text-sm">{driver.vehicleType}</p>
                      <p className="text-sm" style={{ color: "#2D2D2D" }}>
                        {driver.licensePlate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: "#2DB85B" }} />
                    {/* <p className="text-sm" style={{ color: '#2D2D2D' }}>{driver}</p> */}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedDriver(driver);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      style={{ backgroundColor: "#2DB85B", color: "white" }}
                      className="flex-1"
                      onClick={() => {
                        setSelectedDriver(driver);
                        setIsMessageDialogOpen(true);
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent
            className="max-w-md p-6 rounded-lg shadow-xl text-[#1E1E1E] bg-white
        !bg-[white]
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
                  <Badge>{selectedDriver.status}</Badge>
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
                      {selectedDriver.vehicleType} -{" "}
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
        !bg-[white]
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
