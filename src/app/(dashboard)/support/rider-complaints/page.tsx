// import { SupportPage } from "@/components/SupportPage";
// import { requirePermission } from "@/lib/auth";

// export default async function Page() {
//   await requirePermission("support", "read");
//   return <SupportPage defaultTab="complaints" />;
// }
"use client";
import React, { useState, useMemo } from "react";
import {
  MoreHorizontal,
  X,
  ChevronDown,
  AlertTriangle,
  User,
  Car,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  DollarSign,
  Smartphone,
  MapPin,
  ShieldHalf,
  HardHat,
} from "lucide-react";

// --- BRAND CONFIGURATION ---
const BRAND_COLOR = "emerald";

// --- TYPES & INTERFACES ---

type ComplaintStatus = "New" | "Investigating" | "Resolved" | "Closed";
type IssueCategory =
  | "Driver Misconduct"
  | "Safety Incident"
  | "Billing & Payment"
  | "Vehicle Issue"
  | "App Functionality"
  | "Route & Time";

interface RiderComplaint {
  id: string;
  srNo: number;
  bookingId: string;
  riderName: string;
  riderEmail: string;
  driverId: string; // ID of the driver involved
  category: IssueCategory;
  subject: string; // Short reason/title
  description: string; // Full description of the complaint
  adminResponse?: string;
  status: ComplaintStatus;
  createdAt: string;
}

// --- MOCK DATA ---

const initialRiderComplaints: RiderComplaint[] = [
  {
    id: "RC-001",
    srNo: 1,
    bookingId: "BK-001293",
    riderName: "Emily Clark",
    riderEmail: "emily@example.com",
    driverId: "DRV-456",
    category: "Driver Misconduct",
    subject: "Driver was using phone while driving",
    description:
      "The driver spent the entire ride texting and seemed distracted, running a yellow light.",
    status: "New",
    createdAt: "05/01/2026",
  },
  {
    id: "RC-002",
    srNo: 2,
    bookingId: "BK-889012",
    riderName: "Michael Lee",
    riderEmail: "michael@example.com",
    driverId: "DRV-112",
    category: "Billing & Payment",
    subject: "Double Charged for trip BK-889012",
    description:
      "My credit card was charged twice for the trip on 04/01/2026. Please issue a refund immediately.",
    status: "Investigating",
    createdAt: "04/01/2026",
  },
  {
    id: "RC-003",
    srNo: 3,
    bookingId: "BK-556789",
    riderName: "Sophia Rodriguez",
    riderEmail: "sophia@example.com",
    driverId: "DRV-778",
    category: "Safety Incident",
    subject: "Near-miss accident due to speeding",
    description:
      "The driver was going over the speed limit (85 in a 65 zone) and had to brake harshly, almost causing an accident.",
    status: "Resolved",
    adminResponse:
      "Driver has been temporarily suspended pending investigation. Full refund issued for the trip.",
    createdAt: "03/01/2026",
  },
  {
    id: "RC-004",
    srNo: 4,
    bookingId: "BK-334455",
    riderName: "David Chen",
    riderEmail: "david@example.com",
    driverId: "DRV-003",
    category: "Vehicle Issue",
    subject: "Broken AC and strong smoke odor",
    description:
      "The air conditioning was broken and the car smelled strongly of stale cigarette smoke, making the ride unpleasant.",
    status: "Closed",
    adminResponse:
      "We have notified the driver and issued a voucher for your inconvenience.",
    createdAt: "02/01/2026",
  },
  {
    id: "RC-005",
    srNo: 5,
    bookingId: "BK-998877",
    riderName: "Sarah Kim",
    riderEmail: "sarah@example.com",
    driverId: "DRV-202",
    category: "App Functionality",
    subject: "Inability to contact driver after booking",
    description:
      "The in-app chat function failed, and the call button did not work, leading to confusion and a 15-minute delay.",
    status: "New",
    createdAt: "01/01/2026",
  },
];

// --- UTILITY COMPONENTS ---

