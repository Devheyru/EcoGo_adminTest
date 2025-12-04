// import { SupportPage } from "@/components/SupportPage";
// import { requirePermission } from "@/lib/auth";

// export default async function Page() {
//   await requirePermission("support", "read");
//   return <SupportPage defaultTab="complaints" />;
// }


'use client';
import React, { useState, useMemo } from "react";
import {
  MoreHorizontal, // Changed to horizontal dots to match design usually, or keep Vertical if preferred. Design shows 3 dots inside a box.
  Search,
  Filter,
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
} from "lucide-react";

// --- BRAND CONFIGURATION ---
const BRAND_COLOR = "emerald"; // Main brand color
const ITEMS_PER_PAGE = 10;

// --- TYPES & INTERFACES ---

type ComplaintStatus = "Open" | "Closed";

interface Complaint {
  id: string;
  srNo: number;
  bookingId: string;
  reportedBy: string; // e.g., 'Animal', 'Test (France)'
  riderName: string;
  driverName: string;
  reason: string;
  originalComment: string; // The comment made by the reporter
  adminResponse?: string; // The response added by admin when closing
  status: ComplaintStatus;
  createdAt: string;
}

// --- MOCK DATA ---

const initialComplaints: Complaint[] = [
  {
    id: "C-001",
    srNo: 1,
    bookingId: "BK-778899",
    reportedBy: "Animal",
    riderName: "Jane Doe",
    driverName: "Driver Sam",
    reason:
      "Safety concerns: The rider felt unsafe due to the driver's driving style, actions, or the overall safety of the vehicle.",
    originalComment: "hii testing",
    status: "Closed", // Updated to match screenshot
    adminResponse: "We have investigated the issue.",
    createdAt: "04/12/2025",
  },
  {
    id: "C-002",
    srNo: 2,
    bookingId: "BK-112233",
    reportedBy: "Test (France)",
    riderName: "John Smith",
    driverName: "Driver Mike",
    reason:
      "Safety concerns: The rider felt unsafe due to the driver's driving style, actions, or the overall safety of the vehicle.",
    originalComment: "dhhdhdhdhdhue7377ehsus",
    status: "Closed",
    adminResponse: "We have investigated the issue and warned the driver.",
    createdAt: "03/12/2025",
  },
  {
    id: "C-003",
    srNo: 3,
    bookingId: "BK-445566",
    reportedBy: "System",
    riderName: "Alice Brown",
    driverName: "Driver Tom",
    reason: "Vehicle condition: The car was not clean.",
    originalComment: "The car smelled like smoke.",
    status: "Open",
    createdAt: "02/12/2025",
  },
  {
    id: "C-004",
    srNo: 4,
    bookingId: "BK-998877",
    reportedBy: "Support Agent",
    riderName: "Bob White",
    driverName: "Driver Steve",
    reason: "Delay: Driver was late by 15 mins.",
    originalComment: "I missed my meeting.",
    status: "Open", // Changed for variety
    createdAt: "01/12/2025",
  },
];

// --- UTILITY COMPONENTS ---

