"use client";

// import { useState } from 'react';
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
import { Search, UserPlus, Shield, Edit, Trash2 } from "lucide-react";
import { Users } from "@/types";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../src/firebase/config";
import { User } from "../models/admin";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  getDocs,
} from "firebase/firestore";

interface UserData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
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
  name?: string;
  email?: string;
  role?: string;
}

const mockAdmins: Users[] = [
  {
    id: "1",
    name: "John Admin",
    email: "john.admin@ecogo.ca",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15",
    lastLogin: "2025-11-14T09:30:00",
  },
  {
    id: "4",
    name: "Emily Chen",
    email: "emily.chen@ecogo.ca",
    role: "admin",
    status: "active",
    createdAt: "2024-01-20",
    lastLogin: "2025-11-14T07:20:00",
  },
  {
    id: "6",
    name: "Michael Brown",
    email: "michael.b@ecogo.ca",
    role: "admin",
    status: "active",
    createdAt: "2024-02-10",
    lastLogin: "2025-11-13T18:45:00",
  },
  {
    id: "7",
    name: "Sarah Johnson",
    email: "sarah.j@ecogo.ca",
    role: "admin",
    status: "inactive",
    createdAt: "2024-03-05",
    lastLogin: "2025-10-15T14:20:00",
  },
];

