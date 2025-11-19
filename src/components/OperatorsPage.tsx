"use client";

import { useState } from "react";
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
  Users,
  Edit,
  Trash2,
  Calendar,
  Activity,
} from "lucide-react";
import { User } from "@/types";
import { toast } from "sonner";

const mockOperators: User[] = [
  {
    id: "1",
    uid: "1",
    name: "Alex Thompson",
    email: "alex.thompson@ecogo.ca",
    role: "operator",
    status: "active",
    createdAt: "2024-03-10",
    lastLogin: "2025-11-15T08:15:00",
  },
  {
    id: "2",
    uid: "2",
    name: "Jessica Martinez",
    email: "jessica.m@ecogo.ca",
    role: "operator",
    status: "active",
    createdAt: "2024-03-15",
    lastLogin: "2025-11-15T07:30:00",
  },
  {
    id: "3",
    uid: "3",
    name: "David Lee",
    email: "david.lee@ecogo.ca",
    role: "operator",
    status: "active",
    createdAt: "2024-04-01",
    lastLogin: "2025-11-14T18:45:00",
  },
  {
    id: "4",
    uid: "4",
    name: "Rachel Green",
    email: "rachel.g@ecogo.ca",
    role: "operator",
    status: "active",
    createdAt: "2024-04-20",
    lastLogin: "2025-11-15T06:20:00",
  },
  
];

export function OperatorsPage() {
  const [operators, setOperators] = useState<User[]>(mockOperators);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredOperators = operators.filter(
    (operator) =>
      operator.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOperator = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newOperator: User = {
      id: `${operators.length + 1}`,
      uid: `${operators.length + 1}`,
  

      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: "operator",
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setOperators([...operators, newOperator]);
    setIsAddDialogOpen(false);
    toast.success("Operator added successfully!");
  };

  const handleDeleteOperator = (id: string) => {
    setOperators(operators.filter((operator) => operator.id !== id));
    toast.success("Operator deleted successfully!");
  };

  const stats = [
    { label: "Total Operators", value: operators.length, icon: Users },
    {
      label: "Active",
      value: operators.filter((o) => o.status === "active").length,
      icon: Activity,
    },
    {
      label: "Inactive",
      value: operators.filter((o) => o.status === "inactive").length,

      icon: Users,
    },
  ];

  return (
    <div className="bg-white h-screen border-none shadow-md rounded-lg p-8">
      <div className="p-6 space-y-6 ">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: "#2F3A3F" }}>Operator Dashboard</h1>
            <p style={{ color: "#2D2D2D" }}>
              Manage operators with access to bookings and dispatch
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#2DB85B", color: "white" }}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Operator
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
                <DialogTitle>Add New Operator</DialogTitle>
                <DialogDescription className="text-[#2D2D2D]">
                  Create a new operator account with limited system access
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddOperator} className="space-y-4">
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
                    Email Address
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
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: "#E0F2FE" }}
                >
                  <p className="text-sm" style={{ color: "#075985" }}>
                    <strong>Operator Access:</strong> This user will have access
                    to bookings, dispatch management, and basic reports. They
                    cannot access user management, settings, or audit logs.
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
                    Create Operator
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 w-full h-35 gap-32">
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
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-800"
              style={{ color: "#2D2D2D" }}
            />
            <Input
              placeholder="Search operators by name or email..."
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

        {/* <Card style={{ backgroundColor: "#E0F2FE", borderColor: "#075985" }}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 mt-1" style={{ color: "#075985" }} />
            <div>
              <h4 style={{ color: "#075985" }}>Operator Role</h4>
              <p style={{ color: "#075985" }}>
                Operators have limited access to manage day-to-day operations
                including bookings and dispatch. They can view reports but
                cannot access sensitive settings or user management features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card> */}

        <Card className="bg-white border-none shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle>All Operators</CardTitle>
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
                  {filteredOperators.map((operator) => (
                    <tr
                      key={operator.id}
                      style={{
                        borderBottomWidth: "1px",
                        borderColor: "#E6E6E6",
                      }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users
                            className="w-4 h-4"
                            style={{ color: "#2DB85B" }}
                          />
                          <span>{operator.name}</span>
                        </div>
                      </td>
                      <td className="p-4">{operator.email}</td>
                      <td className="p-4">
                        <Badge
                          style={
                            operator.status === "active"
                              ? { backgroundColor: "#D0F5DC", color: "#1B6635" }
                              : { backgroundColor: "#E6E6E6", color: "#2D2D2D" }
                          }
                        >
                          {operator.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm" style={{ color: "#2D2D2D" }}>
                        {new Date(operator.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm" style={{ color: "#2D2D2D" }}>
                        {operator.lastLogin
                          ? new Date(operator.lastLogin).toLocaleString()
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
                            onClick={() => handleDeleteOperator(operator.id)}
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
