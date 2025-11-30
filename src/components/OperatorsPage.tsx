"use client";
import { useEffect, useState } from "react";
import DeleteOperator from "./operation/DeleteOperator";
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
  DialogFooter,

} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import {
  Search,
  UserPlus,
  Users,
  Edit,
  CircleOff,
  CheckCircle,
  Eye,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Shield,
  Clock,
} from "lucide-react";
import { User } from "@/types";
import { toast } from "sonner";
import Logo from "./Logo";

// Utility to format date as Canada year/month/day (YYYY/MM/DD)
const formatCanadaDate = (dateInput: any) => {
  if (!dateInput) return "2025-11-01";

  // Handle Firebase timestamp objects if they come as {seconds, nanoseconds}
  let date;
  if (typeof dateInput === "object" && dateInput.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return "2025-11-01";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
};

export function OperatorsPage({ refresh, onCreated }: any) {
  // --- States ---
  const [operators, setOperators] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Add Dialog State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Edit Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<any>(null);

  // Detail Dialog State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingOperator, setViewingOperator] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);

  // --- Search Filter ---
  const filteredOperators = operators.filter(
    (operator) =>
      operator.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Fetch Operators ---
  const fetchOps = async () => {
    try {
      const res = await fetch("/api/operators");
      const data = await res.json();
      if (data.success) {
        setOperators(data.operators);
      }
    } catch (error) {
      console.error("Failed to fetch operators", error);
    }
  };

  useEffect(() => {
    fetchOps();
  }, [refresh]);

  // --- Handlers ---

  const handleAddOperator = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const newOpData = {
      fullName: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      status: formData.get("status") as string,
    };

    try {
      const res = await fetch("/api/operators", {
        method: "POST",
        body: JSON.stringify(newOpData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Operator added successfully!");
        setIsAddDialogOpen(false);
        fetchOps(); // Refresh list
        if (onCreated) onCreated();
      } else {
        toast.error(data.error || "Failed to add operator");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Open Edit Modal with Data
  const handleEditClick = (operator: any) => {
    setEditingOperator(operator);
    setIsEditDialogOpen(true);
  };

  // Submit Edit
  const handleUpdateOperator = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingOperator) return;
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const updatedData = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      status: formData.get("status"),
    };

    try {
      const res = await fetch(`/api/operators/${editingOperator.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Updated Successfully");
        setIsEditDialogOpen(false);
        setEditingOperator(null);
        fetchOps(); // Refresh table
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      toast.error("Error updating operator");
    } finally {
      setIsLoading(false);
    }
  };

  // Open Detail Modal (Fetch specific ID)
  const handleDetailClick = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/operators/${id}`);
      const data = await res.json();

      // Depending on API structure, data might be directly the object or wrapped
      // Adjusting based on prompt: "get more by their id... this how data is fetch"
      setViewingOperator(data.operator || data);
      setIsDetailOpen(true);
    } catch (err) {
      toast.error("Could not fetch details");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Stats Calculation ---
  const stats = [
    {
      label: "Total Operators",
      value: operators.length,
      icon: Users,
      color: "text-black",
    },
    {
      label: "Active",
      value: operators.filter((o) => o.status === "active").length,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Inactive",
      value: operators.filter((o) => o.status === "inactive").length,
      icon: CircleOff,
      color: "text-black",
    },
  ];

  return (
    <div className="bg-white min-h-screen border-none shadow-md rounded-lg p-4">
      <div className="flex lg:hidden justify-center">
        <Logo />
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full">
            <h1 className="font-bold text-1xl sm:text-2xl bg-[var(--charcoal-dark)] text-white p-1 rounded-md w-full">
              Operator Dashboard
            </h1>
            <p style={{ color: "#2D2D2D" }} className="pl-3">
              Manage operators with access to bookings and dispatch
            </p>
          </div>
        </div>

        {/* Add Operator Button */}
        <div className="flex justify-end bg-gray">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#2DB85B", color: "white" }}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Operator
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-md p-6 rounded-lg shadow-xl text-[#1E1E1E] bg-white border border-[#ffffff]"
              style={{}}
            >
              <DialogHeader>
                <DialogTitle className="text-[#1E1E1E]">
                  Add New Operator
                </DialogTitle>
                <DialogDescription className="text-[#1E1E1E]">
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
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="**********"
                    required
                    className="bg-[#ffffff] text-[#1E1E1E] border border-[#444]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(123) 456-7890"
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
                    to bookings and dispatch management.
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
                    disabled={isLoading}
                    style={{ backgroundColor: "#2DB85B", color: "white" }}
                  >
                    {isLoading ? "Creating..." : "Create Operator"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 w-full h-auto gap-4 md:gap-8 lg:gap-32">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="bg-white border-none shadow-lg w-full"
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <h3 style={{ color: "#2D2D2D" }}>{stat.value}</h3>
                </div>
                <p className="mt-6" style={{ color: "#2D2D2D" }}>
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search Bar */}
        <Card className="border-none shadow-lg rounded-lg h-16 my-5">
          <div className="relative bg-white border-none rounded-lg">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-800"
              style={{ color: "#2D2D2D" }}
            />
            <Input
              placeholder="Search operators by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-none rounded-lg focus:outline-none h-16 text-lg focus:ring-0 shadow-none"
              style={{ boxShadow: "none", outline: "none" }}
            />
          </div>
        </Card>

        {/* Operators Table */}
        <Card className="bg-white border-none shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="bg-[var(--charcoal-dark)] text-white p-1 rounded-md w-full">
              All Operators
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr
                    style={{ borderBottomWidth: "1px", borderColor: "#E6E6E6" }}
                  >
                    <th className="text-left p-4 whitespace-nowrap">
                      FullName
                    </th>
                    <th className="text-left p-4 whitespace-nowrap">Email</th>
                    <th className="text-left p-4 whitespace-nowrap">Status</th>
                    <th className="text-left p-4 whitespace-nowrap">Created</th>
                    <th className="text-left p-4 whitespace-nowrap">
                      Last Login
                    </th>
                    <th className="text-right p-4 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOperators.map((op: any) => (
                    <tr
                      key={op.id}
                      style={{
                        borderBottomWidth: "1px",
                        borderColor: "#E6E6E6",
                      }}
                    >
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users
                            className="w-4 h-4"
                            style={{ color: "#2DB85B" }}
                          />
                          <span>{op.fullName}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">{op.email}</td>
                      <td className="p-4 whitespace-nowrap">
                        <Badge
                          style={
                            op.status === "active"
                              ? { backgroundColor: "#D0F5DC", color: "#1B6635" }
                              : { backgroundColor: "#E6E6E6", color: "#2D2D2D" }
                          }
                        >
                          {op.status}
                        </Badge>
                      </td>
                      <td
                        className="p-4 text-sm whitespace-nowrap"
                        style={{ color: "#2D2D2D" }}
                      >
                        {formatCanadaDate(op.createdAt)} 
                      </td>
                      <td
                        className="p-4 text-sm whitespace-nowrap"
                        style={{ color: "#2D2D2D" }}
                      >
                        {op.lastLogin
                          ? new Date(op.lastLogin).toLocaleString()
                          : "2hr ago"}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Detail Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-gray-200 cursor-pointer"
                            onClick={() => handleDetailClick(op.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {/* Edit Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-gray-200 cursor-pointer"
                            onClick={() => handleEditClick(op)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          {/* Delete Button */}
                          <DeleteOperator operatorId={op.id} />
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

      {/* --- EDIT DIALOG --- */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md p-6 bg-white text-[#1E1E1E]">
          <DialogHeader>
            <DialogTitle>Edit Operator</DialogTitle>
            <DialogDescription>
              Update the operator's personal information.
            </DialogDescription>
          </DialogHeader>

          {editingOperator && (
            <form onSubmit={handleUpdateOperator} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input
                  id="edit-fullName"
                  name="fullName"
                  defaultValue={editingOperator.fullName}
                  required
                  className="bg-white border-gray-300"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={editingOperator.email}
                  required
                  className="bg-white border-gray-300"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  defaultValue={editingOperator.phone}
                  className="bg-white border-gray-300"
                />
              </div>

              {/* Status Dropdown */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  name="status"
                  defaultValue={editingOperator.status || "inactive"}
                >
                  <SelectTrigger className="w-full bg-white border-gray-300">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  style={{ backgroundColor: "#2DB85B", color: "white" }}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* --- DETAIL DIALOG --- */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md bg-white text-[#1E1E1E]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#2DB85B]" />
              Operator Details
            </DialogTitle>
          </DialogHeader>

          {viewingOperator ? (
            <div className="space-y-6 py-2">
              {/* Header Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="h-14 w-14 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#075985] font-bold text-xl">
                  {viewingOperator.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {viewingOperator.fullName}
                  </h3>
                  <Badge
                    variant={
                      viewingOperator.status === "active"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      viewingOperator.status === "active"
                        ? "bg-[#D0F5DC] text-[#1B6635]"
                        : ""
                    }
                  >
                    {viewingOperator.status}
                  </Badge>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{viewingOperator.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">
                    {viewingOperator.phone || "No phone provided"}
                  </span>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  System Information
                </h4>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarIcon className="w-4 h-4" /> Created
                  </div>
                  <span className="font-medium">
                    {formatCanadaDate(viewingOperator.createdAt)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" /> Last Updated
                  </div>
                  <span className="font-medium">
                    {formatCanadaDate(viewingOperator.updatedAt)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-4 h-4" /> Role ID
                  </div>
                  <span className="font-medium">
                    {viewingOperator.role || viewingOperator.roleId}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              Loading details...
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailOpen(false)}
              className="w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
