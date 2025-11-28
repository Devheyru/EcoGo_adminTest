"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  Search,
  UserPlus,
  Edit,
  Trash2,
  CircleOff,
  CheckCircle,
  UserCheck,
} from "lucide-react";
// import { Users } from "@/types"; // Not used directly
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../src/firebase/config";
import { User } from "../models/admin";
import { onAuthStateChanged } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
} from "firebase/firestore";
import Logo from "./Logo";

// --- Interfaces ---

interface UserData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

interface RideData {
  id: string;
  pickup?: string;
  destination?: string;
  name?: string;
  fare?: number;
  status?: string;
  riderId?: string;
  driverId?: string;
  [key: string]: any;
}

interface AdminData {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  createdAt?: Timestamp;
  lastLogin?: Timestamp;
  [key: string]: any;
  phone?: string;
}

export function AdminsPage() {
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const router = useRouter();

  // The following state variables are loaded but not used in the UI,
  // but I'm keeping them for completeness.
  const [drivers, setDrivers] = useState<UserData[]>([]);
  const [riders, setRiders] = useState<UserData[]>([]);
  const [rides, setRides] = useState<RideData[]>([]);

  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<User | null>(null);

  // --- Authentication and Data Load Effect ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      // Check 'admins' collection first (legacy)
      const adminRef = doc(db, "admins", user.uid);
      const adminSnap = await getDoc(adminRef);

      if (adminSnap.exists()) {
        setAdmin({ id: user.uid, ...adminSnap.data() } as User);
        loadAllData();
        setLoading(false);
        return;
      }

      // Fallback: Check 'users' collection
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        // Allow if role is admin or super_admin
        if (
          userData.role === "admin" ||
          userData.role === "super_admin" ||
          userData.roleId === "admin" ||
          userData.roleId === "super_admin"
        ) {
          setAdmin({ id: user.uid, ...userData } as User);
          loadAllData();
          setLoading(false);
          return;
        }
      }

      // If neither, redirect
      router.push("/");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Real-time Data Listeners ---
  const loadAllData = () => {
    // 🔵 Real-time: Admins
    const q = query(
      collection(db, "users"),
      where("roleId", "in", ["admin", "super_admin"])
    );

    const unsubscribeAdmins = onSnapshot(q, (snapshot) => {
      setAdmins(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            role: data.role || data.roleId,
          };
        }) as AdminData[]
      );
    });

    // 🔵 Real-time: Drivers
    const unsubscribeDrivers = onSnapshot(
      collection(db, "drivers"),
      (snapshot) => {
        setDrivers(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as UserData[]
        );
      }
    );

    // 🟢 Real-time: Riders
    const unsubscribeRiders = onSnapshot(
      collection(db, "riders"),
      (snapshot) => {
        setRiders(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as UserData[]
        );
      }
    );

    // 🟠 Real-time: Rides
    const unsubscribeRides = onSnapshot(collection(db, "rides"), (snapshot) => {
      setRides(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as RideData[]
      );
    });

    // Return all unsubs so you can close listeners when admin logs out or leaves page
    return () => {
      unsubscribeDrivers();
      unsubscribeRiders();
      unsubscribeRides();
      unsubscribeAdmins();
    };
  };

  // --- Loading State ---
  if (loading)
    return (
      <div className="text-center text-2xl font-semibold mt-20">Loading...</div>
    );

  // --- Data Filtering and Handlers ---
  const filteredAdmins = admins.filter((admin) => {
    const name = (admin?.name ?? "").toLowerCase();
    const email = (admin?.email ?? "").toLowerCase();
    const term = (searchTerm ?? "").toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  const handleAddAdmin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAdmin: AdminData = {
      id: `${admins.length + 1}`,
      name: formData.get("name") as string, // Changed from firstName/lastName to use single name field
      email: formData.get("email") as string,
      // mobile: formData.get("mobile") as string, // Mobile field removed from form/logic for simplification
      role: "admin",
      status: "inactive", // Default status for newly added mock admin
      createdAt: Timestamp.now(),
    };

    setAdmins([...admins, newAdmin]);
    setIsAddDialogOpen(false);
    toast.success("Admin added successfully! (Mock add)");
  };

  const handleDeleteAdmin = (id: string) => {
    setAdmins(admins.filter((admin) => admin.id !== id));
    toast.success("Admin deleted successfully! (Mock delete)");
  };

  // --- Statistics Data ---
  const stats = [
    {
      label: "Total Admins",
      value: admins.length,
      icon: UserCheck,
      color: "text-black",
    },
    {
      label: "Active",
      value: admins.filter((a) => a.status === "active").length,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Inactive",
      value: admins.filter((a) => a.status === "inactive").length,
      icon: CircleOff,
      color: "text-black",
    },
  ];

  const adminOnlyList = filteredAdmins.filter((a) => a.role === "admin");

  // --- Component Render ---
  return (
    <div className="bg-white min-h-screen border-none shadow-md rounded-lg p-6">
      <div className="flex lg:hidden justify-center">
        <Logo />
      </div>
      <div className="p-6 space-y-4">
        {/* Header and Add Admin Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full">
            <h1 className="font-bold text-1xl sm:text-3xl bg-[var(--charcoal-dark)] text-white p-1 rounded-md w-full">
              Admin Dashboard
            </h1>
            <p style={{ color: "#2D2D2D" }} className="text-lg">
              Manage system administrators and permissions
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#2DB85B", color: "white" }}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Admin
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
                <DialogTitle>Add New Administrator</DialogTitle>
                <DialogDescription>
                  Create a new admin account with full system access
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Corporate Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@ecogo.ca"
                    required
                  />
                </div>
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: "#FEF3C7" }}
                >
                  <p className="text-sm" style={{ color: "#92400E" }}>
                    <strong>Important:</strong> This user will have full
                    administrative access including user management, system
                    settings, and audit logs.
                  </p>
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
                    Create Admin
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards - Responsive Grid: 1 column on small, 3 columns on medium+ */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-white border-none shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                      {/* <Icon className="w-5 h-5" style={{ color: "#2DB85B" }} /> */}
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <h3 style={{ color: "#2D2D2D" }}>{stat.value}</h3>
                  </div>
                  <p style={{ color: "#2D2D2D" }}>{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search Bar */}
        <CardContent className="bg-white border-none shadow-md rounded-lg h-10 p-0">
          <div className="relative bg-white border-none rounded-lg h-full">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-800"
              style={{ color: "#2D2D2D" }}
            />
            <Input
              placeholder="Search admins by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-none rounded-lg focus:outline-none focus:ring-0 shadow-none h-full"
              style={{
                boxShadow: "none", // removes internal shadow
                outline: "none", // removes browser outline
              }}
            />
          </div>
        </CardContent>

        {/* Administrators Table */}
        <Card className="bg-white border-none shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="bg-[var(--charcoal-dark)] text-white p-1 rounded-md w-full">
              All Administrators
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* The overflow-x-auto ensures horizontal scrolling on small screens if the table is too wide */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{ borderBottomWidth: "1px", borderColor: "#E6E6E6" }}
                  >
                    <th className="text-left p-4 min-w-[150px]">Name</th>
                    <th className="text-left p-4 min-w-[200px]">Email</th>
                    <th className="text-left p-4 min-w-[100px]">Status</th>
                    <th className="text-left p-4 min-w-[100px]">Created</th>
                    <th className="text-left p-4 min-w-[150px]">Last Login</th>
                    <th className="text-right p-4 min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminOnlyList.map((admin) => (
                    <tr
                      key={admin.id}
                      style={{
                        borderBottomWidth: "1px",
                        borderColor: "#E6E6E6",
                      }}
                    >
                      <td className="p-4">
                        {admin.role === "admin" && (
                          <div className="flex items-center gap-2">
                            <UserCheck
                              className="w-4 h-4 flex-shrink-0"
                              style={{ color: "#2DB85B" }}
                            />
                            <span className="truncate">
                              {admin.name ?? admin.email ?? "Unknown"}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 truncate max-w-[200px]">
                        {admin.email ?? ""}
                      </td>
                      <td className="p-4">
                        <Badge
                          style={
                            admin.status === "active"
                              ? { backgroundColor: "#D0F5DC", color: "#1B6635" }
                              : { backgroundColor: "#E6E6E6", color: "#2D2D2D" }
                          }
                        >
                          {admin.status}
                        </Badge>
                      </td>
                      <td
                        className="p-4 text-sm whitespace-nowrap"
                        style={{ color: "#2D2D2D" }}
                      >
                        {admin.createdAt?.toDate().toLocaleDateString()}
                      </td>
                      <td
                        className="p-4 text-sm whitespace-nowrap"
                        style={{ color: "#2D2D2D" }}
                      >
                        {admin.lastLogin
                          ? admin.lastLogin.toDate().toLocaleString()
                          : "Never"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" title="Edit Admin">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Delete Admin"
                            onClick={() => handleDeleteAdmin(admin.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {adminOnlyList.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No administrators found matching your search.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
