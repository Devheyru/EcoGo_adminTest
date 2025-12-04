'use client';
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  MoreHorizontal,
  Search,
  ChevronDown,
  X,
  Clock,
  Car,
  User,
  MapPin,
  Map,
  CheckCircle,
  Truck,
  Send,
  RefreshCw,
  AlertTriangle,
  Eye, // Added for View Detail
  Ban, // Added for Cancel
} from "lucide-react";

// --- CONFIG & TYPES ---

const ITEMS_PER_PAGE = 10;
const BRAND_COLOR = "emerald";

type RideStatus = "Pending" | "Assigned" | "Active" | "Cancelled";
type ModalMode = "Detail" | "Assign";

interface Ride {
  id: string;
  riderName: string;
  riderPhone: string;
  pickup: string;
  dropoff: string;
  fareEstimate: number;
  requestTime: number; // UNIX timestamp (milliseconds)
  status: RideStatus;
  assignedDriverId: string | null;
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
const createMockRide = (
  id: number,
  requestOffsetMinutes: number,
  initialStatus: RideStatus = "Pending"
): Ride => {
  const names = [
    "Alex Johnson",
    "Ben Smith",
    "Chloe Davis",
    "Daniel White",
    "Ella Brown",
    "Finn Garcia",
  ];
  const locations = [
    "Times Square",
    "JFK Airport",
    "Central Park South",
    "Brooklyn Bridge",
    "Wall Street",
    "Upper East Side",
  ];
  const now = Date.now();

  return {
    id: `RIDE-${1000 + id}`,
    riderName: names[id % names.length],
    riderPhone: `+1 555 ${1000 + id}`,
    pickup: locations[id % locations.length],
    dropoff: locations[(id + 2) % locations.length],
    fareEstimate: Math.floor(Math.random() * 50) + 15,
    requestTime:
      now - requestOffsetMinutes * 60000 - Math.floor(Math.random() * 60000), // Time in the past
    status: initialStatus,
    assignedDriverId:
      initialStatus === "Assigned" || initialStatus === "Active"
        ? `DRV-${100 + id}`
        : null,
  };
};

const initialRides: Ride[] = [
  createMockRide(1, 15),
  createMockRide(2, 5, "Assigned"),
  createMockRide(3, 2),
  createMockRide(4, 25),
  createMockRide(5, 0.5),
  createMockRide(6, 40),
  createMockRide(7, 10),
  createMockRide(8, 7, "Active"),
  createMockRide(9, 12),
  createMockRide(10, 18),
  createMockRide(11, 22),
  createMockRide(12, 1),
  createMockRide(13, 30),
  createMockRide(14, 3, "Assigned"),
  createMockRide(15, 9),
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
    status: "Online",
    location: "Broadway & W 42nd St",
    isNearby: true,
    rating: 4.5,
  },
  {
    id: "DRV-103",
    name: "Bob Johnson",
    status: "Busy",
    location: "Lower Manhattan",
    isNearby: false,
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

const StatusBadge: React.FC<{ status: RideStatus }> = ({ status }) => {
  let styles = "";
  switch (status) {
    case "Pending":
      styles = "bg-red-100 text-red-700 border-red-200";
      break;
    case "Assigned":
      styles = "bg-yellow-100 text-yellow-700 border-yellow-200";
      break;
    case "Active":
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

// Custom Hook/Component to handle the real-time timer
const RequestTimer: React.FC<{ requestTime: number; status: RideStatus }> =
  React.memo(({ requestTime, status }) => {
    const [timeElapsed, setTimeElapsed] = useState(Date.now() - requestTime);

    useEffect(() => {
      if (status !== "Pending") return;

      const interval = setInterval(() => {
        setTimeElapsed(Date.now() - requestTime);
      }, 1000);

      return () => clearInterval(interval);
    }, [requestTime, status]);

    const totalSeconds = Math.floor(timeElapsed / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    const textColor =
      totalSeconds > 1200
        ? "text-red-600 font-bold"
        : totalSeconds > 300
        ? "text-orange-500"
        : "text-gray-700";

    return (
      <span
        className={`tabular-nums text-sm ${textColor} flex items-center gap-1`}
      >
        {status === "Pending" ? (
          <>
            <Clock className="w-4 h-4" />
            {hours}:{minutes}:{seconds}
          </>
        ) : status === "Assigned" ? (
          <span className="text-sm font-medium text-yellow-600">
            Waiting for Driver
          </span>
        ) : (
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        )}
      </span>
    );
  });

// --- MAIN COMPONENT ---

const PendingRidesPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>(initialRides);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending"); // Default to Pending
  const [currentPage, setCurrentPage] = useState(1);

  // Manual Assignment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("Detail");
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [manualDriverId, setManualDriverId] = useState("");

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
        // Sort by time requested (oldest first)
        return a.requestTime - b.requestTime;
      });
  }, [rides, keyword, statusFilter]);

  const totalPages = Math.ceil(filteredRides.length / ITEMS_PER_PAGE);
  const paginatedRides = filteredRides.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    // Reset page if filters drastically change the list size
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // --- ADMIN ACTIONS ---

