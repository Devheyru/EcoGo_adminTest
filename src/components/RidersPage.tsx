"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  UserPlus,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { auth, db } from "../firebase/config";

import { useEffect } from "react";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalTrips: number;
  totalSpent: number;
  memberSince: Timestamp;
  lastTrip: Timestamp | null;
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

export function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [adminData, setAdminData] = useState<AdminData | null>(null);
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
      

      // useEffect(() => {
      //   const unsubscribe = onAuthStateChanged(auth, async (user) => {
      //     if (!user) {
      //       router.push("/riders");
      //       return;
      //     }

      //     const adminRef = doc(db, "admins", user.uid);
      //     const adminSnap = await getDoc(adminRef);

      //     if (adminSnap.exists()) {
      //       const data = adminSnap.data();

      //       setAdminData({
      //         id: user.uid,
      //         ...data,
      //       } as AdminData);

      //       loadAllData();
      //     } else {
      //       router.push("/login");
      //     }

      //     setLoading(false);
      //   });

      //   return () => unsubscribe();
      // }, []);
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
    const unsubscribeRides = onSnapshot(collection(db, "rides"), (snapshot) => {
      setRides(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            pickup: data.pickup ?? "",
            destination: data.destination ?? "",
            name: data.name ?? "",
            fare: data.fare ?? 0,
            status: data.status ?? "pending",
            riderId: data.riderId ?? "",
            driverId: data.driverId ?? "",
          } satisfies RideData;
        })
      );
    });


    // 🟠 Real-time: Rides
    const unsubscribeRiders = onSnapshot(
      collection(db, "riders"),
      (snapshot) => {
        setRiders(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name ?? "",
            email: doc.data().email ?? "",
            phone: doc.data().phone ?? "",
            totalTrips: doc.data().totalTrips ?? 0,
            totalSpent: doc.data().totalSpent ?? 0,
            memberSince: doc.data().memberSince ?? "",
            lastTrip: doc.data().lastTrip ?? "",
            status: doc.data().status ?? "inactive",
          })) as Rider[]
        );
      }
    );


    // Return all unsubs so you can close listeners when admin logs out or leaves page
    return () => {
      unsubscribeRiders();
      unsubscribeRides();
    };
  };

  const filteredRiders = riders.filter(
    (rider) =>
      rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Rider["status"]) => {
    const colors = {
      active: { bg: "#D0F5DC", text: "#1B6635" },
      inactive: { bg: "#E6E6E6", text: "#2D2D2D" },
      suspended: { bg: "#FEE2E2", text: "#991B1B" },
    };
    return colors[status];
  };

  const totalRevenue = riders.reduce((sum, rider) => sum + rider.totalSpent, 0);
  const totalTrips = riders.reduce((sum, rider) => sum + rider.totalTrips, 0);

  const stats = [
    { label: "Total Riders", value: riders.length, icon: UserPlus },
    {
      label: "Active Riders",
      value: riders.filter((r) => r.status === "active").length,
      icon: TrendingUp,
    },
    { label: "Total Trips", value: totalTrips, icon: Calendar },
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
    },
  ];

  const handleAddRider = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRider: Rider = {
      id: `R${String(riders.length + 1).padStart(3, "0")}`,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      totalTrips: 0,
      totalSpent: 0,
      memberSince: Timestamp.fromDate(new Date()),

      lastTrip: null,
      status: "active",
    };
    setRiders([...riders, newRider]);
    setIsAddDialogOpen(false);
    toast.success(`Rider ${newRider.name} added successfully!`);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }
    toast.success(`Message sent to ${selectedRider?.name}`);
    setIsMessageDialogOpen(false);
    setMessageText("");
  };

  return (
    <div className="bg-white h-screen border-none shadow-md rounded-lg p-8">
      <div className="p-6 space-y-6 ">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: "#2F3A3F" }} className="font-bold text-4xl">
              Riders Dashboard
            </h1>
            <p style={{ color: "#2D2D2D" }} className="text-lg">
              Manage and monitor all riders
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#2DB85B", color: "white" }}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Rider
              </Button>
            </DialogTrigger>

            <DialogContent
              className="
        max-w-md p-6 rounded-lg shadow-xl
        text-[#1E1E1E] bg-white
        !bg-[white]
        border border-[#ffffff]
      "
              style={{
                backgroundColor: "#1E1E1E",
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
              }}
            >
              <DialogHeader>
                <DialogTitle>Add New Rider</DialogTitle>
                <DialogDescription className="text-[#2D2D2D]">
                  Register a new rider in the system
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddRider} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Gem hund"
                    required
                    className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="gem@ecogo.ca"
                    required
                    className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+1 416-555-0000"
                    required
                    className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
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
                    Add Rider
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 w-full h-35 gap-32">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="bg-white border-none shadow-lg w-70"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#D0F5DC" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: "#2DB85B" }} />
                    </div>
                    <h3
                      style={{
                        color: "#000000",
                        fontWeight: "bold",
                        fontSize: "28px",
                      }}
                    >
                      {stat.value}
                    </h3>
                  </div>
                  <p
                    className="mt-6 font-bold text-xl"
                    style={{ color: "#2D2D2D" }}
                  >
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className=" border-none shadow-lg rounded-lg h-16  my-5">
          <div className="relative bg-white border-none rounded-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-800" />
            <Input
              placeholder="Search riders by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-none rounded-lg focus:outline-none h-16 text-lg focus:ring-0 shadow-none "
              style={{
                boxShadow: "none", // removes internal shadow
                outline: "none", // removes browser outline
              }}
            />
          </div>
        </Card>

        <Card className="bg-white border-none shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle>All Riders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{ borderBottomWidth: "1px", borderColor: "#E6E6E6" }}
                  >
                    <th className="text-left p-4">ID</th>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Contact</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Total Trips</th>
                    <th className="text-left p-4">Total Spent</th>
                    <th className="text-left p-4">Member Since</th>
                    <th className="text-left p-4">Last Trip</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRiders.map((rider, index) => {
                    const statusColor = getStatusColor(rider.status);
                    return (
                      <tr
                        key={rider.id}
                        style={{
                          borderBottomWidth: "1px",
                          borderColor: "#E6E6E6",
                        }}
                      >
                        <td className="p-4">
                          R{String(index + 1).padStart(3, "0")}
                        </td>
                        <td className="p-4">
                          <p>{rider.name}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{rider.email}</p>
                          <p className="text-sm" style={{ color: "#2D2D2D" }}>
                            {rider.phone}
                          </p>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={` text-black
    ${rider.status === "active" ? "bg-green-400" : ""}
    ${rider.status === "inactive" ? "bg-gray-300" : ""}
    ${rider.status === "suspended" ? "bg-red-400" : ""}
  `}
                          >
                            {rider.status}
                          </Badge>
                        </td>
                        <td className="p-4">{rider.totalTrips}</td>
                        <td className="p-4" style={{ color: "#2DB85B" }}>
                          ${rider.totalSpent.toFixed(2)}
                        </td>
                        <td
                          className="p-4 text-sm"
                          style={{ color: "#2D2D2D" }}
                        >
                          {rider.memberSince
                            ? rider.memberSince.toDate().toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td
                          className="p-4 text-sm"
                          style={{ color: "#2D2D2D" }}
                        >
                          {rider.lastTrip
                            ? rider.lastTrip.toDate().toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRider(rider);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              style={{
                                backgroundColor: "#2DB85B",
                                color: "white",
                              }}
                              onClick={() => {
                                setSelectedRider(rider);
                                setIsMessageDialogOpen(true);
                              }}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent
            className="max-w-md p-6 rounded-lg shadow-xl text-[#1E1E1E] bg-white
        !bg-[white]
        border border-[#ffffff]"
          >
            <DialogHeader>
              <DialogTitle>Rider Profile</DialogTitle>
              <DialogDescription>
                View complete rider information
              </DialogDescription>
            </DialogHeader>
            {selectedRider && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3>{selectedRider.name}</h3>
                    <p className="text-sm mt-1" style={{ color: "#2D2D2D" }}>
                      {selectedRider.email}
                    </p>
                  </div>
                  <Badge
                    style={{
                      backgroundColor: getStatusColor(selectedRider.status).bg,
                      color: getStatusColor(selectedRider.status).text,
                    }}
                  >
                    {selectedRider.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: "#D0F5DC" }}
                  >
                    <p className="text-sm" style={{ color: "#2D2D2D" }}>
                      Total Trips
                    </p>
                    <h4 style={{ color: "#2DB85B" }}>
                      {selectedRider.totalTrips}
                    </h4>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: "#D0F5DC" }}
                  >
                    <p className="text-sm" style={{ color: "#2D2D2D" }}>
                      Total Spent
                    </p>
                    <h4 style={{ color: "#2DB85B" }}>
                      ${selectedRider.totalSpent.toFixed(2)}
                    </h4>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm" style={{ color: "#2D2D2D" }}>
                      Phone Number
                    </p>
                    <p>{selectedRider.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: "#2D2D2D" }}>
                      Member Since
                    </p>
                    <p>
                      {selectedRider.memberSince
                        ? selectedRider.memberSince
                            .toDate()
                            .toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: "#2D2D2D" }}>
                      Last Trip
                    </p>``
                    <p>
  {selectedRider.lastTrip
    ? selectedRider.lastTrip.toDate().toLocaleDateString()
    : "No trips yet"}
</p>

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
                <span className="font-bold">
                  <span className="font-bold">{selectedRider?.name}</span>
                </span>
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
