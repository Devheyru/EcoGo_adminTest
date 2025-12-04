"use client";
import React, { useState, useMemo, useCallback } from "react";
import {
  MoreVertical,
  ChevronDown,
  X,
  Map,
  DollarSign,
  Download,
  Calendar,
  Clock,
  Car,
  User,
  Phone,
  ArrowLeft,
  Search,
  Filter,
  Users,
} from "lucide-react";

// --- BRAND COLOR & CONSTANTS ---
const BRAND_GREEN = "emerald"; // Tailwind color: emerald-500
const ITEMS_PER_PAGE = 10;

// --- TYPESCRIPT INTERFACES (Data Structure) ---

interface FareSummary {
  netRideFare: number;
  totalBill: number;
}

interface RideDetailsInfo {
  status: string;
  starting: string;
  endedAt: string;
  startTime: string;
  endTime: string;
  timeMinutes: number;
  distanceKm: number;
  coupon: string;
}

interface VehicleInfo {
  number: string;
  makeModel: string;
  vehicleType: string;
}

interface DriverInfo {
  name: string;
  phone: string;
}

interface RiderInfo {
  name: string;
  phone: string;
  isRental: "Yes" | "No";
}

interface TransactionHistory {
  paymentMethod: string;
  paidAmount: number;
  rewardsEarned: number;
  transactionDate: string;
  status: "Completed" | "Pending" | "Failed";
}

interface Ride {
  srNo: number;
  id: string;
  bookingId: string;
  rider: RiderInfo;
  driver: DriverInfo;
  vehicle: VehicleInfo;
  bookedDate: string;
  bookedTime: string;
  tripStatus:
    | "Trip Started"
    | "Trip Completed"
    | "Cancelled by rider"
    | "Cancelled by driver";
  type: "Regular" | "Shared" | "Premium";
  detailData: {
    rideDetails: RideDetailsInfo;
    fareSummary: FareSummary;
    riderInfo: RiderInfo;
    driverInfo: DriverInfo;
    vehicleInfo: VehicleInfo;
  };
  transaction: TransactionHistory;
}

// --- MOCK DATA GENERATION ---

const generateMockRide = (srNo: number): Ride => ({
  srNo: srNo,
  id: `E764B55${srNo + 500}`,
  bookingId: `CH0154887${srNo}`,
  rider: {
    name: srNo % 3 === 0 ? "Jane Doe" : "John Test",
    phone: `66778899${10 + srNo}`,
    isRental: srNo % 4 === 0 ? "Yes" : "No",
  },
  driver: {
    name: `DriverSam ${srNo}`,
    phone: `112233445${srNo}`,
  },
  vehicle: {
    number: `CH0154887${srNo}`,
    makeModel: `Mahindra/XUV${srNo % 3 === 0 ? "300" : "500"}`,
    vehicleType: "Taxi",
  },
  bookedDate: `0${srNo % 12 || 1}/12/2025`,
  bookedTime: srNo % 2 === 0 ? "19:54" : "10:30",
  tripStatus:
    srNo % 4 === 0
      ? "Trip Completed"
      : srNo % 4 === 1
      ? "Trip Started"
      : srNo % 4 === 2
      ? "Cancelled by rider"
      : "Cancelled by driver",
  type: srNo % 5 === 0 ? "Shared" : "Regular",
  detailData: {
    rideDetails: {
      status: srNo % 4 === 0 ? "Trip Completed" : "Trip Started",
      starting: "12 Nieuwhout St, Wilgehof, Bloemfontein, 9301, South Africa",
      endedAt:
        srNo % 4 === 0
          ? "Raymond Mhlaba St, Noordhoek, Bloemfontein, 9301, South Africa"
          : "~NA~",
      startTime: "04/12/2025 19:54",
      endTime: srNo % 4 === 0 ? "04/12/2025 20:15" : "~NA~",
      timeMinutes: srNo % 4 === 0 ? 21 : 0,
      distanceKm:
        srNo % 4 === 0 ? parseFloat((Math.random() * 10).toFixed(2)) : 0.0,
      coupon: srNo % 7 === 0 ? "WELCOME20" : "~NA~",
    },
    fareSummary: {
      netRideFare:
        srNo % 4 === 0
          ? parseFloat((50 + Math.random() * 100).toFixed(2))
          : 0.0,
      totalBill:
        srNo % 4 === 0
          ? parseFloat((50 + Math.random() * 100).toFixed(2))
          : 0.0,
    },
    riderInfo: {
      name: srNo % 3 === 0 ? "Jane Doe" : "John Test",
      phone: `66778899${10 + srNo}`,
      isRental: srNo % 4 === 0 ? "Yes" : "No",
    },
    driverInfo: {
      name: `DriverSam ${srNo}`,
      phone: `112233445${srNo}`,
    },
    vehicleInfo: {
      number: `CH0154887${srNo}`,
      makeModel: `Mahindra/XUV${srNo % 3 === 0 ? "300" : "500"}`,
      vehicleType: "Taxi",
    },
  },
  transaction: {
    paymentMethod: srNo % 3 === 0 ? "Card Ending ****1234" : "Cash",
    paidAmount:
      srNo % 4 === 0 ? parseFloat((50 + Math.random() * 100).toFixed(2)) : 0.0,
    rewardsEarned: srNo % 4 === 0 ? (srNo % 10) * 5 : 0,
    transactionDate: `0${srNo % 12 || 1}/12/2025`,
    status: srNo % 4 === 0 ? "Completed" : "Pending",
  },
});