  const handleOpenDetailModal = (ride: Ride, mode: ModalMode = "Detail") => {
    setSelectedRide(ride);
    setManualDriverId(ride.assignedDriverId || "");
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleCancelRide = (rideId: string) => {
    if (
      window.confirm(
        `Are you sure you want to cancel ride ${rideId}? This action cannot be undone.`
      )
    ) {
      setRides((prev) =>
        prev.map((r) =>
          r.id === rideId
            ? {
                ...r,
                status: "Cancelled" as RideStatus,
                assignedDriverId: null,
              }
            : r
        )
      );
    }
  };

  // Simulate driver accepting the ride shortly after manual assignment
  const simulateDriverAcceptance = useCallback(
    (rideId: string, driverId: string) => {
      setTimeout(() => {
        setRides((prev) =>
          prev.map((r) =>
            r.id === rideId && r.status === "Assigned"
              ? { ...r, status: "Active" as RideStatus }
              : r
          )
        );
      }, 5000); // 5 second delay for "acceptance"
      console.log(
        `Simulating driver ${driverId} accepting ride ${rideId} in 5 seconds.`
      );
    },
    []
  );

  const handleManualAssign = () => {
    if (!selectedRide || !manualDriverId.trim()) {
      console.error(
        "Validation Error: Ride not selected or driver ID missing."
      );
      return;
    }

    const newDriverId = manualDriverId.trim().toUpperCase();

    // 1. Update the ride status and assigned driver ID
    setRides((prev) =>
      prev.map((r) => {
        if (r.id === selectedRide.id) {
          return {
            ...r,
            assignedDriverId: newDriverId,
            status: "Assigned" as RideStatus,
          };
        }
        return r;
      })
    );

    // 2. Simulate the driver getting the assignment and accepting
    simulateDriverAcceptance(selectedRide.id, newDriverId);

    // 3. Close and clean up
    setIsModalOpen(false);
    setSelectedRide(null);
    setManualDriverId("");
  };

  const handleSimulateAutoAcceptance = (rideId: string, driverId: string) => {
    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId && r.status === "Assigned"
          ? { ...r, status: "Active" as RideStatus }
          : r
      )
    );
  };

  // --- SUB-COMPONENTS ---

  const ActionMenu: React.FC<{ ride: Ride }> = ({ ride }) => {
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
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 z-50 w-56 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl py-1 transform translate-x-1/2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleOpenDetailModal(ride, "Detail");
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                View Full Detail
              </button>

              {ride.status === "Pending" && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleOpenDetailModal(ride, "Assign");
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 font-medium border-t border-gray-100"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Assign Driver Manually
                </button>
              )}

              {ride.status === "Assigned" && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleSimulateAutoAcceptance(
                      ride.id,
                      ride.assignedDriverId!
                    );
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 font-medium"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Simulate Acceptance
                </button>
              )}

              {(ride.status === "Pending" || ride.status === "Assigned") && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleCancelRide(ride.id);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Cancel Ride
                </button>
              )}
            </div>
          </>
        )}
      </div>
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

  const ManualAssignmentContent: React.FC<{ ride: Ride }> = ({ ride }) => {
    const suitableDrivers = mockDrivers.filter(
      (d) => d.status === "Online" && d.isNearby
    );
    const otherDrivers = mockDrivers.filter(
      (d) => !(d.status === "Online" && d.isNearby)
    );

    const handleDriverSelect = (driverId: string) => {
      setManualDriverId(driverId);
    };

    const selectedDriver = mockDrivers.find((d) => d.id === manualDriverId);

    return (
      <div className="space-y-6">
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h4 className="text-lg font-bold text-indigo-800 flex items-center gap-2 mb-2">
            <Send className="w-5 h-5" />
            Dispatch Center
          </h4>
          <p className="text-sm text-indigo-700">
            Manually select a driver from the list below. The ride's pickup is
            near: <span className="font-semibold">{ride.pickup}</span>
          </p>
        </div>

        {/* Driver Criteria List */}
        <div className="space-y-3">
          <h5 className="text-base font-semibold text-gray-700">
            Available Drivers ({suitableDrivers.length})
          </h5>

          {suitableDrivers.length > 0 ? (
            suitableDrivers.map((driver) => (
              <button
                key={driver.id}
                onClick={() => handleDriverSelect(driver.id)}
                className={`w-full p-3 flex justify-between items-center rounded-lg border transition-all ${
                  manualDriverId === driver.id
                    ? "bg-indigo-100 border-indigo-500 shadow-md"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-800">
                    {driver.name} ({driver.id})
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500" />
                    {driver.location}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <DriverStatusBadge status={driver.status} />
                  <span
                    className={`text-xs font-medium ${
                      driver.isNearby ? "text-green-600" : "text-orange-500"
                    }`}
                  >
                    {driver.isNearby ? "Nearby" : "Further Away"}
                  </span>
                  <span className="text-xs font-medium text-yellow-600">
                    ★ {driver.rating}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              No online, nearby drivers detected. Assignment may lead to delays.
            </p>
          )}

          {otherDrivers.length > 0 && (
            <details className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <summary className="font-medium text-sm text-gray-600 cursor-pointer">
                Show {otherDrivers.length} Other Drivers (Busy/Offline)
              </summary>
              <div className="mt-3 space-y-2">
                {otherDrivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => handleDriverSelect(driver.id)}
                    className={`w-full p-2 flex justify-between items-center text-sm rounded-lg border transition-all ${
                      manualDriverId === driver.id
                        ? "bg-red-100 border-red-500"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-mono text-gray-800">
                      {driver.id} - {driver.name}
                    </span>
                    <DriverStatusBadge status={driver.status} />
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
            value={manualDriverId}
            onChange={(e) => setManualDriverId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono uppercase font-bold"
            placeholder="Enter DRV-XXX or select from list above"
          />
          {selectedDriver && (
            <p className="mt-1 text-xs text-gray-600">
              You are assigning:{" "}
              <span className="font-semibold text-indigo-700">
                {selectedDriver.name}
              </span>
              . Status: <DriverStatusBadge status={selectedDriver.status} />.
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
          <Clock className="w-7 h-7 text-red-500" />
          Pending & Assigned Rides Queue
        </h1>
        <p className="text-gray-500 mt-1">
          Real-time oversight for critical ride dispatch operations.
        </p>
      </div>

      {/* FILTER SECTION (Omitted for brevity, unchanged) */}
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* Keyword Input */}
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
                className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                placeholder="Rider name, pickup, dropoff..."
              />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Filter by Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-12 px-4 appearance-none bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-700"
              >
                <option value="Pending">Pending (No Driver)</option>
                <option value="Assigned">Assigned (Waiting Accept)</option>
                <option value="Active">Active (Driver Accepted)</option>
                <option value="Does not matter">All Unresolved</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => setRides([...rides].sort(() => 0.5 - Math.random()))} // Simple refresh simulation
            className="h-12 flex items-center justify-center gap-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Manual Refresh
          </button>
        </div>
      </div>

      {/* RIDES LIST TABLE */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Total Records: {filteredRides.length}
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
                  Rider Info
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">
                  Route (P/U & D/O)
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Fare
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Time Elapsed (HH:MM:SS)
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status / Driver
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
                    <td className="px-6 py-4 text-sm text-gray-700 align-top">
                      <div className="font-semibold text-gray-900">
                        {ride.riderName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ride.riderPhone}
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
                    <td className="px-6 py-4 text-lg font-bold text-gray-800 align-top text-center">
                      ${ride.fareEstimate.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <RequestTimer
                        requestTime={ride.requestTime}
                        status={ride.status}
                      />
                    </td>
                    <td className="px-6 py-4 align-top">
                      <StatusBadge status={ride.status} />
                      {ride.assignedDriverId && (
                        <div className="text-xs mt-1 text-gray-500 flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          Driver: {ride.assignedDriverId}
                        </div>
                      )}
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
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No rides found matching your filters.
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
                    ? "bg-gray-900 text-white"
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

      {/* --- MANUAL ASSIGNMENT/DETAIL MODAL --- */}
      {isModalOpen && selectedRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Truck className="w-6 h-6 text-indigo-600" />
                Ride: {selectedRide.id} -{" "}
                {modalMode === "Assign" ? "Manual Dispatch" : "Full Details"}
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
                  modalMode === "Assign" ? "md:col-span-1" : "md:col-span-3"
                }`}
              >
                <h4 className="text-lg font-bold text-gray-900 border-b pb-2">
                  Ride Information
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
                    icon={Clock}
                    label="Time Elapsed"
                    value={
                      <RequestTimer
                        requestTime={selectedRide.requestTime}
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

                  {selectedRide.assignedDriverId && (
                    <div className="pt-2 border-t mt-2">
                      <DetailRow
                        icon={Truck}
                        label="Assigned Driver"
                        value={selectedRide.assignedDriverId}
                        color="indigo"
                      />
                    </div>
                  )}
                </div>

                {modalMode === "Detail" && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 className="font-semibold text-gray-800">
                      Additional Notes
                    </h5>
                    <p className="text-sm text-gray-600">
                      This section would include additional data like luggage
                      size, special requests, payment method, and routing notes
                      if available.
                    </p>
                  </div>
                )}
              </div>

              {/* 2. MANUAL ASSIGNMENT (Only visible in Assign Mode) */}
              {modalMode === "Assign" && (
                <div className="col-span-2 space-y-4">
                  <ManualAssignmentContent ride={selectedRide} />
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
              {modalMode === "Assign" &&
                (selectedRide.status === "Pending" ||
                  selectedRide.status === "Assigned") && (
                  <button
                    onClick={handleManualAssign}
                    disabled={!manualDriverId.trim()}
                    className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors disabled:bg-indigo-300"
                  >
                    Confirm Assignment to {manualDriverId || "Driver"}
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
    <span className="w-2/3 text-gray-800">{value}</span>
  </div>
);

export default PendingRidesPage;
