'use client';
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  MoreHorizontal,
  Search,
  ChevronDown,
  X,
  CalendarClock,
  Car,
  User,
  MapPin,
  Map,
  Truck,
  Send,
  AlertTriangle,
  Eye,
  Ban,
  Clock,
  CheckCircle,
  Clock3, // Different icon for scheduled time
  Briefcase,
  Star,
} from "lucide-react";

// --- CONFIG & TYPES ---

const ITEMS_PER_PAGE = 10;
const BRAND_COLOR = "emerald"; // Using indigo for scheduled page contrast

type ScheduledRideStatus =
  | "Scheduled"
  | "Pre-Assigned"
  | "Cancelled"
  | "In Progress";
type ModalMode = "Detail" | "PreAssign";

interface ScheduledRide {
  id: string;
  riderName: string;
  riderPhone: string;
  pickup: string;
  dropoff: string;
  fareEstimate: number;
  scheduledTime: number; // UNIX timestamp (milliseconds) in the future
  status: ScheduledRideStatus;
  preAssignedDriverId: string | null;
  notes: string;
}

interface Driver {
  id: string;
  name: string;
  status: "Online" | "Offline" | "Busy";
  location: string;
  isNearby: boolean;
  rating: number;
}

// --- MOCK DATA ---
const createMockScheduledRide = (
  id: number,
  scheduledOffsetHours: number,
  initialStatus: ScheduledRideStatus = "Scheduled"
): ScheduledRide => {
  const names = [
    "Sarah Connor",
    "John Rambo",
    "Ellen Ripley",
    "Rick Deckard",
    "Arthur Dent",
  ];
  const locations = [
    "Uptown Hotel",
    "Tech District Office",
    "Suburban Residence",
    "Coastal View B&B",
    "Downtown Concert Hall",
  ];
  const futureTime =
    Date.now() +
    scheduledOffsetHours * 3600000 +
    Math.floor(Math.random() * 30 * 60000); // Time in the future

  return {
    id: `SCHD-${2000 + id}`,
    riderName: names[id % names.length],
    riderPhone: `+1 555 ${2000 + id}`,
    pickup: locations[id % locations.length],
    dropoff: locations[(id + 2) % locations.length],
    fareEstimate: Math.floor(Math.random() * 60) + 20,
    scheduledTime: futureTime,
    status: initialStatus,
    preAssignedDriverId:
      initialStatus === "Pre-Assigned" ? `DRV-A${10 + id}` : null,
    notes:
      id % 3 === 0
        ? "Need extra space for luggage."
        : "VIP Customer - ensure punctuality.",
  };
};

const initialScheduledRides: ScheduledRide[] = [
  createMockScheduledRide(1, 1, "Pre-Assigned"),
  createMockScheduledRide(2, 5),
  createMockScheduledRide(3, 2),
  createMockScheduledRide(4, 12),
  createMockScheduledRide(5, 0.5),
  createMockScheduledRide(6, 8),
  createMockScheduledRide(7, 24, "Pre-Assigned"),
  createMockScheduledRide(8, 1.5),
];

const mockDrivers: Driver[] = [
  {
    id: "DRV-101",
    name: "John Doe",
    status: "Online",
    location: "5th Ave & 59th St",
    isNearby: true,
    rating: 4.8,
  },
  {
    id: "DRV-102",
    name: "Jane Smith",
    status: "Offline",
    location: "Broadway & W 42nd St",
    isNearby: false,
    rating: 4.5,
  },
  {
    id: "DRV-103",
    name: "Bob Johnson",
    status: "Online",
    location: "Lower Manhattan",
    isNearby: true,
    rating: 4.9,
  },
  {
    id: "DRV-104",
    name: "Alice Williams",
    status: "Offline",
    location: "Brooklyn Navy Yard",
    isNearby: false,
    rating: 4.2,
  },
  {
    id: "DRV-105",
    name: "Chris Lee",
    status: "Online",
    location: "Chelsea Piers",
    isNearby: false,
    rating: 4.7,
  },
];

