"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Edit,
  Loader2,
  Eye,
  Phone,
  Mail,
  User,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is installed based on previous context

// Utility for Canada Date Format (YYYY/MM/DD)
const formatCanadaDate = (dateInput: any) => {
  if (!dateInput) return "N/A";

  let date;
  // Handle Firebase timestamp or string
  if (typeof dateInput === "object" && dateInput.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return "N/A";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
};

export default function EditRider({ rider, onUpdated }: any) {
  // Edit State
  const [openEdit, setOpenEdit] = useState(false);
  const [form, setForm] = useState(rider);
  const [loading, setLoading] = useState(false);

  // Detail State
  const [openDetail, setOpenDetail] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // --- Update Handler ---
  const updateRider = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/riders/${rider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Rider updated successfully");
        if (onUpdated) onUpdated();
        setOpenEdit(false);
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch Detail Handler ---
  const handleViewDetail = async () => {
    setOpenDetail(true);
    setLoadingDetail(true);
    try {
      // Fetching fresh data by ID
      const res = await fetch(`/api/riders/${rider.id}`);
      const data = await res.json();

      // Handle response structure (unwrapping if necessary)
      const fetchedRider = data.rider || data;
      setDetailData(fetchedRider);
    } catch (error) {
      toast.error("Could not fetch rider details");
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      {/* --- Detail Button & Dialog --- */}

      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-md bg-white text-[#1E1E1E]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#2DB85B]" />
              Rider Details
            </DialogTitle>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : detailData ? (
            <div className="space-y-6 py-2">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="h-12 w-12 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#075985] font-bold text-lg">
                  {detailData.name?.charAt(0).toUpperCase() || "R"}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{detailData.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {detailData.status || "active"}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="text-sm font-medium">{detailData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="text-sm font-medium">
                      {detailData.phone || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    name="status"
                    // defaultValue={editingOperator.status || "inactive"}
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
              </div>

              {/* System Metadata */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" /> Created
                  </div>
                  <span className="font-medium">
                    {formatCanadaDate(detailData.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" /> Last Updated
                  </div>
                  <span className="font-medium">
                    {formatCanadaDate(detailData.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No data found.</div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDetail(false)}
              className="w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Edit Button & Dialog --- */}
      <Button
        size="sm"
        variant="outline"
        className="h-8 border-gray-200"
        onClick={() => setOpenEdit(true)}
      >
        <Edit className="w-4 h-4" />
      </Button>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-md bg-white text-[#1E1E1E]">
          <DialogHeader>
            <DialogTitle>Edit Rider</DialogTitle>
            <DialogDescription>
              Update the rider's personal information.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="bg-white border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>

              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })} // ✅ FIXED
              >
                <SelectTrigger className="w-full bg-white border-gray-300">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent className="bg-gray">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">suspended</SelectItem>
                  
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
            <Button
              onClick={updateRider}
              disabled={loading}
              style={{ backgroundColor: "#2DB85B", color: "white" }}
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
              ) : (
                "Update Rider"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