const mockRides: Ride[] = Array.from({ length: 25 }, (_, i) =>
  generateMockRide(i + 1)
);

// --- UTILITY COMPONENTS ---

/**
 * Custom Dropdown Menu for the Action Column
 */
const ActionMenu: React.FC<{
  ride: Ride;
  onAction: (action: string) => void;
}> = ({ ride, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isCompleted = ride.tripStatus === "Trip Completed";

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 w-48 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onAction("viewDetail");
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <Users className="w-4 h-4 mr-2" />
              View Detail
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onAction("transactionHistory");
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Transaction History
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onAction("invoke");
              }}
              disabled={!isCompleted}
              className={`flex items-center w-full px-4 py-2 text-sm ${
                isCompleted
                  ? "text-green-700 hover:bg-green-50"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              role="menuitem"
              title={
                !isCompleted
                  ? "Invoke is only available for completed trips"
                  : "Download ride data"
              }
            >
              <Download className="w-4 h-4 mr-2" />
              Invoke (Download)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Status Badge for the table
 */
const StatusBadge: React.FC<{ status: Ride["tripStatus"] }> = ({ status }) => {
  let colorClass = "bg-gray-200 text-gray-800";
  if (status === "Trip Completed") {
    colorClass = "bg-green-100 text-green-700 border border-green-300";
  } else if (status.startsWith("Cancelled")) {
    colorClass = "bg-red-100 text-red-700 border border-red-300";
  } else if (status === "Trip Started") {
    colorClass = "bg-yellow-100 text-yellow-700 border border-yellow-300";
  }

  const tooltipText = status.startsWith("Cancelled")
    ? status.split(": ")[1] || status
    : status;

  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full ${colorClass} truncate max-w-[150px]`}
      title={tooltipText}
    >
      {status.split(" ")[0]}
    </span>
  );
};

// --- MODALS AND DRAWERS ---

/**
 * 2. Ride Details Modal/Pop-up (Second Screenshot)
 */