export function AdminsPage() {
  const [admins, setAdmins] = useState<Users[]>(mockAdmins);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const router = useRouter();

  const [drivers, setDrivers] = useState<UserData[]>([]);
  const [riders, setRiders] = useState<UserData[]>([]);
  const [rides, setRides] = useState<RideData[]>([]);
  const [loading, setLoading] = useState(true);

  const [admin, setAdmin] = useState<User | null>(null); // <--- fixed

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      const adminRef = doc(db, "admins", user.uid);
      const adminSnap = await getDoc(adminRef);

      if (adminSnap.exists()) {
        setAdmin({ id: user.uid, ...adminSnap.data() } as User); // <--- fixed
        loadAllData();
      } else {
        router.push("/");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadAllData = () => {
    // 🔵 Real-time: Drivers
    const unsubscribeAdmins = onSnapshot(
      collection(db, "admins"),
      (snapshot) => {
        setAdmins(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      }
    );
    const unsubscribeDrivers = onSnapshot(
      collection(db, "drivers"),
      (snapshot) => {
        setDrivers(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
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
          }))
        );
      }
    );

    // 🟠 Real-time: Rides
    const unsubscribeRides = onSnapshot(collection(db, "rides"), (snapshot) => {
      setRides(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
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

  if (loading)
    return (
      <div className="text-center text-2xl font-semibold mt-20">Loading...</div>
    );

  const filteredAdmins = admins.filter((admin) => {
    const name = (admin?.name ?? "").toLowerCase();
    const email = (admin?.email ?? "").toLowerCase();
    const term = (searchTerm ?? "").toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  const handleAddAdmin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAdmin: User = {
      id: `${admins.length + 1}`,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: "admin",
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAdmins([...admins, newAdmin]);
    setIsAddDialogOpen(false);
    toast.success("Admin added successfully!");
  };

  const handleDeleteAdmin = (id: string) => {
    setAdmins(admins.filter((admin) => admin.id !== id));
    toast.success("Admin deleted successfully!");
  };

  const stats = [
    { label: "Total Admins", value: admins.length },
    {
      label: "Active",
      value: admins.filter((a) => a.status === "active").length,
    },
    {
      label: "Inactive",
      value: admins.filter((a) => a.status === "inactive").length,
    },
  ];

  return (
    <div className="bg-white h-screen border-none shadow-md rounded-lg p-6">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: "#2F3A3F" }} className="font-bold text-4xl">
              Admin Dashboard
            </h1>
            <p style={{ color: "#2D2D2D" }} className="text-lg">
              Manage system administrators and permissions
            </p>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-white border-none shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "#D0F5DC" }}
                  >
                    <Shield className="w-5 h-5" style={{ color: "#2DB85B" }} />
                  </div>
                  <h3 style={{ color: "#2DB85B" }}>{stat.value}</h3>
                </div>
                <p style={{ color: "#2D2D2D" }}>{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* <Card> */}
        <CardContent className="bg-white border-none shadow-md rounded-lg h-10">
          <div className="relative bg-white border-none rounded-lg">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-800"
              style={{ color: "#2D2D2D" }}
            />
            <Input
              placeholder="Search admins by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-none rounded-lg focus:outline-none focus:ring-0 shadow-none"
              style={{
                boxShadow: "none", // removes internal shadow
                outline: "none", // removes browser outline
              }}
            />
          </div>
        </CardContent>

        <Card className="bg-white border-none shadow-md rounded-lg">
          <CardHeader>
            <CardTitle>All Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{ borderBottomWidth: "1px", borderColor: "#E6E6E6" }}
                  >
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Created</th>
                    <th className="text-left p-4">Last Login</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => (
                    <tr
                      key={admin.id}
                      style={{
                        borderBottomWidth: "1px",
                        borderColor: "#E6E6E6",
                      }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Shield
                            className="w-4 h-4"
                            style={{ color: "#2DB85B" }}
                          />
                          <span>{admin.name ?? admin.email ?? "Unknown"}</span>
                        </div>
                      </td>
                      <td className="p-4">{admin.email ?? ""}</td>
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
                      <td className="p-4 text-sm" style={{ color: "#2D2D2D" }}>
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm" style={{ color: "#2D2D2D" }}>
                        {admin.lastLogin
                          ? new Date(admin.lastLogin).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Interfaces ---
// interface UserData {
//   id: string;
//   name?: string;
//   email?: string;
//   phone?: string;
//   [key: string]: any;
// }

// interface RideData {
//   id: string;
//   pickup: string;
//   destination: string;
//   name: string;
//   fare: number;
//   status: string;
//   riderId: string;
//   driverId: string;
// }

// interface AdminData {
//   name?: string;
//   email?: string;
//   role?: string;
// }

// export default function AdminDashboard() {
//   const router = useRouter();

//   const [adminData, setAdminData] = useState<AdminData | null>(null);

//   const [drivers, setDrivers] = useState<UserData[]>([]);
//   const [riders, setRiders] = useState<UserData[]>([]);
//   const [rides, setRides] = useState<RideData[]>([]);

//   const [loading, setLoading] = useState(true);

//   // --- Authentication ---
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) {
//         router.push("/");
//         return;
//       }

//       const adminRef = doc(db, "admins", user.uid);
//       const adminSnap = await getDoc(adminRef);

//       if (adminSnap.exists()) {
//         setAdminData(adminSnap.data());
//         loadAllData(); // <--- now real-time
//       } else {
//         router.push("/");
//       }

//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   // --- Load Data (drivers, riders, rides) ---

//   const loadAllData = () => {
//     // 🔵 Real-time: Drivers
//     const unsubscribeDrivers = onSnapshot(
//       collection(db, "drivers"),
//       (snapshot) => {
//         setDrivers(
//           snapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           }))
//         );
//       }
//     );

//     // 🟢 Real-time: Riders
//     const unsubscribeRiders = onSnapshot(
//       collection(db, "riders"),
//       (snapshot) => {
//         setRiders(
//           snapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           }))
//         );
//       }
//     );

//     // 🟠 Real-time: Rides
//     const unsubscribeRides = onSnapshot(collection(db, "rides"), (snapshot) => {
//       setRides(
//         snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }))
//       );
//     });

//     // Return all unsubs so you can close listeners when admin logs out or leaves page
//     return () => {
//       unsubscribeDrivers();
//       unsubscribeRiders();
//       unsubscribeRides();
//     };
//   };

//   if (loading)
//     return (
//       <div className="text-center text-2xl font-semibold mt-20">Loading...</div>
//     );

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* <AdminSidebar
//         name={adminData?.name}
//         email={adminData?.email}
//         role={adminData?.role}
//       /> */}

//       {/* MAIN CONTENT */}
//       <main className="flex-1 p-8 overflow-y-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-10 border-b pb-4">
//           <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//           <div className="bg-white p-6 rounded-xl shadow border-t-4 border-emerald-500">
//             <p className="text-gray-500 text-sm">Total Drivers</p>
//             <p className="text-4xl font-bold">{drivers.length}</p>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow border-t-4 border-blue-500">
//             <p className="text-gray-500 text-sm">Total Riders</p>
//             <p className="text-4xl font-bold">{riders.length}</p>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow border-t-4 border-purple-500">
//             <p className="text-gray-500 text-sm">Total Rides</p>
//             <p className="text-4xl font-bold">{rides.length}</p>
//           </div>
//         </div>

//         {/* Lists */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Drivers */}
//           <div className="bg-white rounded-xl shadow overflow-hidden">
//             <div className="p-4 bg-gray-50 border-b">
//               <h3 className="text-xl font-bold">Drivers ({drivers.length})</h3>
//             </div>

//             <ul className="max-h-96 overflow-y-auto divide-y">
//               {drivers.map((driver) => (
//                 <li key={driver.id} className="p-4 hover:bg-gray-50">
//                   <p className="font-semibold">{driver.name}</p>
//                   <p className="text-sm text-gray-500">{driver.email}</p>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Riders */}
//           <div className="bg-white rounded-xl shadow overflow-hidden">
//             <div className="p-4 bg-gray-50 border-b">
//               <h3 className="text-xl font-bold">Riders ({riders.length})</h3>
//             </div>

//             <ul className="max-h-96 overflow-y-auto divide-y">
//               {riders.map((rider) => (
//                 <li key={rider.id} className="p-4 hover:bg-gray-50">
//                   <p className="font-semibold">{rider.name}</p>
//                   <p className="text-sm text-gray-500">{rider.email}</p>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Rides */}
//           <div className="bg-white rounded-xl shadow overflow-hidden">
//             <div className="p-4 bg-gray-50 border-b">
//               <h3 className="text-xl font-bold">Rides ({rides.length})</h3>
//             </div>

//             <ul className="max-h-96 overflow-y-auto divide-y">
//               {rides.map((ride) => (
//                 <li key={ride.id} className="p-4 hover:bg-gray-50">
//                   <p className="font-semibold">
//                     {ride.pickup?.name ?? "Unknown Pickup"} →
//                     {ride.destination?.name ?? "Unknown Destination"}
//                   </p>
//                   <p className="text-sm text-gray-500">Status: {ride.status}</p>
//                   <p className="text-sm text-gray-400">
//                     Fare: {ride.fare ?? 0} ETB
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
