"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import {DeleteRider} from './operation/DeleteRider'
import EditRider from "./operation/EditRider";
import DeleteRider from "./operation/DeleteRider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
  Loader2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  History,
  MapPin,
  Wallet,
} from "lucide-react";

// NEW IMPORTS FOR DROPDOWN ACTIONS
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";
import { auth, db } from "../firebase/config";

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
import Link from "next/link";

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
  const [rides, setRides] = useState<RideData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Updated Form State with new fields
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    status: "inactive",
    country: "",
    walletBalance: "",
  });

  const fetchRiders = async () => {
    setLoading(true);
    const res = await fetch("/api/riders");
    const data = await res.json();
    setRiders(data.riders || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const filteredRiders = riders.filter(
    (rider) =>
      rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination (10 per page)
  const itemsPerPage = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRiders.length / itemsPerPage)
  );
  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [filteredRiders.length]);

  const paginatedRiders = filteredRiders.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
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
    // Note: You might need to update your API to accept country and walletBalance
    const res = await fetch("/api/riders", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      if (onCreated) onCreated();
      if (onClose) onClose();
      setIsAddDialogOpen(false); // Close dialog
      fetchRiders(); // Refresh list
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

  const handleTransactionHistory = (rider: any) => {
    toast.info(`Viewing transaction history for ${rider.name}`);
    // Implement transaction history view logic here
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
        <div className="flex gap-1">
          <Link
            href="/"
            className="hover:underline hover:decoration-green-500 hover:underline-offset-2"
          >
            Home
          </Link>
          /
          <Link
            href="/riders"
            className="hover:underline hover:decoration-green-500 hover:underline-offset-2"
          >
            Rider
          </Link>
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
                boxShadow: "none",
                outline: "none",
              }}
            />
          </div>
        </Card>
        <div className="flex justify-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#2DB85B", color: "white" }}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Rider
              </Button>
            </DialogTrigger>

            <DialogContent
              className="max-w-xs sm:max-w-lg p-6 rounded-lg shadow-xl text-[#1E1E1E] bg-white border border-[#ffffff] overflow-y-auto max-h-[90vh]"
              style={{
                backgroundColor: "#1E1E1E",
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
              }}
            >
              <DialogHeader>
                <DialogTitle>Add New Rider</DialogTitle>
                <DialogDescription className="text-[#2D2D2D]">
                  Register a new rider with full information
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Gem hund"
                      className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+1 416-555-0000"
                      className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="gem@ecogo.ca"
                    className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-white">
                      Country
                    </Label>
                    <Input
                      id="country"
                      placeholder="Ethiopia"
                      className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                      onChange={(e) =>
                        setForm({ ...form, country: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="password"
                      className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wallet" className="text-white">
                      Wallet Balance
                    </Label>
                    <Input
                      id="wallet"
                      type="number"
                      placeholder="0.00"
                      className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                      onChange={(e) =>
                        setForm({ ...form, walletBalance: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value) =>
                        setForm({ ...form, status: value })
                      }
                    >
                      <SelectTrigger className="w-full bg-white border-gray-300">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                    type="button"
                    style={{ backgroundColor: "#2DB85B", color: "white" }}
                    onClick={createRider}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save Rider"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Card className="bg-white border-none shadow-lg rounded-lg w-full">
          <CardHeader>
            <CardTitle className="bg-[var(--charcoal-dark)] text-white p-1 rounded-md w-full">
              All Riders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-hidden">
              <table className="w-full table-auto">
                <thead>
                  <tr
                    style={{ borderBottomWidth: "1px", borderColor: "#E6E6E6" }}
                  >
                    <th className="text-left p-4 text-sm">ID</th>
                    <th className="text-left p-4 text-sm">Name</th>
                    <th className="text-left p-4 text-sm">Contact</th>
                    <th className="text-left p-4 text-sm">Country</th>
                    <th className="text-left p-4 text-sm">Gender</th>
                    <th className="text-left p-4 text-sm">Status</th>
                    <th className="text-left p-4 text-sm">Online?</th>
                    <th className="text-left p-4 text-sm">Wallet Balance</th>
                    <th className="text-left p-4 text-sm">Ecogo Coin</th>
                    <th className="text-left p-4 text-sm">Total Trips</th>
                    <th className="text-left p-4 text-sm">Total Spent</th>
                    <th className="text-right p-4 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRiders.map((rider: any, index) => {
                    const globalIndex = currentPage * itemsPerPage + index;
                    const isOnline = globalIndex % 3 !== 0; // Random mock status
                    const country = "Ethiopia"; // Hardcoded
                    const gender = globalIndex % 2 === 0 ? "Male" : "Female"; // Random mock
                    const walletBalance = (Math.random() * 500).toFixed(2); // Mock
                    const ecogoCoin = Math.floor(Math.random() * 100); // Mock

                    return (
                      <tr
                        key={rider.id}
                        style={{
                          borderBottomWidth: "1px",
                          borderColor: "#E6E6E6",
                        }}
                      >
                        <td className="p-4 text-sm">
                          {String(globalIndex + 1).padStart(3, "0")}
                        </td>

                        <td className="p-4 text-sm">
                          <p>{rider.name}</p>
                        </td>

                        <td className="p-4 text-sm">
                          <p className="text-xs">{rider.email}</p>
                          <p className="text-xs" style={{ color: "#2D2D2D" }}>
                            {rider.phone}
                          </p>
                        </td>

                        {/* Country Column (Hardcoded) */}
                        <td className="p-4 text-sm">{country}</td>

                        {/* Gender Column (Hardcoded) */}
                        <td className="p-4 text-sm">{gender}</td>

                        <td className="p-4">
                          <Badge
                            className={` text-black text-xs
                              ${rider.status === "active" ? "bg-green-300" : ""}
                              ${rider.status === "inactive" ? "bg-red-300" : ""}
                              ${
                                rider.status === "suspended"
                                  ? "bg-gray-300"
                                  : ""
                              }
                            `}
                          >
                            {rider.status}
                          </Badge>
                        </td>
                        {/* Online Status Column */}
                        <td className="p-4 text-sm">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${
                              isOnline ? "bg-green-500" : "bg-gray-400"
                            }`}
                          ></span>
                        </td>

                        {/* Wallet Balance (Hardcoded) */}
                        <td className="p-4 text-sm font-bold">
                          ${walletBalance}
                        </td>

                        {/* Ecogo Coin (Hardcoded) */}
                        <td className="p-4 text-sm font-medium text-yellow-600">
                          {ecogoCoin} Coins
                        </td>

                        <td className="p-4 text-sm font-bold">
                          {rider.totalTrips}
                        </td>

                        <td className="p-4 text-sm font-bold">$200</td>

                        <td className="p-4 text-right">
                          {/* ACTIONS DROPDOWN */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-white border border-gray-200"
                            >
                              {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}

                              {/* Detail Action */}
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRider(rider);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                {/* <Eye className="mr-2 h-4 w-4" /> */}
                                Detail
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {/* Transaction History Action */}
                              <DropdownMenuItem
                                onClick={() => handleTransactionHistory(rider)}
                              >
                                {/* <History className="mr-2 h-4 w-4" /> */}
                                Transaction History
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {/* Update Action - Wrapping existing component */}
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="p-0"
                              >
                                <div className="w-full flex items-center px-2 py-1">
                                  {/* Note: EditRider is likely a Dialog Trigger. We simply render it here. */}
                                  <EditRider
                                    rider={rider}
                                    onUpdated={fetchRiders}
                                  />
                                  Update
                                </div>
                              </DropdownMenuItem>

                              {/* Delete Action - Wrapping existing component */}
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="p-0 text-red-600 focus:text-red-600"
                              >
                                <div className="w-full flex items-center px-2 py-1">
                                  <DeleteRider
                                    rider={rider}
                                    onDeleted={fetchRiders}
                                  />
                                  Delete
                                </div>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Showing{" "}
                  {filteredRiders.length === 0
                    ? 0
                    : currentPage * itemsPerPage + 1}
                  -
                  {Math.min(
                    (currentPage + 1) * itemsPerPage,
                    filteredRiders.length
                  )}{" "}
                  of {filteredRiders.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-xs sm:max-w-md p-6 rounded-lg shadow-xl text-[#1E1E1E] bg-white border border-[#ffffff]">
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
                    <p className="text-sm mt-1 text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Ethiopia
                    </p>
                  </div>
                  <Badge>{selectedRider.status}</Badge>
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
                      Wallet Balance
                    </p>
                    <h4 style={{ color: "#2DB85B" }}>$150.00</h4>
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
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Message Dialog */}
        <Dialog
          open={isMessageDialogOpen}
          onOpenChange={setIsMessageDialogOpen}
        >
          <DialogContent className="max-w-xs sm:max-w-md text-[#1E1E1E] bg-white border border-[#ffffff]">
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