const RideDetailsModal: React.FC<{
  ride: Ride | null;
  onClose: () => void;
}> = ({ ride, onClose }) => {
  if (!ride) return null;

  const { detailData } = ride;

  const DetailItem: React.FC<{
    label: string;
    value: string | number;
    icon: React.ReactNode;
  }> = ({ label, value, icon }) => (
    <div className="flex items-center space-x-2 text-gray-700">
      {icon}
      <div>
        <div className="text-xs font-medium text-gray-500">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-bold flex items-center text-gray-800">
            <ArrowLeft
              className="w-5 h-5 mr-3 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={onClose}
            />
            Ride Details (ID: {ride.id})
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-grow p-6 overflow-y-auto space-y-8">
          {/* Ride Route Map */}
          <section>
            <h3 className="mb-4 text-lg font-semibold text-gray-800 flex items-center">
              <Map className="w-5 h-5 mr-2 text-emerald-600" /> Ride Route Map
            </h3>
            <div className="h-64 overflow-hidden border border-gray-200 rounded-lg bg-gray-100 flex items-center justify-center">
              {/* Placeholder for the map image */}
              <img
                src="https://placehold.co/800x400/E5F7ED/10B981?text=Map+Placeholder"
                alt="Ride route map"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://placehold.co/800x400/E5F7ED/10B981?text=Map+Unavailable";
                }}
              />
            </div>
          </section>

          {/* Information Section */}
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Rider Information */}
            <InfoCard
              title="Rider Information"
              icon={<User className="w-5 h-5 text-blue-500" />}
            >
              <DetailItem
                label="Rider Name"
                value={detailData.riderInfo.name}
                icon={<User className="w-4 h-4 text-blue-400" />}
              />
              <DetailItem
                label="Rider Phone"
                value={detailData.riderInfo.phone}
                icon={<Phone className="w-4 h-4 text-blue-400" />}
              />
              <DetailItem
                label="Is Rental"
                value={detailData.riderInfo.isRental}
                icon={<Car className="w-4 h-4 text-blue-400" />}
              />
            </InfoCard>

            {/* Driver Information */}
            <InfoCard
              title="Driver Information"
              icon={<Car className="w-5 h-5 text-orange-500" />}
            >
              <DetailItem
                label="Driver Name"
                value={detailData.driverInfo.name}
                icon={<User className="w-4 h-4 text-orange-400" />}
              />
              <DetailItem
                label="Driver Phone"
                value={detailData.driverInfo.phone}
                icon={<Phone className="w-4 h-4 text-orange-400" />}
              />
            </InfoCard>

            {/* Vehicle Information */}
            <InfoCard
              title="Vehicle Information"
              icon={<Car className="w-5 h-5 text-purple-500" />}
            >
              <DetailItem
                label="Number"
                value={detailData.vehicleInfo.number}
                icon={<Car className="w-4 h-4 text-purple-400" />}
              />
              <DetailItem
                label="Make Model"
                value={detailData.vehicleInfo.makeModel}
                icon={<Car className="w-4 h-4 text-purple-400" />}
              />
              <DetailItem
                label="Vehicle Type"
                value={detailData.vehicleInfo.vehicleType}
                icon={<Car className="w-4 h-4 text-purple-400" />}
              />
            </InfoCard>
          </div>

          {/* Ride Details & Fare Summary */}
          <div className="grid gap-8 lg:grid-cols-2">
            <section>
              <h3 className="mb-4 text-lg font-semibold text-gray-800 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-emerald-600" /> Ride Details
              </h3>
              <div className="p-4 space-y-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <DetailRow
                  label="Status"
                  value={
                    <StatusBadge
                      status={
                        detailData.rideDetails.status as Ride["tripStatus"]
                      }
                    />
                  }
                />
                <DetailRow
                  label="Start Time"
                  value={detailData.rideDetails.startTime}
                  icon={<Calendar />}
                />
                <DetailRow
                  label="End Time"
                  value={detailData.rideDetails.endTime}
                  icon={<Calendar />}
                />
                <DetailRow
                  label="Starting From"
                  value={detailData.rideDetails.starting}
                  icon={<Map />}
                />
                <DetailRow
                  label="Ended At"
                  value={detailData.rideDetails.endedAt}
                  icon={<Map />}
                />
                <DetailRow
                  label="Time (Minutes)"
                  value={`${detailData.rideDetails.timeMinutes} Min`}
                  icon={<Clock />}
                />
                <DetailRow
                  label="Distance (Km)"
                  value={`${detailData.rideDetails.distanceKm} Km`}
                  icon={<Map />}
                />
                <DetailRow
                  label="Coupon"
                  value={detailData.rideDetails.coupon}
                  icon={<DollarSign />}
                />
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-lg font-semibold text-gray-800 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-emerald-600" /> Fare
                Summary
              </h3>
              <div className="p-4 space-y-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <DetailRow
                  label="Net Ride Fare"
                  value={`$${detailData.fareSummary.netRideFare}`}
                />
                <DetailRow
                  label="Total Bill"
                  value={`$${detailData.fareSummary.totalBill}`}
                />
                <div className="pt-3 mt-3 border-t">
                  <DetailRow
                    label="Final Amount Paid"
                    value={`$${detailData.fareSummary.totalBill}`}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-md space-y-3">
    <h4 className="flex items-center text-md font-bold mb-4 text-gray-800 border-b pb-2">
      {icon}
      <span className="ml-2">{title}</span>
    </h4>
    {children}
  </div>
);

const DetailRow: React.FC<{
  label: string;
  value: string | number | React.ReactNode;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center py-1">
    <div className="text-sm text-gray-500 flex items-center">
      {icon && <span className="w-4 h-4 mr-2 text-emerald-500">{icon}</span>}
      {label}
    </div>
    <div
      className={`text-sm font-medium ${
        typeof value === "string" && value.startsWith("$")
          ? "text-gray-800 font-bold"
          : "text-gray-700"
      }`}
    >
      {value}
    </div>
  </div>
);

/**
 * 3. Transaction History Drawer/Pop-up
 */
const TransactionHistoryDrawer: React.FC<{
  ride: Ride | null;
  onClose: () => void;
}> = ({ ride, onClose }) => {
  if (!ride) return null;

  const { transaction } = ride;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div
          className={`p-5 flex items-center justify-between text-white bg-${BRAND_GREEN}-600`}
        >
          <h2 className="text-xl font-bold flex items-center">
            <DollarSign className="w-6 h-6 mr-2" />
            Transaction History
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white hover:text-emerald-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-grow overflow-y-auto space-y-6">
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-inner">
            <h3 className="mb-3 text-lg font-semibold text-gray-800 border-b pb-2">
              Payment Details
            </h3>
            <DetailRow
              label="Payment Method"
              value={transaction.paymentMethod}
            />
            <DetailRow
              label="Amount Paid"
              value={`$${transaction.paidAmount}`}
            />
            <DetailRow
              label="Transaction Date"
              value={transaction.transactionDate}
            />
            <div className="mt-3 pt-3 border-t">
              <DetailRow
                label="Transaction Status"
                value={
                  <span
                    className={`font-bold ${
                      transaction.status === "Completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {transaction.status}
                  </span>
                }
              />
            </div>
          </div>

          <div className="p-4 border border-green-200 rounded-lg bg-green-50 shadow-inner">
            <h3 className="mb-3 text-lg font-semibold text-green-800 border-b border-green-300 pb-2">
              Rewards Earned
            </h3>
            <p className="text-4xl font-extrabold text-green-600">
              {transaction.rewardsEarned}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Reward Points received for this ride.
            </p>
          </div>

          {/* Additional info block */}
          <div className="text-sm p-4 border rounded-lg border-blue-200 bg-blue-50">
            <p className="font-medium text-blue-700">Note:</p>
            <p className="text-gray-600">
              This history is based on the final, settled transaction record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APPLICATION COMPONENT ---

const CustomerRides: React.FC = () => {
  const [rides] = useState<Ride[]>(mockRides);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTransactionDrawerOpen, setIsTransactionDrawerOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  // Simple filter states (for UI representation)
  const [filterBookingId, setFilterBookingId] = useState("");
  const [filterDriver, setFilterDriver] = useState("");
  const [filterStatus, setFilterStatus] = useState("Does not matter");

  // --- COMPUTED VALUES FOR PAGINATION ---
  const totalPages = Math.ceil(rides.length / ITEMS_PER_PAGE);
  const paginatedRides = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return rides.slice(start, start + ITEMS_PER_PAGE);
  }, [rides, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- ACTION HANDLERS ---

  /**
   * 4. Invoke Handler (Download CSV)
   */
  const handleInvokeDownload = useCallback((ride: Ride) => {
    if (ride.tripStatus !== "Trip Completed") {
      console.error("Download is only available for completed trips.");
      return;
    }

    const detail = ride.detailData;

    // Data structure for the CSV download (flattening the detail data)
    const csvData = [
      ["Field", "Value"],
      ["Booking ID", ride.bookingId],
      ["Rider Name", detail.riderInfo.name],
      ["Rider Phone", detail.riderInfo.phone],
      ["Driver Name", detail.driverInfo.name],
      ["Driver Phone", detail.driverInfo.phone],
      ["Vehicle Number", detail.vehicleInfo.number],
      ["Vehicle Model", detail.vehicleInfo.makeModel],
      ["Vehicle Type", detail.vehicleInfo.vehicleType],
      ["Trip Status", detail.rideDetails.status],
      ["Start Time", detail.rideDetails.startTime],
      ["End Time", detail.rideDetails.endTime],
      ["Starting Location", detail.rideDetails.starting],
      ["Ending Location", detail.rideDetails.endedAt],
      ["Time (Minutes)", detail.rideDetails.timeMinutes],
      ["Distance (Km)", detail.rideDetails.distanceKm],
      ["Coupon Used", detail.rideDetails.coupon],
      ["Net Ride Fare", `$${detail.fareSummary.netRideFare}`],
      ["Total Bill", `$${detail.fareSummary.totalBill}`],
    ];

    const csvContent = csvData.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ride_details_${ride.id}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`Successfully invoked/downloaded CSV for ride: ${ride.id}`);
  }, []);

  /**
   * General Action Dispatcher from the table menu
   */
  const handleAction = useCallback(
    (action: string, ride: Ride) => {
      setSelectedRide(ride);
      switch (action) {
        case "viewDetail":
          setIsDetailsModalOpen(true);
          break;
        case "transactionHistory":
          setIsTransactionDrawerOpen(true);
          break;
        case "invoke":
          handleInvokeDownload(ride);
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
    },
    [handleInvokeDownload]
  );

  const handleCloseDetail = () => {
    setIsDetailsModalOpen(false);
    setSelectedRide(null);
  };

  const handleCloseTransaction = () => {
    setIsTransactionDrawerOpen(false);
    setSelectedRide(null);
  };

  // --- RENDER FUNCTIONS ---

  const renderPagination = () => (
    <div className="flex items-center justify-between py-3 border-t">
      <div className="text-sm text-gray-700">
        Showing{" "}
        <span className="font-medium">
          {(currentPage - 1) * ITEMS_PER_PAGE + 1}
        </span>{" "}
        to{" "}
        <span className="font-medium">
          {Math.min(currentPage * ITEMS_PER_PAGE, rides.length)}
        </span>{" "}
        of <span className="font-medium">{rides.length}</span> results
      </div>
      <div className="flex space-x-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        {totalPages > 0 &&
          Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                page === currentPage
                  ? `bg-${BRAND_GREEN}-600 text-white`
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-8 bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header/Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500">
          <span className="font-semibold text-gray-700">Home</span> / Customer
          rides
        </div>

        {/* Main Card */}
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h1 className="mb-6 text-2xl font-bold text-gray-800 border-b pb-3">
            Customer Ride History
          </h1>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-gray-50 border rounded-lg">
            <Filter className="w-6 h-6 text-gray-500" />
            <div className="flex flex-col flex-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Booking ID
              </label>
              <input
                type="text"
                value={filterBookingId}
                onChange={(e) => setFilterBookingId(e.target.value)}
                placeholder="Vehicle registration number"
                className="p-2 border border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col flex-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Driver
              </label>
              <input
                type="text"
                value={filterDriver}
                onChange={(e) => setFilterDriver(e.target.value)}
                placeholder="Driver Name"
                className="p-2 border border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col flex-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm appearance-none bg-white focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option>Does not matter</option>
                  <option>Trip Completed</option>
                  <option>Trip Started</option>
                  <option>Cancelled by rider</option>
                  <option>Cancelled by driver</option>
                </select>
                <ChevronDown className="absolute w-4 h-4 text-gray-400 right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            {/* Additional Date Filters Placeholder */}
            <div className="flex flex-col flex-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Booked Date From
              </label>
              <input
                type="date"
                className="p-2 border border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col flex-1 min-w-[150px]">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Booked Date To
              </label>
              <input
                type="date"
                className="p-2 border border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <button
              className={`px-4 py-2 text-sm font-semibold text-white bg-${BRAND_GREEN}-600 rounded-lg hover:bg-${BRAND_GREEN}-700 flex items-center`}
            >
              <Search className="w-4 h-4 mr-1" /> Search
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
              Clear search
            </button>
          </div>

          {/* List of Rides Table */}
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            List of ride requests accepted by drivers
          </h2>
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`bg-${BRAND_GREEN}-50`}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Sr. no
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Rider Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Driver Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Vehicle Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Booked Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Trip Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ride.srNo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ride.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-semibold">{ride.rider.name}</div>
                      <div className="text-xs text-gray-500">
                        {ride.rider.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-semibold">{ride.driver.name}</div>
                      <div className="text-xs text-gray-500">
                        {ride.driver.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-semibold">{ride.vehicle.number}</div>
                      <div className="text-xs text-gray-500">
                        {ride.vehicle.makeModel}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-semibold">{ride.bookedDate}</div>
                      <div className="text-xs text-gray-500">
                        {ride.bookedTime}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <StatusBadge status={ride.tripStatus} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {ride.type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <ActionMenu
                        ride={ride}
                        onAction={(action) => handleAction(action, ride)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {rides.length > ITEMS_PER_PAGE && renderPagination()}
        </div>
      </div>

      {/* Conditional Modals/Drawers */}
      {isDetailsModalOpen && selectedRide && (
        <RideDetailsModal ride={selectedRide} onClose={handleCloseDetail} />
      )}

      {isTransactionDrawerOpen && selectedRide && (
        <TransactionHistoryDrawer
          ride={selectedRide}
          onClose={handleCloseTransaction}
        />
      )}
    </div>
  );
};

export default CustomerRides;
