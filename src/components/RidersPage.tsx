"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// import {DeleteRider} from './operation/DeleteRider'
import  EditRider  from "./operation/EditRider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Edit, Loader2, MessageCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
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
import Logo from "./Logo";
import DeleteRider from './operation/DeleteRider';

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

export function RidersPage({ onClose, onCreated }: any) {
  // const [riders, setRiders] = useState<Rider[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [riders, setRiders] = useState<any[]>([]);
  // const [riders, setRiders] = useState<UserData[]>([]);
  const [rides, setRides] = useState<RideData[]>([]);
   const [form, setForm] = useState({
     name: "",
     phone: "",
     email: "",
   });
  // const fetchRiders = async (role: string) => {
  //   try {
  //     const res = await fetch("/api/riders", {
  //       headers: {
  //         "x-user-role": role,
  //       },
  //     });

  //     // Log the response status to console for debugging
  //     console.log("Riders API Response Status:", res.status);

  //     const json = await res.json();

  //     // Log the received JSON data
  //     console.log("Riders API Response Data:", json);

  //     if (json.success && Array.isArray(json.riders)) {
  //       const formatted: Rider[] = json.riders.map((r: any) => ({
  //         ...r,
  //         // memberSince: convertToJsDate(r.memberSince),
  //         // lastTrip: convertToJsDate(r.lastTrip),
  //         phone: r.mobile ?? r.phone ?? "",
  //         status: r.status ?? "inactive",
  //         totalTrips: typeof r.totalTrips === "number" ? r.totalTrips : 0,
  //         totalSpent: typeof r.totalSpent === "number" ? r.totalSpent : 0,
  //       }));

  //       setRiders(formatted);
  //     } else {
  //       // Log error if success is false or riders is not an array
  //       console.error(
  //         "Riders API returned success: false or invalid data structure:",
  //         json
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch riders from API:", error);
  //   }
  // };
  const fetchRiders = async () => {
    setLoading(true);
    const res = await fetch("/api/riders");
    const data = await res.json();
    setRiders(data.riders || []);
    setLoading(false);
  };

  //  useEffect(() => {
  
//    const unsubscribe = onAuthStateChanged(auth, async (user) => {
//      if (!user) {
//        router.push("/login");
//        return;
//      }

//      // Try admins, users, and super_admins collections
//      const collections = ["admins", "users", "super_admins"];
//      let found = false;
//      let data = null;
//      let role = ""; // Store the determined role

//      for (const col of collections) {
//        const ref = doc(db, col, user.uid);
//        const snap = await getDoc(ref);
//        if (snap.exists()) {
//          data = snap.data();
//          role = data.role ?? ""; // Capture the role
//          found = true;
//          break;
//        }
//      }

//      if (found && data) {
//        const adminProfile = {
//          id: user.uid,
//          firstName: data.firstName ?? "",
//          lastName: data.lastName ?? "",
//          email: data.email ?? "",
//          role: role,
//          mobile: data.mobile ?? "",
//          canOverride: data.canOverride ?? false,
//        };

//        setAdminData(adminProfile);

//        // 🎯 FIX: Call fetchRiders immediately upon successful authentication
//        // and retrieval of the user role.
//        if (role) {
//          fetchRiders(role);
//        }
//      } else {
//        router.push("/login");
//      }

//      setLoading(false);
//    });

//    return () => unsubscribe();
//  }, [router]);
  
   useEffect(() => {
     fetchRiders();
   }, []);
  

  const filteredRiders = riders.filter(
    (rider) =>
      rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Rider["status"]) => {
    const colors = {
      active: { bg: "#D0F5DC", text: "#1B6635" },
      inactive: { bg: "#FEE2E2", text: "#991B1B" },
      suspended: { bg: " #E6E6E6", text: " #2D2D2D" },
    };
    return colors[status];
  };

  const totalRevenue = riders.reduce((sum, rider) => sum + rider.totalSpent, 0);
  const totalTrips = riders.reduce((sum, rider) => sum + rider.totalTrips, 0);

  const stats = [
    {
      label: "Total Riders",
      value: riders.length,
      icon: UserPlus,
      color: "text-black",
    },
    {
      label: "Active Riders",
      value: riders.filter((r) => r.status === "active").length,
      icon: TrendingUp,
      color: "text-black",
    },
    {
      label: "Total Trips",
      value: totalTrips,
      icon: Calendar,
      color: "text-black",
    },
    {
      label: "Total Revenue",
      value: `${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-500",
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
  const createRider = async () => {
    setLoading(true);
    const res = await fetch("/api/riders", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      onCreated();
      onClose();
    } else {
      alert(data.error || data.message);
    }
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
    <div className="bg-white min-h-screen border-none shadow-md rounded-lg p-4">
      <div className="flex lg:hidden justify-center">
        <Logo />
      </div>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full">
            <h1 className="font-bold text-1xl sm:text-3xl bg-[var(--charcoal-dark)] text-white p-1 rounded-md w-full">
              Riders Dashboard
            </h1>
            <p style={{ color: "#2D2D2D" }} className="text-sm sm:text-lg pl-3">
              Manage and monitor all riders
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#2DB85B", color: "white" }}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Rider
              </Button>
            </DialogTrigger>

            <DialogContent
              className="
        max-w-xs sm:max-w-md p-6 rounded-lg shadow-xl {/* Adjusted max-width for mobile */}
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
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
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
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
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
                    onClick={createRider}
                  >
                    {/* Add Rider */}
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 w-full h-auto gap-4 md:gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="bg-white border-none shadow-lg w-full"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <h3
                      style={{ color: "#2D2D2D" }}
                      className="text-xl md:text-xl"
                    >
                      {stat.value}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm" style={{ color: "#2D2D2D" }}>
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Card className=" border-none shadow-lg rounded-lg h-16 my-5">
          <div className="relative bg-white border-none rounded-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-800" />
            <Input
              placeholder="Search riders by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-none rounded-lg focus:outline-none h-16 text-base sm:text-lg focus:ring-0 shadow-none "
              style={{
                boxShadow: "none", // removes internal shadow
                outline: "none", // removes browser outline
              }}
            />
          </div>
        </Card>
        <Card className="bg-white border-none shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="bg-[var(--charcoal-dark)] text-white p-1 rounded-md w-full">
              All Riders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr
                    style={{ borderBottomWidth: "1px", borderColor: "#E6E6E6" }}
                  >
                    <th className="text-left p-4 whitespace-nowrap text-sm">
                      ID
                    </th>
                    <th className="text-left p-4 whitespace-nowrap text-sm">
                      Name
                    </th>
                    <th className="text-left p-4 whitespace-nowrap text-sm">
                      Contact
                    </th>
                    <th className="text-left p-4 whitespace-nowrap text-sm">
                      Status
                    </th>
                    <th className="text-left p-4 whitespace-nowrap text-sm">
                      Total Trips
                    </th>
                    <th className="text-left p-4 whitespace-nowrap text-sm">
                      Total Spent
                    </th>
                    <th className="text-left p-4 whitespace-nowrap text-sm">
                      Member Since
                    </th>
                    <th className="text-left p-4 whitespace-nowrap text-sm">
                      Last Trip
                    </th>
                    <th className="text-right p-4 whitespace-nowrap text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {riders.map((rider: any, index) => (
                    <tr
                      key={rider.id}
                      style={{
                        borderBottomWidth: "1px",
                        borderColor: "#E6E6E6",
                      }}
                    >
                      <td className="p-4 text-sm whitespace-nowrap">
                        {String(index + 1).padStart(3, "0")}
                      </td>

                      <td className="p-4 text-sm whitespace-nowrap">
                        <p>{rider.name}</p>
                      </td>

                      <td className="p-4 text-sm whitespace-nowrap">
                        <p className="text-xs">{rider.email}</p>{" "}
                        {/* Even smaller text for email/phone */}
                        <p className="text-xs" style={{ color: "#2D2D2D" }}>
                          {rider.phone}
                        </p>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <Badge
                          className={` text-black text-xs
              ${rider.status === "active" ? "bg-green-400" : ""}
              ${rider.status === "inactive" ? "bg-red-400" : ""}
              ${rider.status === "suspended" ? "bg-gray-300" : ""}
            `}
                        >
                          {rider.status}
                        </Badge>
                      </td>

                      <td className="p-4 text-sm whitespace-nowrap font-bold">
                        {rider.totalTrips}
                      </td>

                      <td className="p-4 text-sm whitespace-nowrap font-bold">
                        {/* ${rider.totalSpent.toFixed(2)} */}
                      </td>

                      <td
                        className="p-4 text-xs whitespace-nowrap"
                        style={{ color: "#2D2D2D" }}
                      >
                        {/* {rider.memberSince
                          ? rider.memberSince.toDate().toLocaleDateString()
                          : "N/A"} */}
                      </td>

                      <td
                        className="p-4 text-xs whitespace-nowrap"
                        style={{ color: "#2D2D2D" }}
                      >
                        {/* {rider.lastTrip
                          ? rider.lastTrip.toDate().toLocaleDateString()
                          : "N/A"} */}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {" "}
                          {/* Reduced gap */}
                          <Button
                            size="icon" /* Changed to size="icon" for smaller buttons on mobile */
                            // variant="outline"
                            onClick={() => {
                              setSelectedRider(rider);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                            
                            
                            <EditRider rider={rider} onUpdated={fetchRiders} />
                          
                          {/* <Button
                            size="icon"
                            style={{
                              backgroundColor: "#2DB85B",
                              color: "white",
                            }}
                            onClick={() => {
                              setSelectedRider(rider);
                              setIsMessageDialogOpen(true);
                            }}
                          >
                            
                            <MessageCircle className="w-4 h-4" />
                          </Button> */}
                          <Button
                            size="icon" 
                            
                            onClick={() => {
                              setSelectedRider(rider);
                              setIsMessageDialogOpen(true);
                            }}
                          >
                            <DeleteRider
                              rider={rider}
                              onDeleted={fetchRiders}
                            />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent
            className="max-w-xs sm:max-w-md p-6 rounded-lg shadow-xl text-[#1E1E1E] bg-white
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
                      // backgroundColor: getStatusColor(selectedRider.status).bg,
                      // color: getStatusColor(selectedRider.status).text,
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
                      {/* ${selectedRider.totalSpent.toFixed(2)} */}
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
                    </p>
                    ``
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
            className="max-w-xs sm:max-w-md text-[#1E1E1E] bg-white {/* Adjusted max-width for mobile */}
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