const StatusBadge: React.FC<{ status: ComplaintStatus }> = ({ status }) => {
  const styles =
    status === "Open"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-emerald-100 text-emerald-700 border-emerald-200"; // Green for closed

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded border ${styles}`}
    >
      {status}
    </span>
  );
};

// --- MAIN COMPONENT ---

const RideComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);

  // Modal States
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

  // Response Form State
  const [responseText, setResponseText] = useState("");

  // Filter States
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("Does not matter");

  // --- ACTIONS ---

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleOpenDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailModalOpen(true);
  };

  const handleOpenResponse = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.adminResponse || ""); // Pre-fill if exists
    setIsResponseModalOpen(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedComplaint) return;

    if (!responseText.trim()) {
      alert("Please enter a response to close the case.");
      return;
    }

    // Update the complaint
    const updatedComplaints = complaints.map((c) => {
      if (c.id === selectedComplaint.id) {
        return {
          ...c,
          status: "Closed" as ComplaintStatus,
          adminResponse: responseText,
        };
      }
      return c;
    });

    setComplaints(updatedComplaints);
    setIsResponseModalOpen(false);
    setResponseText("");
    setSelectedComplaint(null);
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesKeyword =
        c.riderName.toLowerCase().includes(keyword.toLowerCase()) ||
        c.driverName.toLowerCase().includes(keyword.toLowerCase()) ||
        c.bookingId.toLowerCase().includes(keyword.toLowerCase()) ||
        c.reportedBy.toLowerCase().includes(keyword.toLowerCase());

      const matchesStatus =
        statusFilter === "Does not matter" || c.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [complaints, keyword, statusFilter]);

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

  // --- SUB-COMPONENTS (Defined inside to access state easily) ---

  const ActionMenu: React.FC<{ complaint: Complaint }> = ({ complaint }) => {
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
            <div className="absolute right-0 z-20 w-48 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleOpenResponse(complaint);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                View Comment
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleOpenDetail(complaint);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Detail
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleDelete(complaint.id);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
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
        <div className=" w-full">
          <div className="max-w-full">
            <h1 className="text-2xl font-bold text-white bg-black max-w-full p-1 rounded">
              Ride complaints
            </h1>
          </div>
        </div>
        <nav className="flex items-center text-sm text-gray-500 mt-1">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-800">Ride complaints</span>
        </nav>
      </div>

      {/* SEARCH & FILTER SECTION */}
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {/* Keyword Input */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Keyword
            </label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                placeholder="Enter the rider's name, driver's name or the ride booking ID."
              />
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
                <option>Open</option>
                <option>Closed</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button className="px-8 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors">
              Search
            </button>
            <button
              onClick={() => {
                setKeyword("");
                setStatusFilter("Does not matter");
              }}
              className="px-6 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors shadow-sm"
            >
              Clear search
            </button>
          </div>
        </div>

        {/* Action Buttons */}
      </div>

      {/* COMPLAINTS LIST TABLE */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-white bg-black max-w-full p-1 rounded">
            Ride complaints list
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32">
                  Ride
                  <br />
                  booking ID
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32">
                  Reported
                  <br />
                  by
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Rider
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">
                  Reason
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6">
                  Comments
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
                      {item.bookingId.replace("BK-", "BK- \n") || (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 align-top">
                      {item.reportedBy}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 align-top">
                      <div className="text-gray-900">{item.riderName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 align-top">
                      <div className="text-gray-900">{item.driverName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 align-top">
                      <p className="line-clamp-3 leading-relaxed">
                        {item.reason}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 align-top">
                      <p className="line-clamp-3">{item.originalComment}</p>
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
                    colSpan={9}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No complaints found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder (Based on previous designs) */}
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
                Case Details
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
                    <User className="w-3 h-3" /> Reported By
                  </label>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedComplaint.reportedBy}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" /> Date
                  </label>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedComplaint.createdAt}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                    <User className="w-3 h-3" /> Rider
                  </label>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedComplaint.riderName}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
                    <Car className="w-3 h-3" /> Driver
                  </label>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedComplaint.driverName}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                  <AlertTriangle className="w-3 h-3" /> Reason
                </label>
                <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm border border-red-100">
                  {selectedComplaint.reason}
                </div>
              </div>

              {/* Original Comment */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                  Original Comment
                </label>
                <div className="p-3 bg-gray-50 text-gray-700 rounded-md text-sm border border-gray-200">
                  "{selectedComplaint.originalComment}"
                </div>
              </div>

              {/* Admin Response (if exists) */}
              {selectedComplaint.adminResponse && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                    Support Response
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

      {/* 2. RESPONSE MODAL (Action Logic) */}
      {isResponseModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {selectedComplaint.status === "Open" ? (
                  <>
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Respond to Case
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Case Resolution
                  </>
                )}
              </h3>
              <button
                onClick={() => setIsResponseModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Context */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">
                  Complaint regarding booking{" "}
                  <span className="font-mono text-gray-700 font-bold">
                    {selectedComplaint.bookingId}
                  </span>
                </p>
                <p className="text-sm text-gray-800 italic bg-gray-50 p-2 rounded border border-gray-100">
                  "{selectedComplaint.reason}"
                </p>
              </div>

              {selectedComplaint.status === "Open" ? (
                // --- OPEN STATE: Input Form ---
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Response
                    </label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={5}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      placeholder="Enter details about the resolution to close this case..."
                    />
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-xs">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Submitting this response will officially{" "}
                      <strong>CLOSE</strong> the case. This action cannot be
                      undone.
                    </p>
                  </div>
                </div>
              ) : (
                // --- CLOSED STATE: Read Only ---
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-emerald-700 mb-2">
                      Resolution Message
                    </label>
                    <div className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-900 text-sm leading-relaxed">
                      {selectedComplaint.adminResponse}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                      Case Closed
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsResponseModalOpen(false)}
                className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              {selectedComplaint.status === "Open" && (
                <button
                  onClick={handleSubmitResponse}
                  className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  Submit & Close Case
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideComplaintsPage;