// --- UTILITY COMPONENTS ---

const StatusBadge: React.FC<{ status: ScheduledRideStatus }> = ({ status }) => {
  let styles = "";
  switch (status) {
    case "Scheduled":
      styles = "bg-blue-100 text-blue-700 border-blue-200";
      break;
    case "Pre-Assigned":
      styles = "bg-indigo-100 text-indigo-700 border-indigo-200";
      break;
    case "In Progress":
      styles = "bg-emerald-100 text-emerald-700 border-emerald-200";
      break;
    case "Cancelled":
      styles = "bg-gray-100 text-gray-500 border-gray-200";
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

const DriverStatusBadge: React.FC<{ status: Driver["status"] }> = ({
  status,
}) => {
  let styles = "";
  switch (status) {
    case "Online":
      styles = "bg-green-100 text-green-700";
      break;
    case "Busy":
      styles = "bg-yellow-100 text-yellow-700";
      break;
    case "Offline":
      styles = "bg-gray-100 text-gray-500";
      break;
  }
  return (
    <span
      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles}`}
    >
      {status}
    </span>
  );
};

// Custom Component to handle the real-time countdown timer
const CountdownTimer: React.FC<{
  scheduledTime: number;
  status: ScheduledRideStatus;
}> = React.memo(({ scheduledTime, status }) => {
  const [timeLeft, setTimeLeft] = useState(scheduledTime - Date.now());

  useEffect(() => {
    if (status !== "Scheduled" && status !== "Pre-Assigned") return;

    const interval = setInterval(() => {
      const newTimeLeft = scheduledTime - Date.now();
      setTimeLeft(newTimeLeft);

      // Auto-transition to 'In Progress' near pickup time (for simulation)
      if (newTimeLeft <= 0) {
        clearInterval(interval);
        // In a real app, this would be handled by a backend system.
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [scheduledTime, status]);

  if (status === "Cancelled") {
    return <span className="text-sm font-medium text-gray-500">N/A</span>;
  }

  if (timeLeft <= 0) {
    return (
      <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
        <CheckCircle className="w-4 h-4" /> Now Due / In Progress
      </span>
    );
  }

  const totalSeconds = Math.floor(timeLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(
    2,
    "0"
  );
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0"
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  const textColor =
    totalSeconds < 3600
      ? "text-red-600 font-bold"
      : totalSeconds < 86400
      ? "text-orange-500"
      : "text-gray-700";

  return (
    <span
      className={`tabular-nums text-sm ${textColor} flex items-center gap-1`}
    >
      <Clock className="w-4 h-4" />
      {days > 0 && <span className="font-bold">{days}d </span>}
      {hours}:{minutes}:{seconds}
    </span>
  );
});

// --- MAIN COMPONENT ---

const ScheduledRidesPage: React.FC = () => {
  const [rides, setRides] = useState<ScheduledRide[]>(initialScheduledRides);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("Scheduled"); // Default to Scheduled
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("Detail");
  const [selectedRide, setSelectedRide] = useState<ScheduledRide | null>(null);
  const [preAssignedDriverId, setPreAssignedDriverId] = useState("");

  // --- FILTERING & PAGINATION LOGIC ---

  const filteredRides = useMemo(() => {
    return rides
      .filter((r) => {
        const matchesKeyword =
          r.riderName.toLowerCase().includes(keyword.toLowerCase()) ||
          r.pickup.toLowerCase().includes(keyword.toLowerCase()) ||
          r.dropoff.toLowerCase().includes(keyword.toLowerCase()) ||
          r.id.toLowerCase().includes(keyword.toLowerCase());

        const matchesStatus =
          statusFilter === "Does not matter" || r.status === statusFilter;

        return matchesKeyword && matchesStatus;
      })
      .sort((a, b) => {
        // Sort by scheduled time (soonest first)
        return a.scheduledTime - b.scheduledTime;
      });
  }, [rides, keyword, statusFilter]);

  const totalPages = Math.ceil(filteredRides.length / ITEMS_PER_PAGE);
  const paginatedRides = filteredRides.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- ADMIN ACTIONS ---

  const handleOpenModal = (ride: ScheduledRide, mode: ModalMode = "Detail") => {
    setSelectedRide(ride);
    setPreAssignedDriverId(ride.preAssignedDriverId || "");
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleCancelRide = (rideId: string) => {
    if (
      window.confirm(
        `Are you sure you want to cancel scheduled ride ${rideId}?`
      )
    ) {
      setRides((prev) =>
        prev.map((r) =>
          r.id === rideId
            ? {
                ...r,
                status: "Cancelled" as ScheduledRideStatus,
                preAssignedDriverId: null,
              }
            : r
        )
      );
    }
  };

  const handlePreAssign = () => {
    if (!selectedRide || !preAssignedDriverId.trim()) {
      console.error(
        "Validation Error: Ride not selected or driver ID missing."
      );
      return;
    }

    const newDriverId = preAssignedDriverId.trim().toUpperCase();

    // 1. Update the ride status and pre-assigned driver ID
    setRides((prev) =>
      prev.map((r) => {
        if (r.id === selectedRide.id) {
          return {
            ...r,
            preAssignedDriverId: newDriverId,
            status: "Pre-Assigned" as ScheduledRideStatus,
          };
        }
        return r;
      })
    );

    // 2. Close and clean up
    setIsModalOpen(false);
    setSelectedRide(null);
    setPreAssignedDriverId("");
  };

  const ActionMenu: React.FC<{ ride: ScheduledRide }> = ({ ride }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isActive =
      ride.status !== "Cancelled" && ride.status !== "In Progress";

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
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 z-50 w-64 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl py-1 transform translate-x-1/2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleOpenModal(ride, "Detail");
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2 text-black" />
                View Full Detail & Notes
              </button>

              {isActive && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleOpenModal(ride, "PreAssign");
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 font-medium border-t border-gray-100"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  {ride.preAssignedDriverId
                    ? "Re-Assign Driver"
                    : "Pre-Assign Driver"}
                </button>
              )}

              {isActive && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleCancelRide(ride.id);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Cancel Scheduled Ride
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const PreAssignmentContent: React.FC<{ ride: ScheduledRide }> = ({
    ride,
  }) => {
    // For scheduled rides, we filter by drivers who are likely to be available at the scheduled time.
    // For mock data, we will just suggest high-rated drivers for pre-assignment.
    const highRatedDrivers = mockDrivers.filter((d) => d.rating >= 4.7);
    const otherDrivers = mockDrivers.filter((d) => d.rating < 4.7);

    const handleDriverSelect = (driverId: string) => {
      setPreAssignedDriverId(driverId);
    };

    const selectedDriver = mockDrivers.find(
      (d) => d.id === preAssignedDriverId
    );

    return (
      <div className="space-y-6">
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h4 className="text-lg font-bold text-indigo-800 flex items-center gap-2 mb-2">
            <Send className="w-5 h-5" />
            Pre-Assignment Strategy
          </h4>
          <p className="text-sm text-indigo-700">
            Proactively assign a driver for the pickup at:{" "}
            <span className="font-bold">
              {new Date(ride.scheduledTime).toLocaleString()}
            </span>
            .
          </p>
        </div>

        {/* Driver List - Prioritized by Rating/Reliability */}
        <div className="space-y-3">
          <h5 className="text-base font-semibold text-gray-700">
            Best Candidates for Pre-Assignment ({highRatedDrivers.length})
          </h5>

          {highRatedDrivers.map((driver) => (
            <button
              key={driver.id}
              onClick={() => handleDriverSelect(driver.id)}
              className={`w-full p-3 flex justify-between items-center rounded-lg border transition-all ${
                preAssignedDriverId === driver.id
                  ? "bg-indigo-100 border-indigo-500 shadow-md"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="text-left">
                <p className="font-semibold text-gray-800">
                  {driver.name} ({driver.id})
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  Rating: {driver.rating}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-medium text-black ">
                  High Reliability
                </span>
                <DriverStatusBadge status={driver.status} />
              </div>
            </button>
          ))}

          {otherDrivers.length > 0 && (
            <details className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <summary className="font-medium text-sm text-gray-600 cursor-pointer">
                Show {otherDrivers.length} Other Drivers
              </summary>
              <div className="mt-3 space-y-2">
                {otherDrivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => handleDriverSelect(driver.id)}
                    className={`w-full p-2 flex justify-between items-center text-sm rounded-lg border transition-all ${
                      preAssignedDriverId === driver.id
                        ? "bg-red-100 border-red-500"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-mono text-gray-800">
                      {driver.id} - {driver.name}
                    </span>
                    <span className="text-xs font-medium text-yellow-600">
                      ★ {driver.rating}
                    </span>
                  </button>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Manual Input (Fallback/Confirmation) */}
        <div className="mt-6 border-t pt-4 border-gray-200">
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Selected Driver ID (Final Confirmation)
          </label>
          <input
            type="text"
            value={preAssignedDriverId}
            onChange={(e) => setPreAssignedDriverId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono uppercase font-bold"
            placeholder="Enter DRV-XXX or select from list above"
          />
          {selectedDriver && (
            <p className="mt-1 text-xs text-gray-600">
              You are pre-assigning:{" "}
              <span className="font-semibold text-indigo-700">
                {selectedDriver.name}
              </span>
              .
            </p>
          )}
        </div>
      </div>
    );
  };

  // --- RENDERING ---

  return (
    <div className="min-h-screen p-8 bg-gray-50 font-sans text-gray-800">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarClock className="w-7 h-7 text-black" />
          Scheduled & Future Rides
        </h1>
        <p className="text-gray-500 mt-1">
          Manage and pre-assign drivers for upcoming scheduled bookings.
        </p>
      </div>

      {/* FILTER SECTION (Similar to previous page) */}
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Search by Rider/Location/ID
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder="Rider name, pickup, dropoff..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Filter by Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-12 px-4 appearance-none bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-700"
              >
                <option value="Scheduled">Scheduled (No Driver)</option>
                <option value="Pre-Assigned">
                  Pre-Assigned (Driver Confirmed)
                </option>
                <option value="In Progress">In Progress</option>
                <option value="Does not matter">All Scheduled</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => setCurrentPage(1)}
            className="h-12 flex items-center justify-center gap-2 px-4 bg-green-500 text-black text-sm font-medium rounded-lg hover:bg-green-300 transition-colors"
          >
            <Search className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* RIDES LIST TABLE */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Total Scheduled Records: {filteredRides.length}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ride ID
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Scheduled Time
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">
                  Route (P/U & D/O)
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status / Driver
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Time Remaining
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRides.length > 0 ? (
                paginatedRides.map((ride) => (
                  <tr
                    key={ride.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 align-top">
                      {ride.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 align-top font-semibold">
                      <div className="flex items-center gap-1 text-indigo-700">
                        <Clock3 className="w-4 h-4" />
                        {new Date(ride.scheduledTime).toLocaleTimeString(
                          "en-US",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(ride.scheduledTime).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 align-top">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />
                        <span className="font-medium text-gray-800 line-clamp-1">
                          {ride.pickup}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 mt-1">
                        <Map className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                        <span className="text-gray-600 line-clamp-1">
                          {ride.dropoff}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <StatusBadge status={ride.status} />
                      {ride.preAssignedDriverId && (
                        <div className="text-xs mt-1 text-gray-500 flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          Driver: {ride.preAssignedDriverId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <CountdownTimer
                        scheduledTime={ride.scheduledTime}
                        status={ride.status}
                      />
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="flex justify-end">
                        <ActionMenu ride={ride} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No scheduled rides found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {paginatedRides.length} of {filteredRides.length} results
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  currentPage === i + 1
                    ? "bg-black text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* --- PRE-ASSIGNMENT/DETAIL MODAL --- */}
      {isModalOpen && selectedRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarClock className="w-6 h-6 text-black" />
                Scheduled Ride: {selectedRide.id} -{" "}
                {modalMode === "PreAssign"
                  ? "Pre-Assign Driver"
                  : "Full Details"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              {/* 1. RIDE DETAILS (Always Visible) */}
              <div
                className={`col-span-1 space-y-4 ${
                  modalMode === "PreAssign" ? "md:col-span-1" : "md:col-span-3"
                }`}
              >
                <h4 className="text-lg font-bold text-gray-900 border-b pb-2">
                  Booking Information
                </h4>
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-dashed">
                    <span className="text-xl font-bold text-gray-900">
                      {selectedRide.riderName}
                    </span>
                    <StatusBadge status={selectedRide.status} />
                  </div>

                  <DetailRow
                    icon={User}
                    label="Rider Phone"
                    value={selectedRide.riderPhone}
                    color="blue"
                  />
                  <DetailRow
                    icon={CalendarClock}
                    label="Scheduled For"
                    value={new Date(
                      selectedRide.scheduledTime
                    ).toLocaleString()}
                    color="indigo"
                  />
                  <DetailRow
                    icon={Clock}
                    label="Time Left"
                    value={
                      <CountdownTimer
                        scheduledTime={selectedRide.scheduledTime}
                        status={selectedRide.status}
                      />
                    }
                    color="red"
                  />
                  <DetailRow
                    icon={Car}
                    label="Fare Estimate"
                    value={`$${selectedRide.fareEstimate.toFixed(2)}`}
                    color="emerald"
                  />
                  <DetailRow
                    icon={MapPin}
                    label="Pickup Location"
                    value={selectedRide.pickup}
                    color="orange"
                  />
                  <DetailRow
                    icon={Map}
                    label="Dropoff Location"
                    value={selectedRide.dropoff}
                    color="purple"
                  />

                  {selectedRide.preAssignedDriverId && (
                    <div className="pt-2 border-t mt-2">
                      <DetailRow
                        icon={Truck}
                        label="Pre-Assigned Driver"
                        value={selectedRide.preAssignedDriverId}
                        color="indigo"
                      />
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h5 className="font-semibold text-gray-800 flex items-center gap-1 mb-1">
                    <Briefcase className="w-4 h-4" />
                    Customer Notes
                  </h5>
                  <p className="text-sm text-gray-600 italic">
                    {selectedRide.notes}
                  </p>
                </div>
              </div>

              {/* 2. PRE-ASSIGNMENT (Only visible in PreAssign Mode) */}
              {modalMode === "PreAssign" && (
                <div className="col-span-2 space-y-4">
                  <PreAssignmentContent ride={selectedRide} />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              {modalMode === "PreAssign" &&
                (selectedRide.status === "Scheduled" ||
                  selectedRide.status === "Pre-Assigned") && (
                  <button
                    onClick={handlePreAssign}
                    disabled={!preAssignedDriverId.trim()}
                    className="px-6 py-2 text-sm font-bold text-white bg-black hover:bg-gray-400 rounded-lg shadow-md transition-colors disabled:bg-indigo-300"
                  >
                    Confirm Pre-Assignment to {preAssignedDriverId || "Driver"}
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component for Detail Rows
const DetailRow: React.FC<{
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  color: string;
}> = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center text-sm font-medium text-gray-700">
    <Icon className={`w-4 h-4 mr-2 text-${color}-500`} />
    <span className="font-semibold w-1/3">{label}:</span>
    <span className="w-2/3 text-gray-800 truncate">{value}</span>
  </div>
);

export default ScheduledRidesPage;