const StatusBadge: React.FC<{ status: ComplaintStatus }> = ({ status }) => {
  let styles = "";
  switch (status) {
    case "New":
      styles = "bg-blue-100 text-blue-700 border-blue-200";
      break;
    case "Investigating":
      styles = "bg-yellow-100 text-yellow-700 border-yellow-200";
      break;
    case "Resolved":
      styles = "bg-indigo-100 text-indigo-700 border-indigo-200";
      break;
    case "Closed":
    default:
      styles = "bg-emerald-100 text-emerald-700 border-emerald-200";
      break;
  }

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded border ${styles}`}
    >
      {status}
    </span>
  );
};

const CategoryIcon: React.FC<{ category: IssueCategory }> = ({ category }) => {
  switch (category) {
    case "Billing & Payment":
      return <DollarSign className="w-4 h-4 text-green-500" />;
    case "App Functionality":
      return <Smartphone className="w-4 h-4 text-purple-500" />;
    case "Safety Incident":
      return <ShieldHalf className="w-4 h-4 text-red-500" />;
    case "Driver Misconduct":
      return <HardHat className="w-4 h-4 text-orange-500" />;
    case "Route & Time":
      return <MapPin className="w-4 h-4 text-indigo-500" />;
    case "Vehicle Issue":
      return <Car className="w-4 h-4 text-gray-500" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500" />;
  }
};

const RiderComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<RiderComplaint[]>(
    initialRiderComplaints
  );

  // Modal States
  const [selectedComplaint, setSelectedComplaint] =
    useState<RiderComplaint | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);

  // Resolution Form State
  const [resolutionText, setResolutionText] = useState("");
  const [newStatus, setNewStatus] = useState<ComplaintStatus>("Resolved");

  // Filter States
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("Does not matter");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  // --- ACTIONS ---

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this complaint record?"
      )
    ) {
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleOpenDetail = (complaint: RiderComplaint) => {
    setSelectedComplaint(complaint);
    setIsDetailModalOpen(true);
  };

  const handleOpenResolution = (complaint: RiderComplaint) => {
    setSelectedComplaint(complaint);
    setResolutionText(complaint.adminResponse || "");
    setNewStatus(
      complaint.status === "Resolved" || complaint.status === "Closed"
        ? "Closed"
        : "Resolved"
    ); // Default action is to resolve
    setIsResolutionModalOpen(true);
  };

  const handleSubmitResolution = () => {
    if (!selectedComplaint) return;

    if (!resolutionText.trim()) {
      alert("A resolution note is required.");
      return;
    }

    const updatedComplaints = complaints.map((c) => {
      if (c.id === selectedComplaint.id) {
        return {
          ...c,
          status: newStatus,
          adminResponse: resolutionText,
        };
      }
      return c;
    });

    setComplaints(updatedComplaints);
    setIsResolutionModalOpen(false);
    setResolutionText("");
    setSelectedComplaint(null);
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesKeyword =
        c.riderName.toLowerCase().includes(keyword.toLowerCase()) ||
        c.bookingId.toLowerCase().includes(keyword.toLowerCase()) ||
        c.subject.toLowerCase().includes(keyword.toLowerCase());

      const matchesStatus =
        statusFilter === "Does not matter" || c.status === statusFilter;
      const matchesCategory =
        categoryFilter === "All Categories" || c.category === categoryFilter;

      return matchesKeyword && matchesStatus && matchesCategory;
    });
  }, [complaints, keyword, statusFilter, categoryFilter]);

  // Helper: returns short relative time and a color class based on age
  const timeAgoShort = (dateStr: string) => {
    // Expecting format DD/MM/YYYY or ISO; try DD/MM/YYYY first
    let dt: Date;
    const parts = String(dateStr).split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      dt = new Date(year, month, day);
    } else {
      const parsed = Date.parse(dateStr);
      dt = isNaN(parsed) ? new Date(dateStr) : new Date(parsed);
    }

    const now = new Date();
    const diffMs = now.getTime() - dt.getTime();
    if (isNaN(diffMs) || diffMs < 0)
      return { label: "just now", cls: "text-green-600" };

    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 60) {
      return { label: `${minutes}m ago`, cls: "text-green-600" };
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return { label: `${hours}h ago`, cls: "text-blue-600" };
    }
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return { label: `${days}d ago`, cls: "text-yellow-700" };
    }
    const weeks = Math.floor(days / 7);
    return { label: `${weeks}w ago`, cls: "text-gray-500" };
  };

  // --- SUB-COMPONENTS ---

  const ActionMenu: React.FC<{ complaint: RiderComplaint }> = ({
    complaint,
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none shadow-sm"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 z-20 w-52 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleOpenResolution(complaint);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {complaint.status === "New" ||
                complaint.status === "Investigating"
                  ? "Update & Resolve"
                  : "View Resolution"}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleOpenDetail(complaint);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Full Details
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleDelete(complaint.id);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Case Record
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 font-sans text-gray-800">
      {/* HEADER & BREADCRUMB */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="w-full">
          <div className="max-w-full">
            <h1 className="text-2xl font-bold text-white bg-black max-w-full p-1 rounded">
              Rider Complaints
            </h1>
          </div>
          <nav className="flex items-center text-sm text-gray-500 mt-1">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-800">Rider Complaints</span>
          </nav>
        </div>
      </div>

      {/* SEARCH & FILTER SECTION */}
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Keyword Input */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Keyword
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              placeholder="Search rider name, booking ID, or subject..."
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Category
            </label>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-12 px-4 appearance-none bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-700"
              >
                <option>All Categories</option>
                <option>Driver Misconduct</option>
                <option>Safety Incident</option>
                <option>Billing & Payment</option>
                <option>Vehicle Issue</option>
                <option>App Functionality</option>
                <option>Route & Time</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-12 px-4 appearance-none bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-700"
              >
                <option>Does not matter</option>
                <option>New</option>
                <option>Investigating</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button className="px-8 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors">
              Search
            </button>
            <button
              onClick={() => {
                setKeyword("");
                setStatusFilter("Does not matter");
                setCategoryFilter("All Categories");
              }}
              className="px-6 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors shadow-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* COMPLAINTS LIST TABLE */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-white bg-black max-w-full p-1 rounded">
            Complaints from Riders
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Sr. no
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">
                  Booking
                  <br />
                  ID
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Rider
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">
                  Complaint Description
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.srNo}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 align-top">
                      {item.bookingId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 align-top">
                      <div className="font-semibold text-gray-900">
                        {item.riderName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.riderEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 align-top">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={item.category} />
                        <span className="text-sm font-medium">
                          {item.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 align-top">
                      {item.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 align-top">
                      <p className="line-clamp-2 leading-relaxed text-xs">
                        {item.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div>
                        <StatusBadge status={item.status} />
                        {(() => {
                          const t = timeAgoShort(item.createdAt);
                          return (
                            <div
                              className={`text-xs mt-1 ${t.cls} font-medium`}
                            >
                              {t.label}
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="flex justify-end">
                        <ActionMenu complaint={item} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No rider complaints found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        {filteredComplaints.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing 1 to {filteredComplaints.length} of{" "}
              {filteredComplaints.length} results
            </span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button className="px-3 py-1 bg-gray-900 text-white rounded">
                1
              </button>
              <button
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. DETAIL MODAL */}
      {isDetailModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Rider Complaint Details
              </h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    Booking ID
                  </span>
                  <div className="text-lg font-bold text-gray-800">
                    {selectedComplaint.bookingId}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-1">
                    Current Status
                  </span>
                  <StatusBadge status={selectedComplaint.status} />
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                    <User className="w-3 h-3" /> Rider
                  </label>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedComplaint.riderName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedComplaint.riderEmail}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                    <Car className="w-3 h-3" /> Driver ID Involved
                  </label>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedComplaint.driverId}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3" /> Category
                  </label>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    <CategoryIcon category={selectedComplaint.category} />
                    {selectedComplaint.category}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" /> Reported On
                  </label>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedComplaint.createdAt}
                  </p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                  Subject of Complaint
                </label>
                <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm font-semibold border border-red-100">
                  {selectedComplaint.subject}
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                  Full Description
                </label>
                <div className="p-4 bg-gray-50 text-gray-700 rounded-md text-sm border border-gray-200 leading-relaxed">
                  "{selectedComplaint.description}"
                </div>
              </div>

              {/* Admin Response (if exists) */}
              {selectedComplaint.adminResponse && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                    Resolution Note
                  </label>
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-md text-sm border border-emerald-100">
                    "{selectedComplaint.adminResponse}"
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. RESOLUTION MODAL (Action Logic) */}
      {isResolutionModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {selectedComplaint.status !== "Closed" ? (
                  <>
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Update Case Status
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Final Resolution
                  </>
                )}
              </h3>
              <button
                onClick={() => setIsResolutionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Context */}
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-800 mb-1">
                  {selectedComplaint.riderName}'s complaint:{" "}
                  {selectedComplaint.subject}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  Booking ID: {selectedComplaint.bookingId} | Current Status:{" "}
                  <StatusBadge status={selectedComplaint.status} />
                </p>
              </div>

              {/* Status Selector (Only for open cases) */}
              {selectedComplaint.status !== "Closed" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Status To
                  </label>
                  <div className="relative">
                    <select
                      value={newStatus}
                      onChange={(e) =>
                        setNewStatus(e.target.value as ComplaintStatus)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none"
                    >
                      <option value="New">New</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed (Final)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Resolution Note */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedComplaint.status === "Closed"
                      ? "Final Resolution Note"
                      : "Admin Resolution Note"}
                  </label>
                  <textarea
                    value={
                      selectedComplaint.status === "Closed"
                        ? selectedComplaint.adminResponse
                        : resolutionText
                    }
                    onChange={(e) => setResolutionText(e.target.value)}
                    rows={5}
                    readOnly={selectedComplaint.status === "Closed"}
                    className={`w-full p-3 border rounded-lg text-sm ${
                      selectedComplaint.status === "Closed"
                        ? "bg-gray-50 border-gray-200 text-gray-700"
                        : "border-gray-300 focus:ring-2 focus:ring-emerald-500"
                    }`}
                    placeholder="Document the steps taken and the final decision..."
                  />
                </div>

                {selectedComplaint.status !== "Closed" && (
                  <div className="flex items-start gap-2 p-3 bg-indigo-50 text-indigo-800 rounded-lg text-xs">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>
                      Changing the status to 'Resolved' or 'Closed' should be
                      done once all actions are completed.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsResolutionModalOpen(false)}
                className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                {selectedComplaint.status === "Closed"
                  ? "Close View"
                  : "Cancel"}
              </button>
              {selectedComplaint.status !== "Closed" && (
                <button
                  onClick={handleSubmitResolution}
                  className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  Update Status & Save Note
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderComplaintsPage;
