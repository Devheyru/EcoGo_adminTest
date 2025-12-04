// import { SupportPage } from "@/components/SupportPage";
// import { requirePermission } from "@/lib/auth";

// export default async function Page() {
//   await requirePermission("support", "read");
//   return <SupportPage defaultTab="complaints" />;
// }
'use client';
import React, { useState, useMemo } from "react";
import {
  MoreHorizontal,
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
  CreditCard,
  Smartphone,
  ShieldAlert,
} from "lucide-react";

// --- BRAND CONFIGURATION ---
const BRAND_COLOR = "emerald";
const ITEMS_PER_PAGE = 10;

// --- TYPES & INTERFACES ---

type ComplaintStatus = "Open" | "Closed" | "Pending";
type IssueCategory =
  | "Rider Issue"
  | "Payment"
  | "App Glitch"
  | "Document"
  | "Safety";

interface DriverComplaint {
  id: string;
  srNo: number;
  referenceId: string; // Booking ID or Ticket ID
  driverName: string;
  driverPhone: string;
  relatedTo: string; // Could be a Rider Name or "System" or "Support"
  category: IssueCategory;
  subject: string; // Short reason/title
  description: string; // Full description
  adminResponse?: string;
  status: ComplaintStatus;
  createdAt: string;
}

// --- MOCK DATA ---

const initialDriverComplaints: DriverComplaint[] = [
  {
    id: "DC-001",
    srNo: 1,
    referenceId: "BK-778899",
    driverName: "Driver Sam",
    driverPhone: "+1 987 654 3210",
    relatedTo: "Rider: Jane Doe",
    category: "Rider Issue",
    subject: "Rider refused to wear seatbelt",
    description:
      "The rider was aggressive when I asked them to wear a seatbelt. I felt unsafe continuing the trip.",
    status: "Open",
    createdAt: "04/12/2025",
  },
  {
    id: "DC-002",
    srNo: 2,
    referenceId: "TX-998877",
    driverName: "Driver Mike",
    driverPhone: "+1 555 123 4567",
    relatedTo: "System (Wallet)",
    category: "Payment",
    subject: "Weekly payout mismatch",
    description:
      "My earnings for last week show $500 but I only received $450 in my bank account. Please check.",
    status: "Closed",
    adminResponse:
      "We deducted $50 for the vehicle lease payment as per the agreement. Please check your invoice #INV-2025.",
    createdAt: "03/12/2025",
  },
  {
    id: "DC-003",
    srNo: 3,
    referenceId: "APP-445566",
    driverName: "Driver Tom",
    driverPhone: "+1 666 777 8888",
    relatedTo: "App System",
    category: "App Glitch",
    subject: "GPS not updating",
    description:
      "The navigation froze during my last trip. I had to use Google Maps externally.",
    status: "Pending",
    createdAt: "02/12/2025",
  },
  {
    id: "DC-004",
    srNo: 4,
    referenceId: "BK-112233",
    driverName: "Driver Steve",
    driverPhone: "+1 222 333 4444",
    relatedTo: "Rider: Bob White",
    category: "Safety",
    subject: "Rider was intoxicated",
    description:
      "Rider vomited in the backseat. I need a cleaning fee reimbursement.",
    status: "Open",
    createdAt: "01/12/2025",
  },
  {
    id: "DC-005",
    srNo: 5,
    referenceId: "DOC-554433",
    driverName: "Driver Sarah",
    driverPhone: "+1 999 888 7777",
    relatedTo: "Verification Team",
    category: "Document",
    subject: "License renewal rejected",
    description:
      "I uploaded my new license 2 days ago but it is still showing pending. I cannot go online.",
    status: "Closed",
    adminResponse:
      "Your document was blurry. We have sent a notification requesting a clearer photo.",
    createdAt: "30/11/2025",
  },
];

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

// --- UTILITY COMPONENTS ---

const StatusBadge: React.FC<{ status: ComplaintStatus }> = ({ status }) => {
  let styles = "";
  switch (status) {
    case "Open":
      styles = "bg-red-100 text-red-700 border-red-200";
      break;
    case "Closed":
      styles = "bg-emerald-100 text-emerald-700 border-emerald-200";
      break;
    case "Pending":
      styles = "bg-yellow-100 text-yellow-700 border-yellow-200";
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
    case "Payment":
      return <CreditCard className="w-4 h-4 text-blue-500" />;
    case "App Glitch":
      return <Smartphone className="w-4 h-4 text-purple-500" />;
    case "Safety":
      return <ShieldAlert className="w-4 h-4 text-red-500" />;
    case "Rider Issue":
      return <User className="w-4 h-4 text-orange-500" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500" />;
  }
};

// --- MAIN COMPONENT ---

const DriverComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<DriverComplaint[]>(
    initialDriverComplaints
  );

  // Modal States
  const [selectedComplaint, setSelectedComplaint] =
    useState<DriverComplaint | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

  // Response Form State
  const [responseText, setResponseText] = useState("");

  // Filter States
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("Does not matter");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  // --- ACTIONS ---

  const handleDelete = (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this complaint record?")
    ) {
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleOpenDetail = (complaint: DriverComplaint) => {
    setSelectedComplaint(complaint);
    setIsDetailModalOpen(true);
  };

  const handleOpenResponse = (complaint: DriverComplaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.adminResponse || "");
    setIsResponseModalOpen(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedComplaint) return;

    if (!responseText.trim()) {
      alert("Please enter a resolution note to close the case.");
      return;
    }

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
        c.driverName.toLowerCase().includes(keyword.toLowerCase()) ||
        c.referenceId.toLowerCase().includes(keyword.toLowerCase()) ||
        c.subject.toLowerCase().includes(keyword.toLowerCase());

      const matchesStatus =
        statusFilter === "Does not matter" || c.status === statusFilter;
      const matchesCategory =
        categoryFilter === "All Categories" || c.category === categoryFilter;

      return matchesKeyword && matchesStatus && matchesCategory;
    });
  }, [complaints, keyword, statusFilter, categoryFilter]);

  // --- SUB-COMPONENTS ---

  const ActionMenu: React.FC<{ complaint: DriverComplaint }> = ({
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
            <div className="absolute right-0 z-20 w-48 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleOpenResponse(complaint);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {complaint.status === "Closed"
                  ? "View Resolution"
                  : "Resolve Case"}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleOpenDetail(complaint);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Detail
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
        <div className="w-full">
          <div>
            <h1 className="text-2xl font-bold text-white bg-black max-w-full p-1 rounded">
              Driver complaints
            </h1>
          </div>
          <nav className="flex items-center text-sm text-gray-500 mt-1">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-800">Driver complaints</span>
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
              placeholder="Search driver name, ID, or subject..."
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
                <option>Rider Issue</option>
                <option>Payment</option>
                <option>App Glitch</option>
                <option>Safety</option>
                <option>Document</option>
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
                <option>Open</option>
                <option>Pending</option>
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
              Clear search
            </button>
          </div>
        </div>
      </div>

      {/* COMPLAINTS LIST TABLE */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-white bg-black max-w-full p-1 rounded">
            Driver complaints list
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Sr. no
                </th>
                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32">
                  Reference
                  <br />
                  ID
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Driver Details
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">
                  Description
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
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {item.srNo}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-gray-900 align-top">
                      {item.referenceId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 align-top">
                      <div className="font-semibold text-gray-900">
                        {item.driverName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.driverPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 align-top">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={item.category} />
                        {item.category}
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
                    <td className="px-6 py-2 align-top">
                      <div>
                        <StatusBadge status={item.status} />
                        {(() => {
                          const t = timeAgoShort(item.createdAt);
                          return (
                            <div
                              className={`text-xs mt-3 ${t.cls} font-medium`}
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
                    No complaints found matching your criteria.
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
                Driver Case Details
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
                    Reference ID
                  </span>
                  <div className="text-lg font-bold text-gray-800">
                    {selectedComplaint.referenceId}
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
                    <Car className="w-3 h-3" /> Driver
                  </label>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedComplaint.driverName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedComplaint.driverPhone}
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
                    <User className="w-3 h-3" /> Related To
                  </label>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedComplaint.relatedTo}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                  Subject
                </label>
                <div className="p-3 bg-gray-50 text-gray-800 rounded-md text-sm font-semibold border border-gray-200">
                  {selectedComplaint.subject}
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                  Detailed Description
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

      {/* 2. RESPONSE MODAL (Action Logic) */}
      {isResponseModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {selectedComplaint.status !== "Closed" ? (
                  <>
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Resolve Complaint
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Resolution Details
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
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-500">
                    {selectedComplaint.referenceId}
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    {selectedComplaint.category}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-800 mb-1">
                  {selectedComplaint.subject}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  "{selectedComplaint.description}"
                </p>
              </div>

              {selectedComplaint.status !== "Closed" ? (
                // --- OPEN STATE: Input Form ---
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Resolution Note
                    </label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={5}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      placeholder="Explain how this issue was resolved..."
                    />
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-xs">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Submitting this note will mark the complaint as{" "}
                      <strong>CLOSED</strong>. The driver will be notified.
                    </p>
                  </div>
                </div>
              ) : (
                // --- CLOSED STATE: Read Only ---
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-emerald-700 mb-2">
                      Resolution Note
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
              {selectedComplaint.status !== "Closed" && (
                <button
                  onClick={handleSubmitResponse}
                  className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  Resolve & Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverComplaintsPage;